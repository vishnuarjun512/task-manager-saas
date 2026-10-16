"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useConnectionStore } from "@/lib/stores/connection-store";
import {
  apiFetch,
  isApiConfigured,
  SessionExpiredError,
} from "@/lib/api-fetch";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import {
  getTaskProjectReference,
  parseTaskResponse,
  taskRequestBody,
} from "@/lib/task-api";
import { parseProjectsResponse } from "@/lib/project-data";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { hasProjectPermission } from "@/lib/project-roles";
import { findTaskById } from "@/lib/stores/selectors";
import { useStoreHydration } from "@/lib/stores/use-store-hydration";
import { TaskForm } from "@/components/task-form";
import { useApi } from "@/lib/use-api";
import type { TaskInput } from "@/lib/orbit-data";

/** Resolves the requested task from hydrated store data, then handles edits. */
export function TaskEditorPage({
  taskId,
  projectId,
}: {
  taskId?: string;
  projectId?: string;
}) {
  const router = useRouter();
  const { tasks, createTask, updateTask, upsertTask } = useTaskStore();
  const { projects, projectMembers, projectRoles, setWorkspaceProjects } =
    useProjectStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const isHydrated = useStoreHydration();
  const { connections } = useConnectionStore();
  const { profile } = useProfileStore();
  const { user } = useAuthStore();
  const currentUserId = user?.user_id ?? profile.id;
  const { execute } = useApi();
  const [remoteTaskLoadComplete, setRemoteTaskLoadComplete] = useState(false);
  const [remoteTaskLoadError, setRemoteTaskLoadError] = useState<string | null>(
    null,
  );
  const task = findTaskById(tasks, taskId);
  const projectsRef = useRef(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    if (!isHydrated || !taskId || !isApiConfigured) return;
    let cancelled = false;
    execute(() => apiFetch(`/tasks/${encodeURIComponent(taskId)}`, "GET"))
      .then(async (data) => {
        if (cancelled) return;
        const reference = getTaskProjectReference(data);
        let taskProjects = projectsRef.current;
        if (
          reference &&
          !taskProjects.some((item) => item.id === reference.projectId)
        ) {
          const projectData = await execute(() =>
            apiFetch(
              `/projects/${encodeURIComponent(reference.workspaceId)}`,
              "GET",
            ),
          );
          const workspaceProjects = parseProjectsResponse(
            projectData,
            reference.workspaceId,
          );
          if (cancelled) return;
          setWorkspaceProjects(reference.workspaceId, workspaceProjects);
          taskProjects = [
            ...taskProjects.filter(
              (item) => item.workspace_id !== reference.workspaceId,
            ),
            ...workspaceProjects,
          ];
        }
        if (!cancelled) upsertTask(parseTaskResponse(data, taskProjects));
      })
      .catch((error: unknown) => {
        if (!cancelled && !(error instanceof SessionExpiredError)) {
          const message =
            error instanceof Error ? error.message : "Something went wrong.";
          setRemoteTaskLoadError(message);
          toast.error("Task could not be loaded", { description: message });
        }
      })
      .finally(() => {
        if (!cancelled) setRemoteTaskLoadComplete(true);
      });
    return () => {
      cancelled = true;
    };
  }, [execute, isHydrated, setWorkspaceProjects, taskId, upsertTask]);
  const permittedProjects = projects.filter((item) => {
    if (projectId) {
      return (
        item.id === projectId &&
        (task
          ? item.id === task.projectId
          : hasProjectPermission(
              item.id,
              currentUserId,
              "create_tasks",
              projects,
              projectMembers,
              projectRoles,
            ))
      );
    }
    if (task) {
      return (
        item.workspace_id === task.workspace_id &&
        (item.id === task.projectId ||
          hasProjectPermission(
            item.id,
            currentUserId,
            "create_tasks",
            projects,
            projectMembers,
            projectRoles,
          ))
      );
    }
    return (
      item.workspace_id === activeWorkspaceId &&
      hasProjectPermission(
        item.id,
        currentUserId,
        "create_tasks",
        projects,
        projectMembers,
        projectRoles,
      )
    );
  });

  const canEdit = task
    ? hasProjectPermission(
        task.projectId,
        currentUserId,
        "edit_tasks",
        projects,
        projectMembers,
        projectRoles,
      )
    : permittedProjects.length > 0;

  function closeEditor() {
    router.push(
      projectId
        ? `/projects/${encodeURIComponent(projectId)}`
        : task
          ? `/projects/${encodeURIComponent(task.projectId)}`
          : "/tasks",
    );
  }

  if (!isHydrated) {
    return (
      <section className="mx-auto mt-6 max-w-4xl">
        <p className="text-[12px] text-[#858b97]">Loading saved task…</p>
      </section>
    );
  }

  if (taskId && isApiConfigured && !remoteTaskLoadComplete) {
    return (
      <section className="mx-auto mt-6 max-w-4xl">
        <p className="text-[12px] text-[#858b97]">Loading task…</p>
      </section>
    );
  }

  if (taskId && isApiConfigured && remoteTaskLoadError) {
    return (
      <section className="mx-auto mt-6 max-w-4xl">
        <button
          type="button"
          onClick={closeEditor}
          className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium text-[#6755e8]"
        >
          <ArrowLeft size={14} /> Back to tasks
        </button>
        <p className="text-[12px] text-[#858b97]">{remoteTaskLoadError}</p>
      </section>
    );
  }

  if ((taskId && !task) || !canEdit) {
    return (
      <section className="mx-auto mt-6 max-w-4xl">
        <button
          type="button"
          onClick={closeEditor}
          className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium text-[#6755e8]"
        >
          <ArrowLeft size={14} /> Back to tasks
        </button>
        <p className="text-[12px] text-[#858b97]">
          {taskId && !task
            ? "Task not found."
            : "You do not have permission to edit tasks in this project."}
        </p>
      </section>
    );
  }

  return (
    <TaskForm
      key={taskId ?? `new-${projectId ?? "task"}`}
      task={task}
      projectId={projectId}
      projects={permittedProjects}
      tasks={tasks.filter((item) =>
        permittedProjects.some((project) => project.id === item.projectId),
      )}
      currentUserId={currentUserId}
      connections={[
        { id: currentUserId, name: profile.name },
        ...connections
          .filter((connection) => connection.status === "connected")
          .map((connection) => ({
            id: connection.personId,
            name: connection.name,
          })),
      ]}
      onClose={closeEditor}
      onSave={async (input: TaskInput) => {
        if (isApiConfigured) {
          try {
            const data = await execute(() =>
              task
                ? apiFetch(
                    `/tasks/${encodeURIComponent(task.task_id)}`,
                    "PATCH",
                    taskRequestBody(input),
                  )
                : apiFetch(
                    `/projects/${encodeURIComponent(input.projectId)}/tasks`,
                    "POST",
                    taskRequestBody(input),
                  ),
            );
            upsertTask(parseTaskResponse(data, projects));
          } catch (error) {
            if (error instanceof SessionExpiredError) return;
            toast.error("Task could not be saved", {
              description:
                error instanceof Error
                  ? error.message
                  : "Something went wrong.",
            });
            return;
          }
        } else if (task) {
          updateTask(task.task_id, input);
        } else {
          createTask(input);
        }
        const destinationProjectId = projectId ?? (task ? input.projectId : "");
        router.push(
          destinationProjectId
            ? `/projects/${encodeURIComponent(destinationProjectId)}`
            : "/tasks",
        );
      }}
    />
  );
}
