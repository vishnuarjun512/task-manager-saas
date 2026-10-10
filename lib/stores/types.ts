import type { Task } from "@/lib/orbit-data";

export type Workspace = {
  workspace_id: string;
  name: string;
  description: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  due: string;
  members: string[];
  workspaceId: string;
};

export type ConnectionRequest = {
  id: string;
  personId: string;
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
  tasks: Task[];
  connections: ConnectionRequest[];
  profile: Profile;
  preferences: WorkspacePreferences;
  notifications: Notification[];
  messages: Message[];
};
