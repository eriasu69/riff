import { create } from 'zustand';

export type Mode = 'sketch' | 'build' | 'polish';
export type Device = 'phone' | 'tablet' | 'web';

const PROJECT_KEY = 'riff.projectId';

const readStoredProjectId = () => {
  try {
    return localStorage.getItem(PROJECT_KEY);
  } catch {
    return null;
  }
};

const writeStoredProjectId = (id: string | null) => {
  try {
    if (id) localStorage.setItem(PROJECT_KEY, id);
    else localStorage.removeItem(PROJECT_KEY);
  } catch {
    // storage unavailable; selection just won't persist
  }
};

interface StudioState {
  mode: Mode;
  device: Device;
  inspect: boolean;
  mood: number;
  density: number;
  craft: number;
  selectedVersion: string;
  projectId: string | null;
  setMode: (mode: Mode) => void;
  setDevice: (device: Device) => void;
  toggleInspect: () => void;
  setMood: (value: number) => void;
  setDensity: (value: number) => void;
  setCraft: (value: number) => void;
  selectVersion: (id: string) => void;
  setProjectId: (id: string | null) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  mode: 'build',
  device: 'phone',
  inspect: false,
  mood: 68,
  density: 32,
  craft: 74,
  selectedVersion: 'v7',
  projectId: readStoredProjectId(),
  setMode: (mode) => set({ mode }),
  setDevice: (device) => set({ device }),
  toggleInspect: () => set((s) => ({ inspect: !s.inspect })),
  setMood: (mood) => set({ mood }),
  setDensity: (density) => set({ density }),
  setCraft: (craft) => set({ craft }),
  selectVersion: (selectedVersion) => set({ selectedVersion }),
  setProjectId: (projectId) => {
    writeStoredProjectId(projectId);
    set({ projectId });
  },
}));
