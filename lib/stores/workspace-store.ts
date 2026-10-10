"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import { createStoreId } from "@/lib/stores/ids";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useProjectStore } from "@/lib/stores/project-store";
import type { Workspace } from "@/lib/stores/types";

type WorkspaceInput = Pick<Workspace, "name" | "description">;

type WorkspaceState = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  loaded: boolean;
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (input: WorkspaceInput) => void;
  upsertWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (id: string, input: WorkspaceInput) => void;
  deleteWorkspace: (id: string) => void;
};

const initialData = getMockWorkspaceData();

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: initialData.workspaces,
  activeWorkspaceId: initialData.activeWorkspaceId,
  loaded: true,

  setActiveWorkspace: (id) =>
    set((state) =>
      state.workspaces.some((workspace) => workspace.workspace_id === id)
        ? { activeWorkspaceId: id }
        : state,
    ),

  createWorkspace: (input) => {
    const workspace = { ...input, workspace_id: createStoreId("ws") };
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
      activeWorkspaceId: workspace.workspace_id,
    }));
    useActivityStore
      .getState()
      .logActivity("Created workspace", workspace.name);
  },

  upsertWorkspace: (workspace) =>
    set((state) => {
      const exists = state.workspaces.some(
        (current) => current.workspace_id === workspace.workspace_id,
      );
      return {
        workspaces: exists
          ? state.workspaces.map((current) =>
              current.workspace_id === workspace.workspace_id
                ? { ...current, ...workspace }
                : current,
            )
          : [...state.workspaces, workspace],
      };
    }),

  updateWorkspace: (id, input) =>
    set((state) => ({
      workspaces: state.workspaces.map((workspace) =>
        workspace.workspace_id === id ? { ...workspace, ...input } : workspace,
      ),
    })),

  deleteWorkspace: (id) => {
    const state = get();
    if (state.workspaces.length < 2) return;
    const projects = useProjectStore
      .getState()
      .projects.filter((project) => project.workspaceId === id);
    projects.forEach((project) =>
      useProjectStore.getState().deleteProject(project.id),
    );
    set((current) => {
      const workspaces = current.workspaces.filter(
        (workspace) => workspace.workspace_id !== id,
      );
      return {
        workspaces,
        activeWorkspaceId:
          current.activeWorkspaceId === id
            ? workspaces[0].workspace_id
            : current.activeWorkspaceId,
      };
    });
  },
}));
