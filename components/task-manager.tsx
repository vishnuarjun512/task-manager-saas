"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialog-shell";
import { TaskBoard } from "@/components/task-board";
import { TaskList } from "@/components/task-list";
import type { Task, TaskStatus } from "@/lib/orbit-data";
import {
  apiFetch,
  isApiConfigured,
  SessionExpiredError,
} from "@/lib/api-fetch";
import { parseTasksResponse } from "@/lib/task-api";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { useStoreHydration } from "@/lib/stores/use-store-hydration";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { hasProjectPermission } from "@/lib/project-roles";
import { useApi } from "@/lib/use-api";
import { useAuthStore } from "@/lib/stores/auth-store";

export function TaskManager({ projectId }: { projectId?: string }) {
  const { tasks, deleteTask, setTaskStatus, setProjectTasks } = useTaskStore();
  const { projects, projectMembers, projectRoles } = useProjectStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { profile } = useProfileStore();
  const { user } = useAuthStore();
  const currentUserId = user?.user_id ?? profile.id;
  console.log("Current UserID -> ", currentUserId);
  useStoreHydration();
  const router = useRouter();
  const [view, setView] = useState<"list" | "board">("list");
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const { execute } = useApi();
  const project = projects.find((item) => item.id === projectId);
  const projectScopeId = projectId ? project?.workspace_id : activeWorkspaceId;
  const availableProjects = useMemo(
    () => projects.filter((item) => item.workspace_id === projectScopeId),
    [projectScopeId, projects],
  );
  const availableProjectIds = new Set(availableProjects.map((item) => item.id));

  const visibleTasks = projectId
    ? tasks.filter((task) => task.projectId === projectId)
    : tasks.filter((task) => availableProjectIds.has(task.projectId));

  const availableTaskProjects = availableProjects.filter((item) =>
    hasProjectPermission(
      item.id,
      currentUserId,
      "create_tasks",
      projects,
      projectMembers,
      projectRoles,
    ),
  );

  const canCreateTask =
    project?.created_by === currentUserId || availableTaskProjects.length > 0;

  const visibleProjects = projectId
    ? availableProjects.filter((item) => item.id === projectId)
    : availableProjects;

  useEffect(() => {
    const fetchAllTasks = async () => {
      if (!projectId) return;
      const response = await execute(() =>
        apiFetch(`/tasks/${encodeURIComponent(projectId)}`, "GET"),
      );
      console.log("Response -> ", response);
    };

    fetchAllTasks();
  }, []);

  async function changeTaskStatus(task: Task, status: TaskStatus) {
    if (
      visibleProjects.some((item) => item.id === task.projectId) &&
      hasProjectPermission(
        task.projectId,
        currentUserId,
        "edit_tasks",
        projects,
        projectMembers,
        projectRoles,
      )
    ) {
      if (isApiConfigured) {
        try {
          await execute(() =>
            apiFetch(`/tasks/${encodeURIComponent(task.task_id)}`, "PATCH", {
              status,
            }),
          );
        } catch (error) {
          if (error instanceof SessionExpiredError) return;
          toast.error("Task status could not be updated", {
            description:
              error instanceof Error ? error.message : "Something went wrong.",
          });
          return;
        }
      }
      setTaskStatus(task.task_id, status);
    }
  }

  async function deleteSelectedTask() {
    if (!deletingTask) return;
    if (isApiConfigured) {
      try {
        await execute(() =>
          apiFetch(
            `/tasks/${encodeURIComponent(deletingTask.task_id)}`,
            "DELETE",
          ),
        );
      } catch (error) {
        if (error instanceof SessionExpiredError) return;
        toast.error("Task could not be deleted", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
        return;
      }
    }
    deleteTask(deletingTask.task_id);
    setDeletingTask(null);
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold">
            {projectId ? "Project tasks" : "All tasks"}
          </h2>
          <p className="mt-1 text-[11px] text-[#9297a3]">
            {visibleTasks.filter((task) => !task.completed).length} open ·{" "}
            {visibleTasks.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-md border border-[#e7e9ee] p-0.5 dark:border-white/10"
            aria-label="Task view"
            role="group"
          >
            {(["list", "board"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={view === item}
                onClick={() => setView(item)}
                className={`rounded px-2.5 py-1.5 text-[10px] font-medium capitalize ${
                  view === item
                    ? "bg-[#f0edff] text-[#5b49d4] dark:bg-white/10 dark:text-[#c6bdff]"
                    : "text-[#858b97] hover:bg-[#f6f7f9] dark:hover:bg-white/5"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {canCreateTask ? (
            <Link
              href={`/tasks/new${projectId != undefined ? `?projectId=${projectId}` : ""}`}
              className="flex items-center gap-2 rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#5947d3]"
            >
              <Plus size={14} /> Add task
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white opacity-40"
            >
              <Plus size={14} /> Add task
            </button>
          )}
        </div>
      </div>
      {view === "list" ? (
        <TaskList
          items={visibleTasks}
          onToggleTask={(task) =>
            void changeTaskStatus(task, task.completed ? "todo" : "done")
          }
          onEdit={(task) => {
            if (
              !hasProjectPermission(
                task.projectId,
                currentUserId,
                "edit_tasks",
                projects,
                projectMembers,
                projectRoles,
              )
            ) {
              return;
            }
            router.push(`/tasks/${encodeURIComponent(task.task_id)}/edit`);
          }}
          onDelete={setDeletingTask}
          canToggleTask={(task) =>
            hasProjectPermission(
              task.projectId,
              currentUserId,
              "edit_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
          canEditTask={(task) =>
            hasProjectPermission(
              task.projectId,
              currentUserId,
              "edit_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
          canDeleteTask={(task) =>
            hasProjectPermission(
              task.projectId,
              currentUserId,
              "delete_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
        />
      ) : (
        <TaskBoard
          projects={visibleProjects}
          tasks={visibleTasks}
          onStatusChange={(task, status) => void changeTaskStatus(task, status)}
          onEdit={(task) => {
            router.push(`/tasks/${encodeURIComponent(task.task_id)}/edit`);
          }}
          onDelete={setDeletingTask}
          canEditTask={(task) =>
            hasProjectPermission(
              task.projectId,
              currentUserId,
              "edit_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
          canDeleteTask={(task) =>
            hasProjectPermission(
              task.projectId,
              currentUserId,
              "delete_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
        />
      )}
      {deletingTask && (
        <ConfirmDialog
          title={`Delete ${deletingTask.title}?`}
          description="This task will be removed from the workspace and calendar."
          onClose={() => setDeletingTask(null)}
          onConfirm={() => void deleteSelectedTask()}
        />
      )}
    </section>
  );
}
