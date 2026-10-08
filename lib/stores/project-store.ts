"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { createStoreId } from "@/lib/stores/ids";
import type { Project } from "@/lib/stores/types";

type ProjectInput = Omit<Project, "id" | "progress" | "members">;

type ProjectState = {
  projects: Project[];
  createProject: (input: ProjectInput) => void;
  updateProject: (id: string, input: ProjectInput) => void;
  deleteProject: (id: string) => void;
};

const initialData = getMockWorkspaceData();

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: initialData.projects,
  createProject: (input) => {
    const project: Project = {
      ...input,
      id: createStoreId("project"),
      progress: 0,
      members: [useProfileStore.getState().profile.id],
    };
    set((state) => ({ projects: [project, ...state.projects] }));
    useActivityStore.getState().logActivity("Created project", project.name);
  },
  updateProject: (id, input) => {
    if (!get().projects.some((project) => project.id === id)) return;
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, ...input } : project,
      ),
    }));
    useTaskStore.getState().renameProjectTasks(id, input.name);
    useActivityStore.getState().logActivity("Updated project", input.name);
  },
  deleteProject: (id) => {
    const project = get().projects.find((item) => item.id === id);
    if (!project) return;
    set((state) => ({
      projects: state.projects.filter((item) => item.id !== id),
    }));
    useTaskStore.getState().deleteProjectTasks(id);
    useActivityStore.getState().logActivity("Deleted project", project.name);
  },
}));
