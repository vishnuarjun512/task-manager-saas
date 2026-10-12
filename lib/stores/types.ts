import type { Project, Task } from "@/lib/orbit-data";

export type Workspace = {
  workspace_id: string;
  name: string;
  description: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
};

export type { Project };

export type ProjectMember = {
  workspace_id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  added_by: string | null;
  joined_at: string;
};

export type ProjectPermission =
  | "create_tasks"
  | "edit_tasks"
  | "delete_tasks"
  | "manage_members";

export type ProjectRole = {
  id: string;
  project_id: string;
  name: string;
  permissions: ProjectPermission[];
  is_custom: boolean;
};

export type TaskAssignee = {
  workspace_id: string;
  project_id: string;
  task_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: string;
};

export type ConnectionRequest = {
  id: string;
  personId: string;
  publicId?: string;
  name: string;
  email: string;
  direction: "incoming" | "outgoing";
  status: "pending" | "connected" | "declined";
};

export type WorkspacePreferences = {
  emailNotifications: boolean;
  taskUpdates: boolean;
  mentions: boolean;
  weeklyDigest: boolean;
  timezone: string;
  weekStartsOn: "Monday" | "Sunday";
};

export type Profile = {
  id: string;
  public_id?: string;
  name: string;
  email: string;
  role: string;
  pronouns: string;
  bio: string;
  availability: "Available" | "Away" | "Do not disturb";
  statusMessage: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: string;
  status: "Pending" | "Revoked";
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  target: string;
  createdAt: string;
};

export type FeedbackEntry = {
  id: string;
  topic: string;
  message: string;
  email: string;
  createdAt: string;
};

export type ScheduledTask = { date: string; time?: string };
export type Schedule = Record<string, ScheduledTask>;

export type AuthUser = {
  user_id: string;
  email: string;
  public_id?: string;
  username: string | null;
  full_name: string | null;
  avatar_url?: string;
  created_at: string;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
};

export type MockWorkspaceData = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  projects: Project[];
  project_members: ProjectMember[];
  project_roles: ProjectRole[];
  tasks: Task[];
  task_assignees: TaskAssignee[];
  connections: ConnectionRequest[];
  profile: Profile;
  preferences: WorkspacePreferences;
  notifications: Notification[];
  messages: Message[];
};
