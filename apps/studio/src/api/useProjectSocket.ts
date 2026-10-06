import { useCallback, useEffect, useState } from 'react';
import type { ProjectDto, WsServerEvent } from '@riff/shared';
import { getProject, restartProject } from './client';

const LOG_CAP = 200;
const MAX_BACKOFF_MS = 8000;

export const applyEvent = (project: ProjectDto | null, event: WsServerEvent): ProjectDto | null => {
  if (event.type === 'snapshot') return event.project;
  if (!project) return project;
  if (event.type === 'status') return { ...project, status: event.status, port: event.port, error: event.error };
  return { ...project, logTail: [...project.logTail, event.line].slice(-LOG_CAP) };
};

const parseEvent = (data: unknown): WsServerEvent | null => {
  if (typeof data !== 'string') return null;
  try {
    return JSON.parse(data) as WsServerEvent;
  } catch {
    return null;
  }
};

/** Loads a project, keeps it live over WebSocket (with reconnect), and exposes restart. */
export const useProjectSocket = (id: string | null) => {
  const [project, setProject] = useState<ProjectDto | null>(null);

  useEffect(() => {
    setProject(null);
    if (!id) return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    getProject(id)
      .then((loaded) => !disposed && setProject((current) => current ?? loaded))
      .catch(() => undefined);

    const connect = () => {
      const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
      socket = new WebSocket(`${scheme}://${location.host}/ws/projects/${encodeURIComponent(id)}`);
      socket.onopen = () => {
        attempt = 0;
      };
      socket.onmessage = (message) => {
        const event = parseEvent(message.data);
        if (event) setProject((current) => applyEvent(current, event));
      };
      socket.onclose = () => {
        if (disposed) return;
        timer = setTimeout(connect, Math.min(500 * 2 ** attempt, MAX_BACKOFF_MS));
        attempt += 1;
      };
    };
    connect();

    return () => {
      disposed = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [id]);

  const restart = useCallback(async () => {
    if (!id) return;
    setProject(await restartProject(id));
  }, [id]);

  return { project, restart };
};
