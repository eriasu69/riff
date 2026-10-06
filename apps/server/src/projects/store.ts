import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProjectRecord } from '@riff/shared';
import { DATA_FILE } from '../config.js';

interface StoreFile {
  projects: ProjectRecord[];
}

let writeChain: Promise<void> = Promise.resolve();

const readFile = async (): Promise<StoreFile> => {
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, 'utf8')) as StoreFile;
    return { projects: parsed.projects ?? [] };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { projects: [] };
    throw err;
  }
};

const writeFile = async (data: StoreFile) => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DATA_FILE);
};

/** Serialize read-modify-write cycles so concurrent mutations never clobber each other. */
const mutate = (fn: (data: StoreFile) => void) => {
  const run = writeChain.then(async () => {
    const data = await readFile();
    fn(data);
    await writeFile(data);
  });
  writeChain = run.catch(() => undefined);
  return run;
};

export const listProjects = async () => (await readFile()).projects;

export const getProject = async (id: string) => (await listProjects()).find((p) => p.id === id);

export const saveProject = (record: ProjectRecord) =>
  mutate((data) => {
    const idx = data.projects.findIndex((p) => p.id === record.id);
    if (idx === -1) data.projects.push(record);
    else data.projects[idx] = record;
  });
