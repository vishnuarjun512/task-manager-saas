"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, DialogShell } from "@/components/dialog-shell";
import { apiFetch } from "@/lib/api-fetch";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import type { Workspace } from "@/lib/stores/types";
import { useApi } from "@/lib/use-api";

export function WorkspaceManager() {
  const { execute } = useApi();
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useWorkspaceStore();
  const { projects } = useProjectStore();
  const { tasks } = useTaskStore();
  const [editing, setEditing] = useState<Workspace | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Workspace | null>(null);

  async function saveWorkspace(
    input: Pick<Workspace, "name" | "description">,
  ): Promise<void> {
    if (editing) {
      updateWorkspace(editing.workspace_id, input);
    } else {
      try {
        await execute(() =>
          apiFetch("/workspace", "POST", {
            name: input.name,
            description: input.description,
          }),
        );
        createWorkspace(input);
        toast.success("Workspace created");
      } catch (error) {
        toast.error("Workspace creation failed", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
        return;
      }
    }
    setEditing(null);
    setCreating(false);
  }

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold">Your workspaces</h2>
          <p className="mt-1 text-[11px] text-[#9297a3]">
            {workspaces.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#5947d3]"
        >
          <Plus size={14} /> New workspace
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]">
        <table className="w-full min-w-170 border-collapse text-left">
          <thead>
            <tr className="border-b border-[#eff0f3] text-[9px] font-semibold uppercase tracking-widest text-[#969ba6] dark:border-white/10">
              <th className="px-4 py-3">Workspace</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Projects</th>
              <th className="px-4 py-3">Tasks</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((workspace: Workspace) => {
              const workspaceProjects = projects.filter(
                (project) => project.workspaceId === workspace.workspace_id,
              );
              const workspaceProjectIds = new Set(
                workspaceProjects.map((project) => project.id),
              );
              const workspaceTasks = tasks.filter((task) =>
                workspaceProjectIds.has(task.projectId),
              );
              const active = activeWorkspaceId === workspace.workspace_id;

              return (
                <tr
                  key={workspace.workspace_id}
                  className="border-b border-[#eff0f3] last:border-0 dark:border-white/10"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium">
                        {workspace.name}
                      </span>
                      {active && (
                        <span className="rounded-full bg-[#edfaf4] px-2 py-0.5 text-[9px] font-medium text-[#32825f]">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block font-mono text-[9px] text-[#a0a5af]">
                      {workspace.workspace_id}
                    </span>
                  </td>
                  <td className="max-w-70 px-4 py-4 text-[11px] text-[#858b97]">
                    <span className="line-clamp-2">
                      {workspace.description || "No description"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[11px] text-[#747a87]">
                    {workspaceProjects.length}
                  </td>
                  <td className="px-4 py-4 text-[11px] text-[#747a87]">
                    {workspaceTasks.length}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      {!active && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveWorkspace(workspace.workspace_id)
                          }
                          className="rounded-md px-2 py-1.5 text-[10px] font-medium text-[#6755e8] hover:bg-[#f4f2ff] dark:hover:bg-white/5"
                        >
                          Switch
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={`Edit ${workspace.name}`}
                        onClick={() => setEditing(workspace)}
                        className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#f3f4f6] dark:hover:bg-white/10"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${workspace.name}`}
                        disabled={workspaces.length === 1}
                        onClick={() => setDeleting(workspace)}
                        className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#fff1f1] hover:text-[#b93d3d] disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/10"
                      >
                        <Trash2 size={14} />
                      </button>
                      {active && (
                        <Check size={15} className="ml-1 mt-1 text-[#32825f]" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <WorkspaceForm
          workspace={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={saveWorkspace}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          description="Projects and tasks in this workspace will also be removed from this browser."
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteWorkspace(deleting.workspace_id);
            setDeleting(null);
          }}
        />
      )}
    </section>
  );
}

function WorkspaceForm({
  workspace,
  onClose,
  onSave,
}: {
  workspace: Workspace | null;
  onClose: () => void;
  onSave: (input: Pick<Workspace, "name" | "description">) => Promise<void>;
}) {
  const [name, setName] = useState(workspace?.name ?? "");
  const [description, setDescription] = useState(workspace?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    setIsSaving(true);
    try {
      await onSave({ name: cleanName, description: description.trim() });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DialogShell
      title={workspace ? "Edit workspace" : "Create workspace"}
      description="Give this workspace a clear name and purpose."
      onClose={onClose}
    >
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Workspace name
          <input
            autoFocus
            required
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Description
          <textarea
            rows={3}
            maxLength={240}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="resize-y rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
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
            disabled={isSaving}
            className="rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white"
          >
            {isSaving
              ? workspace
                ? "Saving..."
                : "Creating..."
              : workspace
                ? "Save changes"
                : "Create workspace"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
