import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(here, '..', '..', '..');
export const WORKSPACES_DIR = path.join(ROOT, 'workspaces');
export const DATA_FILE = path.join(ROOT, 'data', 'projects.json');
export const TEMPLATE_DIR = path.join(ROOT, 'templates', 'vite-react');
export const SERVER_PORT = Number(process.env.RIFF_SERVER_PORT ?? 8787);
export const OWNER = 'elias';
