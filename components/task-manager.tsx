"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { ConfirmDialog, DialogShell } from "@/components/dialog-shell";
import { TaskList } from "@/components/task-list";
import { useWorkspaceStore } from "@/lib/workspace-store";
import type { Task } from "@/lib/orbit-data";

type TaskInput = Omit<Task, "id" | "completed">;

export function TaskManager({ projectId }: { projectId?: string }) {
  const {
    tasks,
    projects,
    activeWorkspaceId,
    createTask,
    updateTask,
    deleteTask,
  } = useWorkspaceStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const project = projects.find((item) => item.id === projectId);
  const projectScopeId = projectId ? project?.workspaceId : activeWorkspaceId;
  const availableProjects = projects.filter(
    (item) => item.workspaceId === projectScopeId,
  );
  const availableProjectIds = new Set(availableProjects.map((item) => item.id));
  const visibleTasks = projectId
    ? tasks.filter((task) => task.projectId === projectId)
    : tasks.filter((task) => availableProjectIds.has(task.projectId));

  function saveTask(input: TaskInput) {
    if (editingTask) updateTask(editingTask.id, input);
    else createTask(input);
    setDialogOpen(false);
    setEditingTask(null);
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
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setDialogOpen(true);
          }}
          className="flex items-center gap-2 rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#5947d3]"
        >
          <Plus size={14} /> Add task
        </button>
      </div>
      <TaskList
        items={visibleTasks}
        onEdit={(task) => {
          setEditingTask(task);
          setDialogOpen(true);
        }}
        onDelete={setDeletingTask}
      />
      {dialogOpen && (
        <TaskForm
          key={editingTask?.id ?? "new-task"}
          task={editingTask}
          projectId={projectId}
          projects={availableProjects}
          onClose={() => {
            setDialogOpen(false);
            setEditingTask(null);
          }}
          onSave={saveTask}
        />
      )}
      {deletingTask && (
        <ConfirmDialog
          title={`Delete ${deletingTask.title}?`}
          description="This task will be removed from the workspace and calendar."
          onClose={() => setDeletingTask(null)}
          onConfirm={() => {
            deleteTask(deletingTask.id);
            setDeletingTask(null);
          }}
        />
      )}
    </section>
  );
}

function TaskForm({
  task,
  projectId: initialProjectId,
  projects,
  onClose,
  onSave,
}: {
  task: Task | null;
  projectId?: string;
  projects: ReturnType<typeof useWorkspaceStore>["projects"];
  onClose: () => void;
  onSave: (input: TaskInput) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [projectId, setProjectId] = useState(
    task?.projectId ?? initialProjectId ?? projects[0]?.id ?? "",
  );
  const [priority, setPriority] = useState(task?.priority ?? "Medium");
  const [status, setStatus] = useState(task?.status ?? "Todo");
  const [due, setDue] = useState(
    task && /^\d{4}-\d{2}-\d{2}$/.test(task.due) ? task.due : "",
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const project = projects.find((item) => item.id === projectId);
    if (!title.trim() || !project) return;
    onSave({
      title: title.trim(),
      projectId: project.id,
      project: project.name,
      priority,
      status,
      due:
        due ||
        (task && !/^\d{4}-\d{2}-\d{2}$/.test(task.due)
          ? task.due
          : "No due date"),
    });
  }

  return (
    <DialogShell
      title={task ? "Edit task" : "Create task"}
      description="Keep the details clear so the next action is easy to take."
      onClose={onClose}
    >
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Task name
          <input
            autoFocus
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Project
            <select
              required
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              <option>Todo</option>
              <option>In progress</option>
              <option>In review</option>
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
        {projects.length === 0 && (
          <p className="text-[10px] text-[#b93d3d]">
            Create a project before adding tasks.
          </p>
        )}
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
            disabled={projects.length === 0}
            className="rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-40"
          >
            {task ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
