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
      state.workspaces.some((workspace) => workspace.id === id)
        ? { activeWorkspaceId: id }
        : state,
    ),
  createWorkspace: (input) => {
    const workspace = { ...input, id: createStoreId("ws") };
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
      activeWorkspaceId: workspace.id,
    }));
    useActivityStore.getState().logActivity("Created workspace", workspace.name);
  },
  updateWorkspace: (id, input) =>
    set((state) => ({
      workspaces: state.workspaces.map((workspace) =>
        workspace.id === id ? { ...workspace, ...input } : workspace,
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
        (workspace) => workspace.id !== id,
      );
      return {
        workspaces,
        activeWorkspaceId:
          current.activeWorkspaceId === id
            ? workspaces[0].id
            : current.activeWorkspaceId,
      };
    });
  },
}));
