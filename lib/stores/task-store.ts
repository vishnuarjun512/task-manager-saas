"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMockWorkspaceData } from "@/lib/mock-api";
import type { Task, TaskStatus } from "@/lib/orbit-data";
import { useActivityStore } from "@/lib/stores/activity-store";
import { createStoreId } from "@/lib/stores/ids";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { Schedule, TaskAssignee } from "@/lib/stores/types";

type TaskState = {
  tasks: Task[];
  taskAssignees: TaskAssignee[];
  schedule: Schedule;
  createTask: (input: Task) => void;
  setProjectTasks: (projectId: string, tasks: Task[]) => void;
  upsertTask: (task: Task) => void;
  updateTask: (task_id: string, input: Task) => void;
  setTaskStatus: (task_id: string, status: TaskStatus) => void;
  toggleTask: (task_id: string) => void;
  deleteTask: (task_id: string) => void;
  renameProjectTasks: (projectId: string, name: string) => void;
  moveProjectWorkspace: (projectId: string, workspaceId: string) => void;
  setTaskAssignees: (taskId: string, assigneeIds: string[]) => void;
  restrictProjectAssignees: (projectId: string, memberIds: string[]) => void;
  deleteProjectTasks: (projectId: string) => void;
  setSchedule: (schedule: Schedule | ((current: Schedule) => Schedule)) => void;
};

const initialData = getMockWorkspaceData();

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: initialData.tasks.map((task) => ({ ...task })),
      taskAssignees: initialData.task_assignees,
      schedule: {},
      setProjectTasks: (projectId, tasks) =>
        set((state) => ({
          tasks: [
            ...state.tasks.filter((task) => task.projectId !== projectId),
            ...tasks,
          ],
          taskAssignees: [
            ...state.taskAssignees.filter(
              (assignee) => assignee.project_id !== projectId,
            ),
            ...tasks.flatMap((task) =>
              makeTaskAssignees(
                task,
                task.assignee_ids ??
                  (task.assignee_id ? [task.assignee_id] : []),
              ),
            ),
          ],
        })),
      upsertTask: (task) =>
        set((state) => ({
          tasks: [
            task,
            ...state.tasks.filter(
              (current) => current.task_id !== task.task_id,
            ),
          ],
        })),
      createTask: (input) => {
        const now = new Date().toISOString();
        const completed = input.status === "done";
        const assigneeIds = [
          ...new Set(
            input.assignee_ids ??
              (input.assignee_id ? [input.assignee_id] : []),
          ),
        ];
        const task = {
          ...input,
          task_id: createStoreId("task"),
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
      updateTask: (task_id, input) => {
        const currentTask = get().tasks.find(
          (task) => task.task_id === task_id,
        );
        if (!currentTask) return;
        const now = new Date().toISOString();
        const completed = input.status === "done";
        const assigneeIds = [
          ...new Set(
            input.assignee_ids ??
              (input.assignee_id ? [input.assignee_id] : []),
          ),
        ];
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.task_id === task_id
              ? {
                  ...task,
                  ...input,
                  assignee_ids: assigneeIds,
                  assignee_id: assigneeIds[0] ?? null,
                  completed,
                  completed_at: completed ? (task.completed_at ?? now) : null,
                  updated_at: now,
                }
              : task,
          ),
          taskAssignees: [
            ...state.taskAssignees.filter(
              (assignee) => assignee.task_id !== task_id,
            ),
            ...makeTaskAssignees({ ...currentTask, ...input }, assigneeIds),
          ],
        }));
        useActivityStore.getState().logActivity("Updated task", input.title);
      },
      setTaskStatus: (task_id, status) => {
        const task = get().tasks.find((item) => item.task_id === task_id);
        if (!task || task.status === status) return;
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.task_id === task_id
              ? {
                  ...item,
                  status,
                  completed: status === "done",
                  completed_at:
                    status === "done" ? (item.completed_at ?? now) : null,
                  updated_at: now,
                }
              : item,
          ),
        }));
        useActivityStore
          .getState()
          .logActivity("Changed task status", `${task.title} · ${status}`);
      },
      toggleTask: (task_id) => {
        const task = get().tasks.find((item) => item.task_id === task_id);
        if (!task) return;
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.task_id === task_id
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
          .logActivity(
            task.completed ? "Reopened task" : "Completed task",
            task.title,
          );
      },
      deleteTask: (task_id) =>
        set((state) => {
          const schedule = { ...state.schedule };
          delete schedule[task_id];
          return {
            tasks: state.tasks.filter((task) => task.task_id !== task_id),
            taskAssignees: state.taskAssignees.filter(
              (assignee) => assignee.task_id !== task_id,
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
        const task = get().tasks.find((item) => item.task_id === taskId);
        if (!task) return;
        const uniqueIds = [...new Set(assigneeIds)];
        const assignedAt = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.task_id === taskId
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
              assignmentsByTask.set(assignee.task_id, [
                ...current,
                assignee.user_id,
              ]);
            });
          return {
            tasks: state.tasks.map((task) => {
              if (task.projectId !== projectId) return task;
              const assigneeIds = assignmentsByTask.get(task.task_id) ?? [];
              return {
                ...task,
                assignee_ids: assigneeIds,
                assignee_id: assigneeIds[0] ?? null,
                updated_at: updatedAt,
              };
            }),
            taskAssignees: state.taskAssignees.filter(
              (assignee) =>
                assignee.project_id !== projectId ||
                allowed.has(assignee.user_id),
            ),
          };
        });
      },
      deleteProjectTasks: (projectId) =>
        set((state) => {
          const deletedIds = new Set(
            state.tasks
              .filter((task) => task.projectId === projectId)
              .map((task) => task.task_id),
          );
          return {
            tasks: state.tasks.filter((task) => task.projectId !== projectId),
            taskAssignees: state.taskAssignees.filter(
              (assignee) => assignee.project_id !== projectId,
            ),
            schedule: Object.fromEntries(
              Object.entries(state.schedule).filter(
                ([task_id]) => !deletedIds.has(task_id),
              ),
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
    }),
    {
      name: "orbit-task-store",
      skipHydration: true,
      partialize: (state) => ({
        tasks: state.tasks,
        taskAssignees: state.taskAssignees,
        schedule: state.schedule,
      }),
    },
  ),
);

function makeTaskAssignees(
  task: Task,
  userIds: string[],
  assignedAt = new Date().toISOString(),
): TaskAssignee[] {
  return userIds.map((user_id) => ({
    workspace_id: task.workspace_id,
    project_id: task.projectId,
    task_id: task.task_id,
    user_id,
    assigned_by: useProfileStore.getState().profile.id,
    assigned_at: assignedAt,
  }));
}
