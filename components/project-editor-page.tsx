"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectForm } from "@/components/project-form";
import { useConnectionStore } from "@/lib/stores/connection-store";
import { useConnectionHydration } from "@/lib/stores/use-connection-hydration";
import { createDefaultProjectRoles } from "@/lib/project-roles";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { findProjectById } from "@/lib/stores/selectors";
import { useStoreHydration } from "@/lib/stores/use-store-hydration";
import type { ProjectCreateRequest, ProjectInput } from "@/lib/project-types";
import {
  getCreatedProjectId,
  getMemberOptions,
  parseProjectsResponse,
} from "@/lib/project-data";
import { useApi } from "@/lib/use-api";
import {
  apiFetch,
  isApiConfigured,
  SessionExpiredError,
} from "@/lib/api-fetch";

/** Loads the requested project from stored state or the workspace API before editing. */
export function ProjectEditorPage({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const {
    projects,
    projectMembers,
    projectRoles,
    setWorkspaceProjects,
    setProjectAssignments,
    updateProject,
    createProject,
  } = useProjectStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { connections } = useConnectionStore();
  useConnectionHydration();
  const { profile } = useProfileStore();
  const { execute } = useApi();
  const isHydrated = useStoreHydration();
  const [loadAttempted, setLoadAttempted] = useState(false);
  const project = findProjectById(projects, projectId);
  const connectedPeople = getMemberOptions(
    profile.id,
    profile.name,
    profile.email,
    connections,
  );
  const roles =
    projectRoles.filter((role) => role.project_id === projectId).length > 0
      ? projectRoles.filter((role) => role.project_id === projectId)
      : createDefaultProjectRoles(projectId ?? "project-draft");
  const assignments = projectMembers
    .filter((member) => member.project_id === projectId)
    .map(({ user_id, role_id }) => ({ user_id, role_id }));

  useEffect(() => {
    if (
      !isHydrated ||
      !projectId ||
      project ||
      !activeWorkspaceId ||
      !isApiConfigured ||
      loadAttempted
    ) {
      return;
    }

    let cancelled = false;
    execute(() =>
      apiFetch(`/projects/${encodeURIComponent(activeWorkspaceId)}`, "GET"),
    )
      .then((data) => {
        if (!cancelled) {
          setWorkspaceProjects(
            activeWorkspaceId,
            parseProjectsResponse(data, activeWorkspaceId),
          );
        }
      })
      .catch((error: unknown) => {
        if (!cancelled && !(error instanceof SessionExpiredError)) {
          toast.error("Project could not be loaded", {
            description:
              error instanceof Error ? error.message : "Something went wrong.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadAttempted(true);
      });
    return () => {
      cancelled = true;
    };
  }, [
    activeWorkspaceId,
    execute,
    isHydrated,
    loadAttempted,
    project,
    projectId,
    setWorkspaceProjects,
  ]);

  async function saveProject(input: ProjectInput) {
    if (project) {
      const { member_assignments, project_roles, ...projectInput } = input;
      if (isApiConfigured) {
        try {
          await execute(() =>
            apiFetch(`/projects/${encodeURIComponent(project.id)}`, "PATCH", {
              name: input.name,
              description: input.description || null,
              project_color: input.project_color,
              status: input.status,
              visibility: input.visibility,
              start_date: input.start_date,
              due_date: input.due === "No due date" ? null : input.due || null,
              workspace_id: input.workspace_id,
            }),
          );
          await execute(() =>
            apiFetch(
              `/projects/${encodeURIComponent(project.id)}/members`,
              "PUT",
              {
                members: member_assignments.map(({ user_id }) => ({
                  user_id,
                })),
              },
            ),
          );
        } catch (error) {
          if (error instanceof SessionExpiredError) return;
          toast.error("Project could not be updated", {
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong.",
          });
          return;
        }
      }
      updateProject(project.id, projectInput);
      setProjectAssignments(
        project.id,
        input.workspace_id,
        member_assignments,
        project_roles,
      );
      toast.success("Project updated");
      router.push(`/projects/${project.id}`);
      return;
    }

    const request: ProjectCreateRequest = {
      workspace_id: input.workspace_id,
      name: input.name,
      description: input.description || null,
      project_color: input.project_color ?? null,
      status: input.status,
      visibility: input.visibility,
      start_date: input.start_date,
      due_date: input.due === "No due date" ? null : input.due || null,
    };
    if (!isApiConfigured) {
      createProject(input);
      const createdProject = useProjectStore
        .getState()
        .projects.find(
          (item) =>
            item.workspace_id === input.workspace_id &&
            item.name === input.name,
        );
      if (!createdProject) {
        toast.error("Project could not be created locally");
        return;
      }
      setProjectAssignments(
        createdProject.id,
        input.workspace_id,
        input.member_assignments,
        input.project_roles,
      );
      router.push(`/projects/${createdProject.id}`);
      return;
    }
    try {
      const data = await execute(() => apiFetch("/projects", "POST", request));
      if (data?.error) throw new Error(data.message);
      const createdProjectId = getCreatedProjectId(data);
      await execute(() =>
        apiFetch(`/projects/${encodeURIComponent(input.workspace_id)}`, "GET"),
      ).then((response) =>
        setWorkspaceProjects(
          input.workspace_id,
          parseProjectsResponse(response, input.workspace_id),
        ),
      );

      const refreshedProjects = useProjectStore.getState().projects;
      const createdProject =
        refreshedProjects.find((item) => item.id === createdProjectId) ??
        [...refreshedProjects]
          .filter(
            (item) =>
              item.workspace_id === input.workspace_id &&
              item.name === input.name,
          )
          .sort((left, right) =>
            (right.created_at ?? "").localeCompare(left.created_at ?? ""),
          )[0];
      if (!createdProject) {
        throw new Error(
          "The project was created, but it could not be found in the refreshed project list.",
        );
      }
      await execute(() =>
        apiFetch(
          `/projects/${encodeURIComponent(createdProject.id)}/members`,
          "PUT",
          {
            members: input.member_assignments.map(({ user_id }) => ({
              user_id,
            })),
          },
        ),
      );
      setProjectAssignments(
        createdProject.id,
        input.workspace_id,
        input.member_assignments,
        input.project_roles,
      );
      toast.success("Project created");
      router.push(`/projects/${createdProject.id}`);
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      toast.error("Project could not be saved", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  if (projectId && !project) {
    return (
      <section className="mx-auto max-w-4xl">
        <Link
          href="/projects"
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium text-[#6755e8]"
        >
          <ArrowLeft size={14} /> Projects
        </Link>
        <p className="text-[12px] text-[#858b97]">
          {!isHydrated || (isApiConfigured && !loadAttempted)
            ? "Loading project…"
            : !activeWorkspaceId
              ? "Project not found."
              : "Project not found."}
        </p>
      </section>
    );
  }

  return (
    <ProjectForm
      key={project?.id ?? "new-project"}
      project={project}
      connectedPeople={connectedPeople}
      roles={roles}
      assignments={assignments}
      onClose={() =>
        router.push(project ? `/projects/${project.id}` : "/projects")
      }
      onSave={saveProject}
    />
  );
}
