"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { MemberDropBoard, type AssignablePerson } from "@/components/member-drop-board";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { ProjectRole, Project as WorkspaceProject } from "@/lib/stores/types";
import type { ProjectInput } from "@/lib/project-types";
import { projectColors } from "@/lib/project-data";
import { ProjectRoleEditor } from "@/components/project-role-editor";

/** Edits project metadata, role permissions, and connected-member assignments. */
export function ProjectForm({
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
        <ProjectRoleEditor
          projectId={project?.id ?? ""}
          roles={roles}
          setRoles={setRoles}
          assignments={assignmentMap}
        />
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
