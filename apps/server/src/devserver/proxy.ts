import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import type { Context } from 'hono';
import type { HttpBindings } from '@hono/node-server';
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response';
import httpProxy from 'http-proxy';
import { PREVIEW_PREFIX } from '@riff/shared';
import * as manager from './manager.js';

const proxy = httpProxy.createProxyServer({ ws: true, xfwd: true });

proxy.on('error', (_err, _req, res) => {
  if (!('writeHead' in res)) return void res.destroy();
  const out = res as ServerResponse;
  if (!out.headersSent) out.writeHead(502, { 'content-type': 'text/plain' });
  out.end('Preview unavailable');
});

const STARTING_HTML = `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="2">
<title>Preview</title><body style="background:#0B0C0F;color:#D5D8DD;font:16px system-ui;display:grid;place-items:center;height:100vh;margin:0">
<p>Preview is starting&hellip;</p></body>`;

const targetOf = (port: number) => `http://127.0.0.1:${port}`;

export const previewIdFromUrl = (url: string | undefined) => {
  const match = new RegExp(`^${PREVIEW_PREFIX}/([^/?]+)/`).exec(url ?? '');
  return match?.[1] ?? null;
};

export const proxyHttp = (c: Context<{ Bindings: HttpBindings }>) => {
  const id = c.req.param('id') ?? '';
  const port = manager.getPortOf(id);
  if (port === null) {
    manager.ensureRunning(id).catch(() => undefined);
    return c.html(STARTING_HTML, 503);
  }
  proxy.web(c.env.incoming, c.env.outgoing, { target: targetOf(port) });
  return RESPONSE_ALREADY_SENT;
};

export const proxyUpgrade = (id: string, req: IncomingMessage, socket: Duplex, head: Buffer) => {
  const port = manager.getPortOf(id);
  if (port === null) return socket.destroy();
  proxy.ws(req, socket, head, { target: targetOf(port) });
};
