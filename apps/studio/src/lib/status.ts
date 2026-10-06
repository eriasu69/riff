import type { ProjectStatus } from '@riff/shared';

export type StatusTone = 'ok' | 'warn' | 'bad' | 'idle';

const TONES: Record<ProjectStatus, StatusTone> = {
  idle: 'idle',
  stopped: 'idle',
  copying: 'warn',
  git: 'warn',
  installing: 'warn',
  starting: 'warn',
  running: 'ok',
  crashed: 'bad',
  failed: 'bad',
};

const LABELS: Record<ProjectStatus, string> = {
  idle: 'Waiting to start',
  stopped: 'Stopped',
  copying: 'Copying template…',
  git: 'Setting up git…',
  installing: 'Installing dependencies…',
  starting: 'Starting dev server…',
  running: 'Running',
  crashed: 'Preview crashed',
  failed: 'Setup failed',
};

const PROGRESS: Record<ProjectStatus, number> = {
  idle: 0,
  stopped: 0,
  copying: 15,
  git: 35,
  installing: 65,
  starting: 90,
  running: 100,
  crashed: 100,
  failed: 100,
};

export const statusTone = (status: ProjectStatus) => TONES[status];
export const statusLabel = (status: ProjectStatus) => LABELS[status];
export const statusProgress = (status: ProjectStatus) => PROGRESS[status];
export const isCrashed = (status: ProjectStatus) => status === 'crashed' || status === 'failed';
