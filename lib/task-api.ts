import type {
  Project,
  Task,
  TaskInput,
  TaskPriority,
  TaskStatus,
} from "@/lib/orbit-data";

type ApiTask = Record<string, unknown>;

export function parseTasksResponse(
  data: unknown,
  project: Project,
): Task[] {
  const records = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.tasks)
      ? data.tasks
      : null;
  if (!records) {
    throw new Error("The tasks response did not include a tasks array.");
  }
  return records.map((record) => parseTaskRecord(record, project));
}

export function parseTaskResponse(data: unknown, projects: Project[]): Task {
  const record =
    isRecord(data) && isRecord(data.task)
      ? data.task
      : isRecord(data)
        ? data
        : null;
  if (!record) throw new Error("The task response did not include a task.");
  const projectId = readString(record.project_id ?? record.projectId);
  const project = projects.find((item) => item.id === projectId);
  if (!project) {
    throw new Error("The task response refers to an unknown project.");
  }
  return parseTaskRecord(record, project);
}

export function getTaskProjectReference(
  data: unknown,
): { projectId: string; workspaceId: string } | null {
  const record =
    isRecord(data) && isRecord(data.task)
      ? data.task
      : isRecord(data)
        ? data
        : null;
  if (!record) return null;
  const projectId = readString(record.project_id ?? record.projectId);
  const workspaceId = readString(record.workspace_id);
  return projectId && workspaceId ? { projectId, workspaceId } : null;
}

export function taskRequestBody(input: TaskInput) {
  return {
    workspace_id: input.workspace_id,
    project_id: input.projectId,
    parent_task_id: input.parent_task_id,
    title: input.title,
    description: input.description || null,
    status: input.status,
    priority: input.priority,
    assignee_id:
      input.assignee_ids?.[0] ?? input.assignee_id ?? null,
    start_date: input.start_date,
    due_date: input.due_date,
    position: input.position,
  };
}

export function parseTaskRecord(value: unknown, project: Project): Task {
  if (!isRecord(value)) {
    throw new Error("The tasks response contains an invalid task.");
  }

  const id = readString(value.task_id ?? value.id);
  const projectId = readString(value.project_id ?? value.projectId);
  const title = readString(value.title);
  const status = parseTaskStatus(value.status);
  const priority = parseTaskPriority(value.priority);
  if (!id || projectId !== project.id || !title || !status || !priority) {
    throw new Error("The tasks response contains an invalid task.");
  }

  const assigneeId = nullableString(value.assignee_id);
  const assigneeIds = Array.isArray(value.assignee_ids)
    ? value.assignee_ids.filter(
        (item): item is string => typeof item === "string",
      )
    : assigneeId
      ? [assigneeId]
      : [];
  const completed = status === "done";
  return {
    task_id: id,
    workspace_id: readString(value.workspace_id) ?? project.workspace_id,
    projectId,
    parent_task_id: nullableString(value.parent_task_id),
    title,
    description: readString(value.description) ?? "",
    project: project.name,
    priority,
    status,
    assignee_id: assigneeIds[0] ?? null,
    assignee_ids: assigneeIds,
    start_date: nullableString(value.start_date),
    due_date: nullableString(value.due_date),
    created_by: readString(value.created_by) ?? "",
    position: typeof value.position === "number" ? value.position : 0,
    completed_at: nullableString(value.completed_at),
    created_at: readString(value.created_at) ?? new Date().toISOString(),
    updated_at: readString(value.updated_at) ?? new Date().toISOString(),
    completed,
  };
}

function parseTaskStatus(value: unknown): TaskStatus | null {
  return value === "todo" ||
    value === "in_progress" ||
    value === "in_review" ||
    value === "done"
    ? value
    : null;
}

function parseTaskPriority(value: unknown): TaskPriority | null {
  return value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "urgent"
    ? value
    : null;
}

function isRecord(value: unknown): value is ApiTask {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
