import { useCallback, useEffect, useState } from 'react';
import type { ProjectDto } from '@riff/shared';
import { listProjects } from '../api/client';

/** Loads the project list once and lets callers add newly created projects. */
export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await listProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback((project: ProjectDto) => {
    setProjects((current) => [...current.filter((p) => p.id !== project.id), project]);
  }, []);

  return { projects, loading, error, add, reload: load };
};
