import type { Project as WorkspaceProject, ProjectRole } from "@/lib/stores/types";

export type ProjectInput = Omit<WorkspaceProject, "id" | "progress"> & {
  member_assignments: { user_id: string; role_id: string }[];
  project_roles: ProjectRole[];
};

export type ProjectCreateRequest = {
  workspace_id: string;
  name: string;
  description: string | null;
  project_color: string | null;
  status: WorkspaceProject["status"];
  visibility: WorkspaceProject["visibility"];
  start_date: string | null;
  due_date: string | null;
};
