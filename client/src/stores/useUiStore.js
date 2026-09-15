import { create } from 'zustand';

export const useUiStore = create((set) => ({
  createWorkspaceOpen: false,
  openCreateWorkspace: () => set({ createWorkspaceOpen: true }),
  closeCreateWorkspace: () => set({ createWorkspaceOpen: false }),

  createProjectOpen: false,
  openCreateProject: () => set({ createProjectOpen: true }),
  closeCreateProject: () => set({ createProjectOpen: false }),
}));