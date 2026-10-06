import type { ProjectDto } from '@riff/shared';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed (${res.status})`);
  return (await res.json()) as T;
};

export const listProjects = async () => (await request<{ projects: ProjectDto[] }>('/api/projects')).projects;

export const createProject = async (name: string) =>
  (
    await request<{ project: ProjectDto }>('/api/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  ).project;

export const getProject = async (id: string) =>
  (await request<{ project: ProjectDto }>(`/api/projects/${encodeURIComponent(id)}`)).project;

export const restartProject = async (id: string) =>
  (await request<{ project: ProjectDto }>(`/api/projects/${encodeURIComponent(id)}/restart`, { method: 'POST' })).project;
