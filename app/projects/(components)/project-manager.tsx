"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialog-shell";
import {
  MemberDropBoard,
  type AssignablePerson,
} from "@/components/member-drop-board";
import { peopleDirectory, useConnectionStore } from "@/lib/stores/connection-store";
import { createStoreId } from "@/lib/stores/ids";
import { createDefaultProjectRoles, hasProjectPermission } from "@/lib/project-roles";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type {
  Project as WorkspaceProject,
  ProjectPermission,
  ProjectRole,
} from "@/lib/stores/types";
import { useApi } from "@/lib/use-api";
import { SessionExpiredError, apiFetch } from "@/lib/api-fetch";

const projectColors = [
  { value: "bg-violet-500", label: "Violet", swatch: "bg-violet-500" },
  { value: "bg-cyan-500", label: "Cyan", swatch: "bg-cyan-500" },
  { value: "bg-amber-500", label: "Amber", swatch: "bg-amber-500" },
  { value: "bg-emerald-500", label: "Emerald", swatch: "bg-emerald-500" },
  { value: "bg-rose-500", label: "Rose", swatch: "bg-rose-500" },
];

const rolePermissions: { value: ProjectPermission; label: string }[] = [
  { value: "create_tasks", label: "Create tasks" },
  { value: "edit_tasks", label: "Edit tasks" },
  { value: "delete_tasks", label: "Delete tasks" },
  { value: "manage_members", label: "Manage project" },
];

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
  const { profile } = useProfileStore();
  const [deleting, setDeleting] = useState<WorkspaceProject | null>(null);
  const currentProjects = projects.filter(
    (project) => project.workspace_id === activeWorkspaceId,
  );
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
    try {
      await execute(() =>
        apiFetch(`/projects/${encodeURIComponent(project.id)}`, "DELETE"),
      );
      deleteProject(project.id);
      setDeleting(null);
      toast.success("Project deleted");
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      toast.error("Project deletion failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  useEffect(() => {
    if (!activeWorkspaceId) return;

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
  }, [activeWorkspaceId, loadWorkspaceProjects]);

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

type ProjectInput = Omit<WorkspaceProject, "id" | "progress"> & {
  member_assignments: { user_id: string; role_id: string }[];
  project_roles: ProjectRole[];
};

type ProjectCreateRequest = {
  workspace_id: string;
  name: string;
  description: string | null;
  project_color: string | null;
  status: WorkspaceProject["status"];
  visibility: WorkspaceProject["visibility"];
  start_date: string | null;
  due_date: string | null;
};

export function ProjectEditorPage({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const {
    projects,
    projectMembers,
    projectRoles,
    setWorkspaceProjects,
    setProjectAssignments,
    updateProject,
  } = useProjectStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { connections } = useConnectionStore();
  const { profile } = useProfileStore();
  const { execute } = useApi();
  const [loadAttempted, setLoadAttempted] = useState(!projectId);
  const project = projects.find((item) => item.id === projectId) ?? null;
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
    if (!projectId || project || !activeWorkspaceId) return;

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
  }, [activeWorkspaceId, execute, project, projectId, setWorkspaceProjects]);

  async function saveProject(input: ProjectInput) {
    if (project) {
      const { member_assignments, project_roles, ...projectInput } = input;
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
          {loadAttempted || !activeWorkspaceId
            ? "Project not found."
            : "Loading project…"}
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

function parseProjectsResponse(
  data: unknown,
  workspaceId: string,
): WorkspaceProject[] {
  if (
    typeof data !== "object" ||
    data === null ||
    !("projects" in data) ||
    !Array.isArray(data.projects)
  ) {
    throw new Error("The projects response did not include a projects array.");
  }

  return data.projects.map((item: unknown) => {
    if (typeof item !== "object" || item === null) {
      throw new Error("The projects response contains an invalid project.");
    }

    const project = item as Record<string, unknown>;
    const id = project.project_id ?? project.id;
    if (
      typeof id !== "string" ||
      typeof project.name !== "string" ||
      (project.workspace_id !== undefined &&
        typeof project.workspace_id !== "string")
    ) {
      throw new Error("The projects response contains an invalid project.");
    }

    const dueDate =
      typeof project.due_date === "string" ? project.due_date : "";
    const due = dueDate ? dueDate.slice(0, 10) : "No due date";

    const rawMembers = Array.isArray(project.project_members)
      ? project.project_members
      : Array.isArray(project.members)
        ? project.members
        : [];
    const members = rawMembers.flatMap((member): string[] => {
      if (typeof member === "string") return [member];
      if (
        typeof member === "object" &&
        member !== null &&
        "user_id" in member &&
        typeof member.user_id === "string"
      ) {
        return [member.user_id];
      }
      return [];
    });
    return {
      id,
      name: project.name,
      description:
        typeof project.description === "string" ? project.description : "",
      project_color:
        typeof project.project_color === "string"
          ? project.project_color
          : projectColors[0].value,
      progress: typeof project.progress === "number" ? project.progress : 0,
      due,
      members,
      status: isProjectStatus(project.status) ? project.status : "active",
      visibility:
        project.visibility === "private" ? "private" : "workspace",
      start_date:
        typeof project.start_date === "string" ? project.start_date : null,
      created_by:
        typeof project.created_by === "string" ? project.created_by : undefined,
      created_at:
        typeof project.created_at === "string"
          ? project.created_at
          : undefined,
      updated_at:
        typeof project.updated_at === "string"
          ? project.updated_at
          : undefined,
      workspace_id:
        typeof project.workspace_id === "string"
          ? project.workspace_id
          : workspaceId,
    };
  });
}

function ProjectForm({
  project,
  connectedPeople,
  roles: initialRoles,
  assignments: initialAssignments,
  onClose,
  onSave,
}: {
  project: WorkspaceProject | null;
  connectedPeople: AssignablePerson[];
  roles: ProjectRole[];
  assignments: { user_id: string; role_id: string }[];
  onClose: () => void;
  onSave: (input: ProjectInput) => Promise<void>;
}) {
  const { workspaces, activeWorkspaceId } = useWorkspaceStore();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [workspaceId, setWorkspaceId] = useState(
    project?.workspace_id ?? activeWorkspaceId,
  );
  const [color, setColor] = useState(
    project?.project_color ?? projectColors[0].value,
  );
  const [due, setDue] = useState(project ? dateInputValue(project.due) : "");
  const [startDate, setStartDate] = useState(
    project?.start_date?.slice(0, 10) ?? "",
  );
  const [status, setStatus] = useState<WorkspaceProject["status"]>(
    project?.status ?? "active",
  );
  const [visibility, setVisibility] = useState<
    WorkspaceProject["visibility"]
  >(project?.visibility ?? "workspace");
  const [roles, setRoles] = useState(initialRoles);
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const currentAssignments = Object.fromEntries(
      initialAssignments.map(({ user_id, role_id }) => [user_id, role_id]),
    );
    if (initialAssignments.length > 0) return currentAssignments;
    const ownerRole = initialRoles.find((role) => role.name === "Owner");
    const currentUser = connectedPeople[0];
    return ownerRole && currentUser
      ? { [currentUser.id]: ownerRole.id }
      : currentAssignments;
  });
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<
    ProjectPermission[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const ownerRole = roles.find((role) => role.name === "Owner");
    const hasOwner = ownerRole
      ? Object.values(assignments).includes(ownerRole.id)
      : false;
    if (
      cleanName.length < 3 ||
      !hasOwner ||
      (due && startDate && due < startDate)
    ) return;
    setIsSaving(true);
    try {
      await onSave({
        name: cleanName,
        description: description.trim(),
        workspace_id: workspaceId,
        project_color: color,
        status,
        visibility,
        start_date: startDate || null,
        due: due || "No due date",
        members: Object.keys(assignmentMap),
        member_assignments: Object.entries(assignmentMap).map(
          ([user_id, role_id]) => ({ user_id, role_id }),
        ),
        project_roles: roles,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function addCustomRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newRoleName.trim();
    if (
      !name ||
      roles.some((role) => role.name.toLowerCase() === name.toLowerCase())
    ) {
      return;
    }
    setRoles((current) => [
      ...current,
      {
        id: createStoreId("project-role"),
        project_id: project?.id ?? "",
        name,
        permissions: newRolePermissions,
        is_custom: true,
      },
    ]);
    setNewRoleName("");
    setNewRolePermissions([]);
    setAddRoleOpen(false);
  }

  function toggleRolePermission(
    roleId: string,
    permission: ProjectPermission,
    checked: boolean,
  ) {
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: checked
                ? [...new Set([...role.permissions, permission])]
                : role.permissions.filter((item) => item !== permission),
            }
          : role,
      ),
    );
  }

  const assignmentMap = Object.fromEntries(
    Object.entries(assignments).filter(([personId, roleId]) =>
      connectedPeople.some((person) => person.id === personId) &&
      roles.some((role) => role.id === roleId),
    ),
  );
  const ownerRoleId = roles.find((role) => role.name === "Owner")?.id;
  const ownerCount = ownerRoleId
    ? Object.values(assignmentMap).filter((id) => id === ownerRoleId).length
    : 0;

  return (
    <section className="mx-auto mt-6 max-w-4xl">
      <button
        type="button"
        onClick={onClose}
        className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium text-[#6755e8]"
      >
        <ArrowLeft size={14} /> {project ? "Back to project" : "Projects"}
      </button>
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold">
          {project ? "Edit project" : "Create project"}
        </h1>
        <p className="mt-1 text-[11px] text-[#9297a3]">
          Set project details, dates, visibility, roles, and connections.
        </p>
      </div>
      <form
        onSubmit={submit}
        className="flex flex-col gap-5 rounded-xl border border-[#e7e9ee] bg-white p-5 dark:border-white/10 dark:bg-[#181920] sm:p-7"
      >
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Project name
          <input
            autoFocus
            required
            minLength={3}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Description
          <textarea
            rows={3}
            maxLength={300}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="resize-y rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Workspace
            <select
              value={workspaceId}
              onChange={(event) => setWorkspaceId(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              {workspaces.map((workspace) => (
                <option
                  key={workspace.workspace_id}
                  value={workspace.workspace_id}
                >
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Start date
            <input
              type="date"
              value={startDate}
              max={due || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-transparent px-2.5 py-2 text-[10px] dark:border-white/10"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Due date
            <input
              type="date"
              value={due}
              min={startDate || undefined}
              onChange={(event) => setDue(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-transparent px-2.5 py-2 text-[10px] dark:border-white/10"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Status
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as WorkspaceProject["status"])
              }
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Visibility
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(
                  event.target.value as WorkspaceProject["visibility"],
                )
              }
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              <option value="workspace">Workspace</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-[11px] font-medium">
            Team roles & permissions
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-lg border border-[#e8e9ef] p-3 dark:border-white/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold">
                    {role.name}
                    {role.is_custom && (
                      <span className="ml-1 font-normal text-[#9da2ad]">
                        Custom
                      </span>
                    )}
                  </span>
                  <span className="text-[8px] text-[#9da2ad]">
                    {Object.values(assignments).filter((id) => id === role.id)
                      .length}{" "}
                    assigned
                  </span>
                  {role.is_custom && (
                    <button
                      type="button"
                      disabled={Object.values(assignments).includes(role.id)}
                      aria-label={`Remove ${role.name} role`}
                      title={
                        Object.values(assignments).includes(role.id)
                          ? "Reassign members before removing this role"
                          : "Remove custom role"
                      }
                      onClick={() =>
                        setRoles((current) =>
                          current.filter((item) => item.id !== role.id),
                        )
                      }
                      className="rounded p-1 text-[#9da2ad] hover:bg-[#fff1f1] hover:text-[#b93d3d] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
                  {rolePermissions.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-1.5 text-[8px] text-[#747a87]"
                    >
                      <input
                        type="checkbox"
                        checked={role.permissions.includes(value)}
                        disabled={!role.is_custom}
                        onChange={(event) =>
                          toggleRolePermission(
                            role.id,
                            value,
                            event.target.checked,
                          )
                        }
                        className="accent-[#6755e8]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {addRoleOpen ? (
            <form
              onSubmit={addCustomRole}
              className="rounded-lg border border-[#e8e9ef] bg-[#fafbfc] p-3 dark:border-white/10 dark:bg-white/2"
            >
              <label className="flex flex-col gap-1.5 text-[9px] font-medium">
                Custom role name
                <input
                  autoFocus
                  required
                  maxLength={40}
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                  className="rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2 text-[10px] dark:border-white/10 dark:bg-[#181920]"
                />
              </label>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">
                {rolePermissions.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-1.5 text-[8px] text-[#747a87]"
                  >
                    <input
                      type="checkbox"
                      checked={newRolePermissions.includes(value)}
                      onChange={(event) =>
                        setNewRolePermissions((current) =>
                          event.target.checked
                            ? [...current, value]
                            : current.filter((item) => item !== value),
                        )
                      }
                      className="accent-[#6755e8]"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddRoleOpen(false)}
                  className="rounded px-2 py-1 text-[9px] text-[#747a87]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !newRoleName.trim() ||
                    roles.some(
                      (role) =>
                        role.name.toLowerCase() ===
                        newRoleName.trim().toLowerCase(),
                    )
                  }
                  className="rounded bg-[#6755e8] px-2 py-1 text-[9px] font-medium text-white disabled:opacity-40"
                >
                  Add role
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddRoleOpen(true)}
              className="flex items-center gap-1 self-start rounded-md px-2 py-1.5 text-[9px] font-medium text-[#6755e8] hover:bg-[#f4f2ff] dark:hover:bg-white/5"
            >
              <Plus size={12} /> Create custom role
            </button>
          )}
          <p className="text-[9px] text-[#9297a3]">
            Permissions apply to task creation, editing, deletion, and managing
            project members.
          </p>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-[11px] font-medium">
            Assign connections to roles
          </legend>
          <MemberDropBoard
            people={connectedPeople}
            roles={roles}
            assignments={assignmentMap}
            onAssign={(personId, roleId) => {
              const previousRoleId = assignments[personId];
              if (
                previousRoleId === ownerRoleId &&
                roleId !== ownerRoleId &&
                ownerCount <= 1
              ) {
                return;
              }
              setAssignments((current) => ({ ...current, [personId]: roleId }));
            }}
            onRemove={(personId) =>
              setAssignments((current) => {
                const next = { ...current };
                delete next[personId];
                return next;
              })
            }
            emptyMessage="Drop a connection in this role"
          />
          <p className="mt-1.5 text-[9px] text-[#9297a3]">
            Only your connected people can be assigned. Drag members between
            role columns to change their access.
          </p>
          {ownerCount === 0 && (
            <p className="mt-1.5 text-[9px] text-[#b93d3d]">
              Assign at least one connection to the Owner role.
            </p>
          )}
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-[11px] font-medium">
            Project color
          </legend>
          <div className="flex flex-wrap gap-2">
            {projectColors.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                aria-pressed={color === option.value}
                onClick={() => setColor(option.value)}
                className={`size-7 rounded-full ${option.swatch} ${color === option.value ? "ring-2 ring-offset-2 ring-[#6755e8] dark:ring-offset-[#181920]" : ""}`}
              />
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md px-3 py-2 text-[11px] text-[#777d89] hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSaving || ownerCount === 0 || Boolean(due && startDate && due < startDate)
            }
            className="rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white"
          >
            {isSaving
              ? project
                ? "Saving..."
                : "Creating..."
              : project
                ? "Save changes"
                : "Create project"}
          </button>
        </div>
      </form>
    </section>
  );
}

function dateInputValue(value: string) {
  const isoDate = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const parsed = new Date(`${value}, ${new Date().getFullYear()}`);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatProjectDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function isProjectStatus(value: unknown): value is WorkspaceProject["status"] {
  return (
    value === "active" ||
    value === "on_hold" ||
    value === "completed" ||
    value === "archived"
  );
}

function getMemberOptions(
  currentUserId: string,
  currentUserName: string,
  currentUserEmail: string,
  connections: ReturnType<typeof useConnectionStore.getState>["connections"],
): AssignablePerson[] {
  const people = new Map<string, AssignablePerson>([
    [currentUserId, { id: currentUserId, name: currentUserName, email: currentUserEmail }],
  ]);
  connections
    .filter((connection) => connection.status === "connected")
    .forEach((connection) =>
      people.set(connection.personId, {
        id: connection.personId,
        name: connection.name,
        email: connection.email,
      }),
    );
  return [...people.values()];
}

function getCreatedProjectId(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const response = data as Record<string, unknown>;
  if (typeof response.project_id === "string") return response.project_id;
  if (typeof response.id === "string") return response.id;
  if (typeof response.project === "object" && response.project !== null) {
    const project = response.project as Record<string, unknown>;
    if (typeof project.project_id === "string") return project.project_id;
    if (typeof project.id === "string") return project.id;
  }
  return null;
}
