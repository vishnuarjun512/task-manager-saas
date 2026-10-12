"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import type { Task, TaskStatus } from "@/lib/orbit-data";
import { useActivityStore } from "@/lib/stores/activity-store";
import { createStoreId } from "@/lib/stores/ids";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { Schedule, TaskAssignee } from "@/lib/stores/types";

type TaskInput = Omit<
  Task,
  "id" | "completed" | "completed_at" | "created_at" | "updated_at"
>;

type TaskState = {
  tasks: Task[];
  taskAssignees: TaskAssignee[];
  schedule: Schedule;
  createTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  renameProjectTasks: (projectId: string, name: string) => void;
  moveProjectWorkspace: (projectId: string, workspaceId: string) => void;
  setTaskAssignees: (taskId: string, assigneeIds: string[]) => void;
  restrictProjectAssignees: (projectId: string, memberIds: string[]) => void;
  deleteProjectTasks: (projectId: string) => void;
  setSchedule: (schedule: Schedule | ((current: Schedule) => Schedule)) => void;
};

const initialData = getMockWorkspaceData();

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: initialData.tasks.map((task) => ({ ...task })),
  taskAssignees: initialData.task_assignees,
  schedule: {},
  createTask: (input) => {
    const now = new Date().toISOString();
    const completed = input.status === "done";
    const assigneeIds = [...new Set(
      input.assignee_ids ??
        (input.assignee_id ? [input.assignee_id] : []),
    )];
    const task = {
      ...input,
      id: createStoreId("task"),
      assignee_ids: assigneeIds,
      assignee_id: assigneeIds[0] ?? null,
      completed,
      completed_at: completed ? now : null,
      created_at: now,
      updated_at: now,
    };
    set((state) => ({
      tasks: [task, ...state.tasks],
      taskAssignees: [
        ...state.taskAssignees,
        ...makeTaskAssignees(task, assigneeIds),
      ],
    }));
    useActivityStore.getState().logActivity("Created task", task.title);
  },
  updateTask: (id, input) => {
    const currentTask = get().tasks.find((task) => task.id === id);
    if (!currentTask) return;
    const now = new Date().toISOString();
    const completed = input.status === "done";
    const assigneeIds = [...new Set(
      input.assignee_ids ??
        (input.assignee_id ? [input.assignee_id] : []),
    )];
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...input,
              assignee_ids: assigneeIds,
              assignee_id: assigneeIds[0] ?? null,
              completed,
              completed_at: completed ? task.completed_at ?? now : null,
              updated_at: now,
            }
          : task,
      ),
      taskAssignees: [
        ...state.taskAssignees.filter(
          (assignee) => assignee.task_id !== id,
        ),
        ...makeTaskAssignees(
          { ...currentTask, ...input },
          assigneeIds,
        ),
      ],
    }));
    useActivityStore.getState().logActivity("Updated task", input.title);
  },
  setTaskStatus: (id, status) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task || task.status === status) return;
    const now = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              completed: status === "done",
              completed_at:
                status === "done" ? item.completed_at ?? now : null,
              updated_at: now,
            }
          : item,
      ),
    }));
    useActivityStore
      .getState()
      .logActivity("Changed task status", `${task.title} · ${status}`);
  },
  toggleTask: (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) return;
    const now = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              status: item.completed ? "todo" : "done",
              completed_at: item.completed ? null : now,
              updated_at: now,
            }
          : item,
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
        taskAssignees: state.taskAssignees.filter(
          (assignee) => assignee.task_id !== id,
        ),
        schedule,
      };
    }),
  renameProjectTasks: (projectId, name) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.projectId === projectId
          ? { ...task, project: name, updated_at: new Date().toISOString() }
          : task,
      ),
    })),
  moveProjectWorkspace: (projectId, workspaceId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.projectId === projectId
          ? {
              ...task,
              workspace_id: workspaceId,
              updated_at: new Date().toISOString(),
            }
          : task,
      ),
      taskAssignees: state.taskAssignees.map((assignee) =>
        assignee.project_id === projectId
          ? { ...assignee, workspace_id: workspaceId }
          : assignee,
      ),
    })),
  setTaskAssignees: (taskId, assigneeIds) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) return;
    const uniqueIds = [...new Set(assigneeIds)];
    const assignedAt = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              assignee_ids: uniqueIds,
              assignee_id: uniqueIds[0] ?? null,
              updated_at: assignedAt,
            }
          : item,
      ),
      taskAssignees: [
        ...state.taskAssignees.filter(
          (assignee) => assignee.task_id !== taskId,
        ),
        ...makeTaskAssignees(task, uniqueIds, assignedAt),
      ],
    }));
  },
  restrictProjectAssignees: (projectId, memberIds) => {
    const allowed = new Set(memberIds);
    const updatedAt = new Date().toISOString();
    set((state) => {
      const assignmentsByTask = new Map<string, string[]>();
      state.taskAssignees
        .filter((assignee) => assignee.project_id === projectId)
        .forEach((assignee) => {
          if (!allowed.has(assignee.user_id)) return;
          const current = assignmentsByTask.get(assignee.task_id) ?? [];
          assignmentsByTask.set(assignee.task_id, [...current, assignee.user_id]);
        });
      return {
        tasks: state.tasks.map((task) => {
          if (task.projectId !== projectId) return task;
          const assigneeIds = assignmentsByTask.get(task.id) ?? [];
          return {
            ...task,
            assignee_ids: assigneeIds,
            assignee_id: assigneeIds[0] ?? null,
            updated_at: updatedAt,
          };
        }),
        taskAssignees: state.taskAssignees.filter(
          (assignee) =>
            assignee.project_id !== projectId || allowed.has(assignee.user_id),
        ),
      };
    });
  },
  deleteProjectTasks: (projectId) =>
    set((state) => {
      const deletedIds = new Set(
        state.tasks
          .filter((task) => task.projectId === projectId)
          .map((task) => task.id),
      );
      return {
        tasks: state.tasks.filter((task) => task.projectId !== projectId),
        taskAssignees: state.taskAssignees.filter(
          (assignee) => assignee.project_id !== projectId,
        ),
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

function makeTaskAssignees(
    task: Pick<Task, "workspace_id" | "projectId" | "id" | "created_by">,
    userIds: string[],
    assignedAt = new Date().toISOString(),
): TaskAssignee[] {
    return userIds.map((user_id) => ({
      workspace_id: task.workspace_id,
      project_id: task.projectId,
      task_id: task.id,
      user_id,
      assigned_by: useProfileStore.getState().profile.id,
      assigned_at: assignedAt,
    }));
}
