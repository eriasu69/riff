import { Hono } from 'hono';
import { createProject } from '../projects/create.js';
import { getProject, listProjects } from '../projects/store.js';
import * as manager from '../devserver/manager.js';

const MAX_NAME = 60;

export const projectRoutes = new Hono();

projectRoutes.get('/', async (c) => {
  const records = await listProjects();
  return c.json({ projects: await Promise.all(records.map(manager.toDto)) });
});

projectRoutes.post('/', async (c) => {
  const body = await c.req.json<{ name?: unknown }>().catch(() => ({ name: undefined }));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > MAX_NAME) {
    return c.json({ error: `name must be 1-${MAX_NAME} characters` }, 400);
  }
  const record = await createProject(name);
  return c.json({ project: await manager.toDto(record) }, 202);
});

projectRoutes.get('/:id', async (c) => {
  const record = await getProject(c.req.param('id'));
  if (!record) return c.json({ error: 'not found' }, 404);
  await manager.ensureRunning(record.id).catch(() => undefined);
  return c.json({ project: await manager.toDto(record) });
});

projectRoutes.post('/:id/restart', async (c) => {
  const record = await getProject(c.req.param('id'));
  if (!record) return c.json({ error: 'not found' }, 404);
  void manager.restart(record.id);
  return c.json({ project: await manager.toDto(record) });
});
