export interface PlanItem {
  label: string;
  done: boolean;
}

export interface DiffStat {
  added: number;
  removed: number;
  files: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'claude';
  text: string;
  mention?: string;
  plan?: PlanItem[];
  diff?: DiffStat;
  undoable?: boolean;
}

export const sessionLabel = 'Session · 14 min';

export const messages: ChatMessage[] = [
  { id: 'm1', role: 'user', text: 'Make a plant-watering app. Cozy, a little playful, works offline.' },
  {
    id: 'm2',
    role: 'claude',
    text: 'On it. Here’s the plan:',
    plan: [
      { label: 'Scaffold Vite + React', done: true },
      { label: 'Local-first plant store', done: true },
      { label: '“Today” screen with thirsty plants', done: true },
      { label: 'Watering reminders', done: false },
    ],
    diff: { added: 412, removed: 0, files: 9 },
  },
  { id: 'm3', role: 'user', text: 'These feel too corporate. Rounder, warmer greens.', mention: '@PlantCard' },
  {
    id: 'm4',
    role: 'claude',
    text: 'Softened radii to 20px, swapped to a moss + clay palette, and bumped tap targets to 48px.',
    diff: { added: 38, removed: 21, files: 3 },
    undoable: true,
  },
];

export const riffing = { title: 'Riffing on reminders…', file: 'src/notify.ts', progress: 62 };

export const composerContext = [
  { label: '@PlantCard', tone: 'mention' as const },
  { label: 'moodboard.png', tone: 'file' as const },
];

export const versions = [
  { id: 'v1', label: 'Scaffold' },
  { id: 'v2', label: 'Plant store' },
  { id: 'v3', label: 'Today screen' },
  { id: 'v4', label: 'Empty states' },
  { id: 'v5', label: 'Offline sync' },
  { id: 'v6', label: 'Bigger taps' },
  { id: 'v7', label: 'Warmer cards' },
];

export const autoSavedLabel = 'auto-saved 12s ago';

export interface HealthRow {
  label: string;
  value: string;
  tone: 'ok' | 'warn';
  mono?: boolean;
}

export const health: HealthRow[] = [
  { label: 'Build', value: 'passing', tone: 'ok' },
  { label: 'Tests', value: '14 / 14', tone: 'ok', mono: true },
  { label: 'Accessibility', value: '2 to fix', tone: 'warn' },
  { label: 'Works offline', value: 'yes', tone: 'ok' },
];
