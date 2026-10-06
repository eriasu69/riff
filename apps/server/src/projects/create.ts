import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProjectRecord } from '@riff/shared';
import { TEMPLATE_DIR, WORKSPACES_DIR } from '../config.js';
import { runCommand } from '../lib/exec.js';
import * as manager from '../devserver/manager.js';
import { uniqueSlug } from './slug.js';
import { listProjects, saveProject } from './store.js';

const SKIP = new Set(['node_modules', 'dist']);
const GIT_IDENTITY = ['-c', 'user.name=Riff', '-c', 'user.email=riff@local'];

const copyTemplate = (dest: string) =>
  fs.cp(TEMPLATE_DIR, dest, { recursive: true, filter: (src) => !SKIP.has(path.basename(src)) });

const initGit = async (cwd: string, onLine: (l: string) => void) => {
  await runCommand('git', ['init', '-b', 'main'], { cwd, onLine });
  await runCommand('git', ['add', '-A'], { cwd, onLine });
  await runCommand('git', [...GIT_IDENTITY, 'commit', '-m', 'Scaffold'], { cwd, onLine });
};

const runPipeline = async (id: string) => {
  const cwd = path.join(WORKSPACES_DIR, id);
  const onLine = (line: string) => manager.appendLog(id, line);
  try {
    manager.setStatus(id, 'copying');
    await fs.mkdir(WORKSPACES_DIR, { recursive: true });
    await copyTemplate(cwd);

    manager.setStatus(id, 'git');
    await initGit(cwd, onLine);

    manager.setStatus(id, 'installing');
    await runCommand('pnpm', ['install'], { cwd, onLine });

    await manager.start(id);
  } catch (err) {
    manager.setStatus(id, 'failed', (err as Error).message);
  }
};

export const createProject = async (name: string) => {
  const existing = await listProjects();
  const record: ProjectRecord = {
    id: uniqueSlug(name, existing.map((p) => p.id)),
    name,
    createdAt: new Date().toISOString(),
    sessionId: null,
  };
  await saveProject(record);
  manager.setStatus(record.id, 'copying');
  void runPipeline(record.id);
  return record;
};
