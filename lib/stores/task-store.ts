"use client";

import { create } from "zustand";
import { tasks as mockTasks, type Task } from "@/lib/orbit-data";
import { useActivityStore } from "@/lib/stores/activity-store";
import { createStoreId } from "@/lib/stores/ids";
import type { Schedule } from "@/lib/stores/types";

type TaskInput = Omit<Task, "id" | "completed">;

type TaskState = {
  tasks: Task[];
  schedule: Schedule;
  createTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  renameProjectTasks: (projectId: string, name: string) => void;
  deleteProjectTasks: (projectId: string) => void;
  setSchedule: (schedule: Schedule | ((current: Schedule) => Schedule)) => void;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks.map((task) => ({ ...task })),
  schedule: {},
  createTask: (input) => {
    const task = { ...input, id: createStoreId("task"), completed: false };
    set((state) => ({ tasks: [task, ...state.tasks] }));
    useActivityStore.getState().logActivity("Created task", task.title);
  },
  updateTask: (id, input) => {
    if (!get().tasks.some((task) => task.id === id)) return;
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...input } : task,
      ),
    }));
    useActivityStore.getState().logActivity("Updated task", input.title);
  },
  toggleTask: (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) return;
    set((state) => ({
      tasks: state.tasks.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    }));
    useActivityStore
      .getState()
      .logActivity(task.completed ? "Reopened task" : "Completed task", task.title);
  },
  deleteTask: (id) =>
    set((state) => {
      const schedule = { ...state.schedule };
      delete schedule[id];
      return {
        tasks: state.tasks.filter((task) => task.id !== id),
        schedule,
      };
    }),
  renameProjectTasks: (projectId, name) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.projectId === projectId ? { ...task, project: name } : task,
      ),
    })),
  deleteProjectTasks: (projectId) =>
    set((state) => {
      const deletedIds = new Set(
        state.tasks
          .filter((task) => task.projectId === projectId)
          .map((task) => task.id),
      );
      return {
        tasks: state.tasks.filter((task) => task.projectId !== projectId),
        schedule: Object.fromEntries(
          Object.entries(state.schedule).filter(([id]) => !deletedIds.has(id)),
        ),
      };
    }),
  setSchedule: (nextSchedule) =>
    set((state) => ({
      schedule:
        typeof nextSchedule === "function"
          ? nextSchedule(state.schedule)
          : nextSchedule,
    })),
}));
