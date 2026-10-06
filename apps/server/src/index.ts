import fs from 'node:fs';
import path from 'node:path';
import { serve, type HttpBindings } from '@hono/node-server';
import { Hono } from 'hono';
import { ROOT, SERVER_PORT } from './config.js';

const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const { projectRoutes } = await import('./routes/projects.js');
const manager = await import('./devserver/manager.js');
const { proxyHttp, proxyUpgrade, previewIdFromUrl } = await import('./devserver/proxy.js');
const { handleUpgrade } = await import('./ws/hub.js');

const app = new Hono<{ Bindings: HttpBindings }>();
app.route('/api/projects', projectRoutes);
app.get('/preview/:id', (c) => c.redirect(`${c.req.path}/`, 301));
app.all('/preview/:id/*', proxyHttp);

const server = serve({ fetch: app.fetch, port: SERVER_PORT, hostname: '127.0.0.1' }, (info) => {
  console.log(`Riff server listening on http://127.0.0.1:${info.port}`);
});

const WS_PATH = /^\/ws\/projects\/([^/?]+)/;

server.on('upgrade', (req, socket, head) => {
  const wsId = WS_PATH.exec(req.url ?? '')?.[1];
  if (wsId) return handleUpgrade(wsId, req, socket, head);
  const previewId = previewIdFromUrl(req.url);
  if (previewId) return proxyUpgrade(previewId, req, socket, head);
  socket.destroy();
});

const shutdown = async () => {
  await manager.stopAll();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
