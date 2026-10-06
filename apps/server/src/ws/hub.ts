import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocketServer, type WebSocket } from 'ws';
import type { WsServerEvent } from '@riff/shared';
import { getProject } from '../projects/store.js';
import * as manager from '../devserver/manager.js';

const wss = new WebSocketServer({ noServer: true });
const sockets = new Map<string, Set<WebSocket>>();

export const broadcast = (id: string, event: WsServerEvent) => {
  const payload = JSON.stringify(event);
  sockets.get(id)?.forEach((ws) => ws.readyState === ws.OPEN && ws.send(payload));
};

manager.events.on('event', (id: string, event: manager.ManagerEvent) => broadcast(id, event));

const attach = async (id: string, ws: WebSocket) => {
  const set = sockets.get(id) ?? new Set<WebSocket>();
  set.add(ws);
  sockets.set(id, set);
  ws.on('close', () => set.delete(ws));
  ws.on('error', () => set.delete(ws));

  const record = await getProject(id);
  if (!record) return ws.close(1008, 'unknown project');
  ws.send(JSON.stringify({ type: 'snapshot', project: await manager.toDto(record) } satisfies WsServerEvent));
  manager.ensureRunning(id).catch(() => undefined);
};

export const handleUpgrade = (id: string, req: IncomingMessage, socket: Duplex, head: Buffer) =>
  wss.handleUpgrade(req, socket, head, (ws) => void attach(id, ws));
