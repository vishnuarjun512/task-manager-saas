import type { AssignablePerson } from "@/components/member-drop-board";
import type {
  ConnectionRequest,
  Project as WorkspaceProject,
} from "@/lib/stores/types";

export const projectColors = [
  { value: "bg-violet-500", label: "Violet", swatch: "bg-violet-500" },
  { value: "bg-cyan-500", label: "Cyan", swatch: "bg-cyan-500" },
  { value: "bg-amber-500", label: "Amber", swatch: "bg-amber-500" },
  { value: "bg-emerald-500", label: "Emerald", swatch: "bg-emerald-500" },
  { value: "bg-rose-500", label: "Rose", swatch: "bg-rose-500" },
];

/** Converts database-shaped project responses into the fields rendered by the UI. */
export function parseProjectsResponse(
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

function isProjectStatus(value: unknown): value is WorkspaceProject["status"] {
  return (
    value === "active" ||
    value === "on_hold" ||
    value === "completed" ||
    value === "archived"
  );
}

export function getMemberOptions(
  currentUserId: string,
  currentUserName: string,
  currentUserEmail: string,
  connections: ConnectionRequest[],
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

export function getCreatedProjectId(data: unknown): string | null {
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
