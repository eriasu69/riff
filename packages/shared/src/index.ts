/**
 * Shared contract between @riff/server and @riff/studio.
 *
 * API:
 *  GET  /api/projects                -> { projects: ProjectDto[] }
 *  POST /api/projects {name}         -> 202 { project: ProjectDto }
 *  GET  /api/projects/:id            -> { project: ProjectDto }   (lazily starts dev server)
 *  POST /api/projects/:id/restart    -> { project: ProjectDto }
 *  WS   /ws/projects/:id             -> sends WsServerEvent JSON
 */
export type ProjectStatus = 'idle' | 'copying' | 'git' | 'installing' | 'starting' | 'running' | 'crashed' | 'failed' | 'stopped';

export interface ProjectRecord {
  id: string;
  name: string;
  createdAt: string;
  sessionId: string | null;
}

export interface ProjectDto extends ProjectRecord {
  status: ProjectStatus;
  port: number | null;
  previewUrl: string;
  stack: string[];
  logTail: string[];
  error: string | null;
}

export type WsServerEvent =
  | { type: 'snapshot'; project: ProjectDto }
  | { type: 'status'; status: ProjectStatus; port: number | null; error: string | null }
  | { type: 'log'; line: string };

export const PREVIEW_PREFIX = '/preview';
export const previewPath = (id: string) => `${PREVIEW_PREFIX}/${id}/`;
