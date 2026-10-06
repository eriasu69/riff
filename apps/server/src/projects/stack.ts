import fs from 'node:fs/promises';
import path from 'node:path';
import { WORKSPACES_DIR } from '../config.js';

const LABELS: Array<[RegExp, string]> = [
  [/^react$/, 'React'],
  [/^vite$/, 'Vite'],
  [/^typescript$/, 'TypeScript'],
  [/^(idb|dexie)$/, 'IndexedDB'],
  [/^vite-plugin-pwa$/, 'PWA'],
  [/^tailwindcss$/, 'Tailwind'],
  [/^vitest$/, 'Vitest'],
  [/^zustand$/, 'Zustand'],
  [/^react-router(-dom)?$/, 'React Router'],
  [/^@tanstack\/react-query$/, 'React Query'],
  [/^framer-motion$/, 'Framer Motion'],
];

export const readStack = async (id: string) => {
  try {
    const raw = await fs.readFile(path.join(WORKSPACES_DIR, id, 'package.json'), 'utf8');
    const pkg = JSON.parse(raw) as { dependencies?: object; devDependencies?: object };
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const labels = LABELS.filter(([re]) => names.some((n) => re.test(n))).map(([, label]) => label);
    return [...new Set(labels)];
  } catch {
    return [];
  }
};
