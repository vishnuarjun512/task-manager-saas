"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialog-shell";
import { useConnectionStore } from "@/lib/stores/connection-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { hasProjectPermission } from "@/lib/project-roles";
import { useStoreHydration } from "@/lib/stores/use-store-hydration";
import type { Project as WorkspaceProject } from "@/lib/stores/types";
import { parseProjectsResponse } from "@/lib/project-data";
import { useApi } from "@/lib/use-api";
import {
  apiFetch,
  isApiConfigured,
  SessionExpiredError,
} from "@/lib/api-fetch";

export function ProjectManager() {
  const {
    projects,
    projectMembers,
    projectRoles,
    setWorkspaceProjects,
    deleteProject,
  } = useProjectStore();
  const { tasks } = useTaskStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { connections } = useConnectionStore();
  const { profile } = useProfileStore();
  const isHydrated = useStoreHydration();
  const [deleting, setDeleting] = useState<WorkspaceProject | null>(null);
  const currentProjects = projects.filter(
    (project) => project.workspace_id === activeWorkspaceId,
  );
  const peopleDirectory = connections
    .filter((connection) => connection.status === "connected")
    .map((connection) => ({
      id: connection.personId,
      name: connection.name,
    }));
  const { execute } = useApi();

  const loadWorkspaceProjects = useCallback(
    async (workspaceId: string) => {
      const data = await execute(() =>
        apiFetch(`/projects/${encodeURIComponent(workspaceId)}`, "GET"),
      );
      setWorkspaceProjects(
        workspaceId,
        parseProjectsResponse(data, workspaceId),
      );
    },
    [execute, setWorkspaceProjects],
  );

  async function confirmDeleteProject(project: WorkspaceProject) {
    if (isApiConfigured) {
      try {
        await execute(() =>
          apiFetch(`/projects/${encodeURIComponent(project.id)}`, "DELETE"),
        );
      } catch (error) {
        if (error instanceof SessionExpiredError) return;
        toast.error("Project deletion failed", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
        return;
      }
    }
    deleteProject(project.id);
    setDeleting(null);
    toast.success("Project deleted");
  }

  useEffect(() => {
    if (!isApiConfigured || !isHydrated || !activeWorkspaceId) return;

    let cancelled = false;
    loadWorkspaceProjects(activeWorkspaceId).catch((error: unknown) => {
      if (cancelled || error instanceof SessionExpiredError) return;
      toast.error("Projects could not be loaded", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId, isHydrated, loadWorkspaceProjects]);

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold">Projects</h2>
          <p className="mt-1 text-[11px] text-[#9297a3]">
            {currentProjects.length} in this workspace
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#5947d3]"
        >
          <Plus size={14} /> New project
        </Link>
      </div>

      {currentProjects.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]">
          <table className="w-full min-w-175 border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eff0f3] text-[9px] font-semibold uppercase tracking-widest text-[#969ba6] dark:border-white/10">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Due date</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Tasks</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((project) => {
                const taskCount = tasks.filter(
                  (task) => task.projectId === project.id,
                ).length;
                const canManage = hasProjectPermission(
                  project.id,
                  profile.id,
                  "manage_members",
                  projects,
                  projectMembers,
                  projectRoles,
                );

                return (
                  <tr
                    key={project.id}
                    className="border-b border-[#eff0f3] last:border-0 dark:border-white/10"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex items-center gap-2 text-[12px] font-medium hover:text-[#6755e8]"
                      >
                        <span
                          className={`size-2 rounded-full ${project.project_color}`}
                        />
                        {project.name}
                      </Link>
                      <p className="mt-1 max-w-75 truncate pl-4 text-[10px] text-[#9297a3]">
                        {project.description}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-[#747a87]">
                      {formatProjectDate(project.due)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 4).map((memberId) => {
                          const member =
                            memberId === profile.id
                              ? profile
                              : peopleDirectory.find(
                                  (person) => person.id === memberId,
                                );
                          return (
                            <span
                              key={memberId}
                              title={member?.name ?? "Workspace member"}
                              className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#eeeaff] text-[9px] font-semibold text-[#5b49d4] dark:border-[#181920] dark:bg-[#292642]"
                            >
                              {(member?.name ?? "M")
                                .split(/\s+/)
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          );
                        })}
                        {project.members.length > 4 && (
                          <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#f2f3f6] text-[8px] text-[#747a87] dark:border-[#181920]">
                            +{project.members.length - 4}
                          </span>
                        )}
                        {project.members.length === 0 && (
                          <span className="text-[10px] text-[#9297a3]">
                            No members
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#f0f1f4]">
                          <div
                            className={`h-full ${project.project_color}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#747a87]">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[11px] text-[#747a87]">
                      {taskCount}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1">
                        {canManage && <Link
                          href={`/projects/${project.id}/edit`}
                          aria-label={`Edit ${project.name}`}
                          className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#f3f4f6] dark:hover:bg-white/10"
                        >
                          <Pencil size={14} />
                        </Link>}
                        {canManage && <button
                          type="button"
                          aria-label={`Delete ${project.name}`}
                          onClick={() => setDeleting(project)}
                          className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#fff1f1] hover:text-[#b93d3d] dark:hover:bg-white/10"
                        >
                          <Trash2 size={14} />
                        </button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#dfe1e8] px-5 py-10 text-center dark:border-white/10">
          <p className="text-[12px] font-medium">
            No projects in this workspace
          </p>
          <p className="mt-1 text-[10px] text-[#9297a3]">
            Create a project to organize its tasks.
          </p>
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          description="Tasks assigned to this project will also be removed. This action cannot be undone."
          onClose={() => setDeleting(null)}
          onConfirm={() => void confirmDeleteProject(deleting)}
        />
      )}
    </section>
  );
}

function formatProjectDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}
