import fs from 'node:fs';
import path from 'node:path';
import { WORKSPACES_DIR } from '../config.js';

const MAX_LENGTH = 40;

export const slugify = (name: string) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_LENGTH)
    .replace(/-+$/g, '');
  return slug || 'project';
};

export const uniqueSlug = (name: string, existingIds: string[]) => {
  const base = slugify(name);
  const taken = (slug: string) => existingIds.includes(slug) || fs.existsSync(path.join(WORKSPACES_DIR, slug));
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};
