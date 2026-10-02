"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog, DialogShell } from "@/components/dialog-shell";
import {
  useWorkspaceStore,
  type WorkspaceProject,
} from "@/lib/workspace-store";

const projectColors = [
  { value: "bg-violet-500", label: "Violet", swatch: "bg-violet-500" },
  { value: "bg-cyan-500", label: "Cyan", swatch: "bg-cyan-500" },
  { value: "bg-amber-500", label: "Amber", swatch: "bg-amber-500" },
  { value: "bg-emerald-500", label: "Emerald", swatch: "bg-emerald-500" },
  { value: "bg-rose-500", label: "Rose", swatch: "bg-rose-500" },
];

export function ProjectManager() {
  const {
    projects,
    tasks,
    activeWorkspaceId,
    createProject,
    updateProject,
    deleteProject,
  } = useWorkspaceStore();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WorkspaceProject | null>(null);
  const [deleting, setDeleting] = useState<WorkspaceProject | null>(null);
  const currentProjects = projects.filter(
    (project) => project.workspaceId === activeWorkspaceId,
  );

  function saveProject(input: ProjectInput) {
    if (editing) updateProject(editing.id, input);
    else createProject(input);
    setEditing(null);
    setCreating(false);
  }

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold">Projects</h2>
          <p className="mt-1 text-[11px] text-[#9297a3]">
            {currentProjects.length} in this workspace
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#5947d3]"
        >
          <Plus size={14} /> New project
        </button>
      </div>

      {currentProjects.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]">
          <table className="w-full min-w-175 border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eff0f3] text-[9px] font-semibold uppercase tracking-widest text-[#969ba6] dark:border-white/10">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Due date</th>
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
                          className={`size-2 rounded-full ${project.color}`}
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
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#f0f1f4]">
                          <div
                            className={`h-full ${project.color}`}
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
                        <button
                          type="button"
                          aria-label={`Edit ${project.name}`}
                          onClick={() => setEditing(project)}
                          className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#f3f4f6] dark:hover:bg-white/10"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${project.name}`}
                          onClick={() => setDeleting(project)}
                          className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#fff1f1] hover:text-[#b93d3d] dark:hover:bg-white/10"
                        >
                          <Trash2 size={14} />
                        </button>
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

      {(creating || editing) && (
        <ProjectForm
          key={editing?.id ?? "new-project"}
          project={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={saveProject}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          description="Tasks assigned to this project will also be removed. This action cannot be undone."
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteProject(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </section>
  );
}

type ProjectInput = Omit<WorkspaceProject, "id" | "progress" | "members">;

function ProjectForm({
  project,
  onClose,
  onSave,
}: {
  project: WorkspaceProject | null;
  onClose: () => void;
  onSave: (input: ProjectInput) => void;
}) {
  const { workspaces, activeWorkspaceId } = useWorkspaceStore();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [workspaceId, setWorkspaceId] = useState(
    project?.workspaceId ?? activeWorkspaceId,
  );
  const [color, setColor] = useState(project?.color ?? projectColors[0].value);
  const [due, setDue] = useState(project ? dateInputValue(project.due) : "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      workspaceId,
      color,
      due: due || "No due date",
    });
  }

  return (
    <DialogShell
      title={project ? "Edit project" : "Create project"}
      description="Set the project details and where it belongs."
      onClose={onClose}
    >
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Project name
          <input
            autoFocus
            required
            maxLength={80}
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
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Due date
            <input
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-transparent px-2.5 py-2 text-[10px] dark:border-white/10"
            />
          </label>
        </div>
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
            className="rounded-md px-3 py-2 text-[11px] text-[#777d89] hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white"
          >
            {project ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

function dateInputValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(`${value}, ${new Date().getFullYear()}`);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatProjectDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
