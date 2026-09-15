import { create } from 'zustand';

export const useUiStore = create((set) => ({
  createWorkspaceOpen: false,
  openCreateWorkspace: () => set({ createWorkspaceOpen: true }),
  closeCreateWorkspace: () => set({ createWorkspaceOpen: false }),
}));