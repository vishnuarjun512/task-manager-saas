"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/dialog-shell";
import { MemberDropBoard } from "@/components/member-drop-board";
import { TaskBoard } from "@/components/task-board";
import { TaskList } from "@/components/task-list";
import type { Task, TaskStatus } from "@/lib/orbit-data";
import { useConnectionStore } from "@/lib/stores/connection-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { hasProjectPermission } from "@/lib/project-roles";
import type { Project, ProjectRole } from "@/lib/stores/types";

type TaskInput = Omit<
  Task,
  "id" | "completed" | "completed_at" | "created_at" | "updated_at"
>;

export function TaskManager({ projectId }: { projectId?: string }) {
  const { tasks, deleteTask, setTaskStatus } = useTaskStore();
  const { projects, projectMembers, projectRoles } = useProjectStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { profile } = useProfileStore();
  const router = useRouter();
  const [view, setView] = useState<"list" | "board">("list");
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const project = projects.find((item) => item.id === projectId);
  const projectScopeId = projectId ? project?.workspace_id : activeWorkspaceId;
  const availableProjects = projects.filter(
    (item) => item.workspace_id === projectScopeId,
  );
  const availableProjectIds = new Set(availableProjects.map((item) => item.id));
  const visibleTasks = projectId
    ? tasks.filter((task) => task.projectId === projectId)
    : tasks.filter((task) => availableProjectIds.has(task.projectId));
  const availableTaskProjects = availableProjects.filter((item) =>
    hasProjectPermission(
      item.id,
      profile.id,
      "create_tasks",
      projects,
      projectMembers,
      projectRoles,
    ),
  );
  const canCreateTask = availableTaskProjects.length > 0;
  const visibleProjects = projectId
    ? availableProjects.filter((item) => item.id === projectId)
    : availableProjects;

  function changeTaskStatus(task: Task, status: TaskStatus) {
    if (
      visibleProjects.some((item) => item.id === task.projectId) &&
      hasProjectPermission(
        task.projectId,
        profile.id,
        "edit_tasks",
        projects,
        projectMembers,
        projectRoles,
      )
    ) {
      setTaskStatus(task.id, status);
    }
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
              href={`/tasks/new${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`}
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
          onEdit={(task) => {
            if (
              !hasProjectPermission(
                task.projectId,
                profile.id,
                "edit_tasks",
                projects,
                projectMembers,
                projectRoles,
              )
            ) {
              return;
            }
            router.push(`/tasks/${encodeURIComponent(task.id)}/edit`);
          }}
          onDelete={setDeletingTask}
          canToggleTask={(task) =>
            hasProjectPermission(
              task.projectId,
              profile.id,
              "edit_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
          canEditTask={(task) =>
            hasProjectPermission(
              task.projectId,
              profile.id,
              "edit_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
          canDeleteTask={(task) =>
            hasProjectPermission(
              task.projectId,
              profile.id,
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
          onStatusChange={changeTaskStatus}
          onEdit={(task) => {
            router.push(`/tasks/${encodeURIComponent(task.id)}/edit`);
          }}
          onDelete={setDeletingTask}
          canEditTask={(task) =>
            hasProjectPermission(
              task.projectId,
              profile.id,
              "edit_tasks",
              projects,
              projectMembers,
              projectRoles,
            )
          }
          canDeleteTask={(task) =>
            hasProjectPermission(
              task.projectId,
              profile.id,
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
          onConfirm={() => {
            deleteTask(deletingTask.id);
            setDeletingTask(null);
          }}
        />
      )}
    </section>
  );
}

export function TaskEditorPage({
  taskId,
  projectId,
}: {
  taskId?: string;
  projectId?: string;
}) {
  const router = useRouter();
  const { tasks, createTask, updateTask } = useTaskStore();
  const { projects, projectMembers, projectRoles } = useProjectStore();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { connections } = useConnectionStore();
  const { profile } = useProfileStore();
  const task = tasks.find((item) => item.id === taskId) ?? null;
  const permittedProjects = projects.filter((item) => {
    if (projectId) return item.id === projectId;
    if (task) {
      return (
        item.workspace_id === task.workspace_id &&
        (item.id === task.projectId ||
          hasProjectPermission(
            item.id,
            profile.id,
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
        profile.id,
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
        profile.id,
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
      key={task?.id ?? `new-${projectId ?? "task"}`}
      task={task}
      projectId={projectId}
      projects={permittedProjects}
      tasks={tasks.filter((item) =>
        permittedProjects.some((project) => project.id === item.projectId),
      )}
      currentUserId={profile.id}
      connections={[
        { id: profile.id, name: profile.name },
        ...connections
          .filter((connection) => connection.status === "connected")
          .map((connection) => ({
            id: connection.personId,
            name: connection.name,
          })),
      ]}
      onClose={closeEditor}
      onSave={(input) => {
        if (task) updateTask(task.id, input);
        else createTask(input);
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

function TaskForm({
  task,
  projectId: initialProjectId,
  projects,
  tasks,
  currentUserId,
  connections,
  onClose,
  onSave,
}: {
  task: Task | null;
  projectId?: string;
  projects: Project[];
  tasks: Task[];
  currentUserId: string;
  connections: { id: string; name: string }[];
  onClose: () => void;
  onSave: (input: TaskInput) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [projectId, setProjectId] = useState(
    task?.projectId ?? initialProjectId ?? projects[0]?.id ?? "",
  );
  const [priority, setPriority] = useState<Task["priority"]>(
    task?.priority ?? "medium",
  );
  const [status, setStatus] = useState<Task["status"]>(
    task?.status ?? "todo",
  );
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    task?.assignee_ids ??
      (task?.assignee_id ? [task.assignee_id] : []),
  );
  const [parentTaskId, setParentTaskId] = useState(
    task?.parent_task_id ?? "",
  );
  const [startDate, setStartDate] = useState(toDateTimeInput(task?.start_date));
  const [dueDate, setDueDate] = useState(toDateTimeInput(task?.due_date));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const project = projects.find((item) => item.id === projectId);
    if (!title.trim() || !project) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      workspace_id: project.workspace_id,
      projectId: project.id,
      project: project.name,
      parent_task_id: parentTaskId || null,
      priority,
      status,
      assignee_ids: assigneeIds.filter((id) =>
        project.members.includes(id),
      ),
      assignee_id:
        assigneeIds.find((id) => project.members.includes(id)) ?? null,
      start_date: fromDateTimeInput(startDate),
      due_date: fromDateTimeInput(dueDate),
      created_by: task?.created_by ?? currentUserId,
      position: task?.position ?? Date.now(),
    });
  }

  const parentTasks = tasks.filter(
    (item) => item.projectId === projectId && item.id !== task?.id,
  );
  const selectedProject = projects.find((item) => item.id === projectId);
  const projectMembers = new Set(selectedProject?.members ?? []);
  const availableAssignees = connections.filter((person) =>
    projectMembers.has(person.id),
  );
  const taskAssigneeRole: ProjectRole[] = [
    {
      id: `${projectId}:responsible`,
      project_id: projectId,
      name: "Responsible",
      permissions: [],
      is_custom: false,
    },
  ];
  const taskAssignmentMap = Object.fromEntries(
    assigneeIds
      .filter((assigneeId) => projectMembers.has(assigneeId))
      .map((assigneeId) => [assigneeId, taskAssigneeRole[0].id]),
  );

  return (
    <section className="mx-auto mt-6 max-w-4xl">
      <button
        type="button"
        onClick={onClose}
        className="mb-4 inline-flex items-center gap-2 text-[11px] font-medium text-[#6755e8]"
      >
        <ArrowLeft size={14} /> {task ? "Back to project" : "Tasks"}
      </button>
      <div className="mb-5">
        <h1 className="text-[22px] font-semibold">
          {task ? "Edit task" : "Create task"}
        </h1>
        <p className="mt-1 text-[11px] text-[#9297a3]">
          Set the task details, schedule, and responsible project members.
        </p>
      </div>
      <form
        onSubmit={submit}
        className="flex flex-col gap-5 rounded-xl border border-[#e7e9ee] bg-white p-5 dark:border-white/10 dark:bg-[#181920] sm:p-7"
      >
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
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Description
          <textarea
            rows={2}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="resize-y rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Project
            <select
              required
              value={projectId}
              onChange={(event) => {
                setProjectId(event.target.value);
                setParentTaskId("");
                const nextProject = projects.find(
                  (item) => item.id === event.target.value,
                );
                setAssigneeIds((current) =>
                  current.filter((assigneeId) =>
                    nextProject?.members.includes(assigneeId),
                  ),
                );
              }}
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
              onChange={(event) =>
                setPriority(event.target.value as Task["priority"])
              }
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Status
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as Task["status"])
              }
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">Pending</option>
              <option value="in_review">Review</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend className="mb-2 text-[11px] font-medium">
            Responsible connections
          </legend>
          <MemberDropBoard
            people={availableAssignees}
            roles={taskAssigneeRole}
            assignments={taskAssignmentMap}
            onAssign={(personId) =>
              setAssigneeIds((current) =>
                current.includes(personId) ? current : [...current, personId],
              )
            }
            onRemove={(personId) =>
              setAssigneeIds((current) =>
                current.filter((id) => id !== personId),
              )
            }
            emptyMessage="Drop a project member here"
          />
          <p className="mt-1.5 text-[9px] text-[#9297a3]">
            Assign one or more members of this project to be responsible.
          </p>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Start date
            <input
              type="datetime-local"
              value={startDate}
              max={dueDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-transparent px-2 py-2 text-[10px] dark:border-white/10"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[11px] font-medium">
            Due date
            <input
              type="datetime-local"
              value={dueDate}
              min={startDate || undefined}
              onChange={(event) => setDueDate(event.target.value)}
              className="min-w-0 rounded-md border border-[#e1e3e9] bg-transparent px-2 py-2 text-[10px] dark:border-white/10"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Parent task
          <select
            value={parentTaskId}
            onChange={(event) => setParentTaskId(event.target.value)}
            className="min-w-0 rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
          >
            <option value="">No parent task</option>
            {parentTasks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
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
    </section>
  );
}

function toDateTimeInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}
