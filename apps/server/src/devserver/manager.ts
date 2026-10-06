import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import getPort, { portNumbers } from 'get-port';
import treeKill from 'tree-kill';
import { previewPath, type ProjectDto, type ProjectRecord, type ProjectStatus } from '@riff/shared';
import { WORKSPACES_DIR } from '../config.js';
import { pipeLines } from '../lib/exec.js';
import { readStack } from '../projects/stack.js';

const LOG_RING = 200;
const LOG_TAIL = 80;
const READY_TIMEOUT_MS = 60_000;
const POLL_MS = 400;

interface Runtime {
  status: ProjectStatus;
  port: number | null;
  child: ChildProcess | null;
  logs: string[];
  error: string | null;
  startPromise: Promise<void> | null;
  intentional: boolean;
  exited: Promise<void> | null;
}

export type ManagerEvent =
  | { type: 'status'; status: ProjectStatus; port: number | null; error: string | null }
  | { type: 'log'; line: string };

export const events = new EventEmitter();
const runtimes = new Map<string, Runtime>();

const runtimeOf = (id: string) => {
  const existing = runtimes.get(id);
  if (existing) return existing;
  const rt: Runtime = {
    status: 'stopped',
    port: null,
    child: null,
    logs: [],
    error: null,
    startPromise: null,
    intentional: false,
    exited: null,
  };
  runtimes.set(id, rt);
  return rt;
};

const emit = (id: string, event: ManagerEvent) => events.emit('event', id, event);

export const setStatus = (id: string, status: ProjectStatus, error: string | null = null) => {
  const rt = runtimeOf(id);
  rt.status = status;
  rt.error = error;
  emit(id, { type: 'status', status, port: rt.port, error });
};

export const appendLog = (id: string, line: string) => {
  const rt = runtimeOf(id);
  rt.logs.push(line);
  if (rt.logs.length > LOG_RING) rt.logs.shift();
  emit(id, { type: 'log', line });
};

export const getPortOf = (id: string) => {
  const rt = runtimes.get(id);
  return rt?.status === 'running' ? rt.port : null;
};

const workspaceDir = (id: string) => path.join(WORKSPACES_DIR, id);

const canConnect = (port: number) =>
  new Promise<boolean>((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.once('connect', () => (socket.destroy(), resolve(true)));
    socket.once('error', () => (socket.destroy(), resolve(false)));
  });

/** Resolves once the dev server prints `Local:` or accepts TCP connections. */
const waitReady = (id: string, port: number, onLocalLine: (cb: () => void) => void) =>
  new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      done = true;
      resolve();
    };
    onLocalLine(finish);
    const poll = async () => {
      while (!done) {
        if (await canConnect(port)) return finish();
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (runtimeOf(id).child === null) return;
      }
    };
    void poll();
  });

const killTree = (child: ChildProcess) =>
  new Promise<void>((resolve) => {
    if (!child.pid) return resolve();
    treeKill(child.pid, 'SIGTERM', () => resolve());
  });

const crash = (id: string, message: string) => {
  runtimeOf(id).port = null;
  setStatus(id, 'crashed', message);
};

const launch = async (id: string, attempt: number): Promise<void> => {
  const rt = runtimeOf(id);
  rt.intentional = false;
  const port = await getPort({ port: portNumbers(5200, 5399) });
  rt.port = port;
  setStatus(id, 'starting');

  const child = spawn('pnpm', ['dev'], {
    cwd: workspaceDir(id),
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      PORT: String(port),
      RIFF_BASE: previewPath(id),
      BROWSER: 'none',
      FORCE_COLOR: '0',
    },
  });
  rt.child = child;
  rt.exited = new Promise<void>((resolve) => child.once('exit', () => resolve()));

  const localCallbacks: Array<() => void> = [];
  pipeLines(child.stdout, (line) => {
    appendLog(id, line);
    if (line.includes('Local:')) localCallbacks.forEach((cb) => cb());
  });
  pipeLines(child.stderr, (line) => appendLog(id, line));

  const exitCode = new Promise<number | null>((resolve) => child.once('exit', (code) => resolve(code)));
  child.once('error', (err) => crash(id, err.message));
  void exitCode.then((code) => {
    rt.child = null;
    if (rt.intentional || rt.status !== 'running') return;
    crash(id, `exited with code ${code}`);
  });

  let timer: NodeJS.Timeout | undefined;
  const outcome = await Promise.race([
    waitReady(id, port, (cb) => localCallbacks.push(cb)).then(() => 'ready' as const),
    exitCode.then((code) => ({ exit: code })),
    new Promise<'timeout'>((resolve) => (timer = setTimeout(() => resolve('timeout'), READY_TIMEOUT_MS))),
  ]);
  clearTimeout(timer);

  if (outcome === 'ready') return setStatus(id, 'running');
  if (rt.intentional) return;
  if (outcome === 'timeout') {
    rt.intentional = true;
    await killTree(child);
    return crash(id, `dev server not ready after ${READY_TIMEOUT_MS / 1000}s`);
  }
  if (attempt === 0 && rt.logs.slice(-30).some((l) => l.includes('EADDRINUSE'))) return launch(id, 1);
  crash(id, `exited with code ${outcome.exit}`);
};

export const start = (id: string) => {
  const rt = runtimeOf(id);
  if (rt.startPromise) return rt.startPromise;
  if (rt.status === 'running') return Promise.resolve();
  rt.startPromise = launch(id, 0)
    .catch((err: Error) => crash(id, err.message))
    .finally(() => {
      rt.startPromise = null;
    });
  return rt.startPromise;
};

export const stop = async (id: string) => {
  const rt = runtimes.get(id);
  if (!rt?.child) return;
  rt.intentional = true;
  await killTree(rt.child);
  await rt.exited;
  rt.child = null;
  rt.port = null;
  setStatus(id, 'stopped');
};

export const stopAll = async () => {
  await Promise.all([...runtimes.keys()].map(stop));
};

/** Lazily start a workspace that exists on disk but has no live dev server. */
export const ensureRunning = async (id: string) => {
  const status = runtimeOf(id).status;
  if (status !== 'idle' && status !== 'stopped') return;
  if (!fs.existsSync(path.join(workspaceDir(id), 'node_modules'))) return;
  await start(id);
};

export const restart = async (id: string) => {
  await stop(id);
  await start(id);
};

export const toDto = async (record: ProjectRecord): Promise<ProjectDto> => {
  const rt = runtimeOf(record.id);
  return {
    ...record,
    status: rt.status,
    port: rt.port,
    previewUrl: previewPath(record.id),
    stack: await readStack(record.id),
    logTail: rt.logs.slice(-LOG_TAIL),
    error: rt.error,
  };
};
