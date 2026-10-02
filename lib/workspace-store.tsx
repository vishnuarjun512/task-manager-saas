"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  projectData,
  tasks as starterTasks,
  type Task,
} from "@/lib/orbit-data";

export type Workspace = {
  id: string;
  name: string;
  description: string;
};

export type WorkspaceProject = {
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

type AppData = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  projects: WorkspaceProject[];
  tasks: Task[];
  connections: ConnectionRequest[];
  preferences: WorkspacePreferences;
  profile: Profile;
  invitations: Invitation[];
  activity: ActivityEntry[];
  feedback: FeedbackEntry[];
};

type WorkspaceInput = Pick<Workspace, "name" | "description">;
type ProjectInput = Omit<WorkspaceProject, "id" | "progress" | "members">;
type TaskInput = Omit<Task, "id" | "completed">;
type WorkspaceStoreValue = AppData & {
  loaded: boolean;
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (input: WorkspaceInput) => void;
  updateWorkspace: (id: string, input: WorkspaceInput) => void;
  deleteWorkspace: (id: string) => void;
  createProject: (input: ProjectInput) => void;
  updateProject: (id: string, input: ProjectInput) => void;
  deleteProject: (id: string) => void;
  createTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  sendConnectionRequest: (personId: string) => boolean;
  updateConnectionStatus: (
    id: string,
    status: ConnectionRequest["status"],
  ) => void;
  deleteConnection: (id: string) => void;
  updatePreferences: (preferences: Partial<WorkspacePreferences>) => void;
  updateProfile: (profile: Profile) => void;
  inviteTeammate: (email: string, role: string) => boolean;
  revokeInvitation: (id: string) => void;
  submitFeedback: (feedback: Omit<FeedbackEntry, "id" | "createdAt">) => void;
};

export const peopleDirectory = [
  { id: "ORB-1042", name: "Vishnu S", email: "vishnu@example.com" },
  { id: "ORB-2048", name: "Sarah Lee", email: "sarah.lee@example.com" },
  { id: "ORB-3196", name: "Marcus Chen", email: "marcus.chen@example.com" },
  { id: "ORB-4510", name: "Alex Rivera", email: "alex.rivera@example.com" },
  { id: "ORB-5873", name: "Jordan Davis", email: "jordan.davis@example.com" },
  { id: "ORB-6621", name: "Maya Patel", email: "maya.patel@example.com" },
] as const;

const storageKey = "orbit-workspace-data";
const starterWorkspaces: Workspace[] = [
  {
    id: "ws-acme",
    name: "Acme workspace",
    description: "The shared space for Acme product and marketing work.",
  },
];
const starterProjects: WorkspaceProject[] = projectData.map((project) => ({
  ...project,
  members: [...project.members],
  workspaceId: "ws-acme",
}));
const starterConnections: ConnectionRequest[] = [
  {
    id: "request-sarah",
    personId: "ORB-2048",
    name: "Sarah Lee",
    email: "sarah.lee@example.com",
    direction: "incoming",
    status: "pending",
  },
  {
    id: "request-marcus",
    personId: "ORB-3196",
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    direction: "incoming",
    status: "pending",
  },
];
const starterPreferences: WorkspacePreferences = {
  emailNotifications: true,
  taskUpdates: true,
  mentions: true,
  weeklyDigest: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  weekStartsOn: "Monday",
};
const starterProfile: Profile = {
  id: "ORB-1042",
  name: "Vishnu S",
  email: "vishnu@example.com",
  role: "Product manager",
  pronouns: "",
  bio: "",
  availability: "Available",
  statusMessage: "",
};
const initialData: AppData = {
  workspaces: starterWorkspaces,
  activeWorkspaceId: starterWorkspaces[0].id,
  projects: starterProjects,
  tasks: starterTasks.map((task) => ({ ...task })),
  connections: starterConnections,
  preferences: starterPreferences,
  profile: starterProfile,
  invitations: [],
  activity: [],
  feedback: [],
};

const WorkspaceStoreContext = createContext<WorkspaceStoreValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isWorkspace(value: unknown): value is Workspace {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string"
  );
}

function isProject(value: unknown): value is WorkspaceProject {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.color === "string" &&
    typeof value.progress === "number" &&
    typeof value.due === "string" &&
    Array.isArray(value.members) &&
    typeof value.workspaceId === "string"
  );
}

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.projectId === "string" &&
    typeof value.title === "string" &&
    typeof value.project === "string" &&
    typeof value.priority === "string" &&
    typeof value.status === "string" &&
    typeof value.due === "string" &&
    typeof value.completed === "boolean"
  );
}

function readSavedData(): AppData {
  if (typeof window === "undefined") return initialData;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      const legacyTasks = window.localStorage.getItem("orbit-workspace-tasks");
      if (!legacyTasks) return initialData;
      const savedTasks: unknown = JSON.parse(legacyTasks);
      const restoredTasks = restoreTasks(savedTasks);
      return restoredTasks
        ? { ...initialData, tasks: restoredTasks }
        : initialData;
    }

    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved)) return initialData;
    const workspaces = Array.isArray(saved.workspaces)
      ? saved.workspaces.filter(isWorkspace)
      : initialData.workspaces;
    const projects = Array.isArray(saved.projects)
      ? saved.projects.filter(isProject)
      : initialData.projects;
    const tasks = restoreTasks(saved.tasks) ?? initialData.tasks;
    const connections = Array.isArray(saved.connections)
      ? saved.connections.filter(isConnection)
      : initialData.connections;
    const activeWorkspaceId =
      typeof saved.activeWorkspaceId === "string" &&
      workspaces.some((workspace) => workspace.id === saved.activeWorkspaceId)
        ? saved.activeWorkspaceId
        : (workspaces[0]?.id ?? initialData.activeWorkspaceId);

    return {
      workspaces,
      activeWorkspaceId,
      projects,
      tasks,
      connections,
      preferences: isPreferences(saved.preferences)
        ? saved.preferences
        : initialData.preferences,
      profile: restoreProfile(saved.profile),
      invitations: Array.isArray(saved.invitations)
        ? saved.invitations.filter(isInvitation)
        : initialData.invitations,
      activity: Array.isArray(saved.activity)
        ? saved.activity.filter(isActivityEntry)
        : initialData.activity,
      feedback: Array.isArray(saved.feedback)
        ? saved.feedback.filter(isFeedbackEntry)
        : initialData.feedback,
    };
  } catch {
    return initialData;
  }
}

function restoreTasks(value: unknown): Task[] | null {
  if (!Array.isArray(value)) return null;
  const restored = value.flatMap((item): Task[] => {
    if (isTask(item)) return [item];
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.project !== "string" ||
      typeof item.priority !== "string" ||
      typeof item.status !== "string" ||
      typeof item.due !== "string"
    )
      return [];
    const project = initialData.projects.find(
      (candidate) => candidate.name === item.project,
    );
    if (!project) return [];
    return [
      {
        id: item.id,
        projectId: project.id,
        title: item.title,
        project: project.name,
        priority: item.priority,
        status: item.status,
        due: item.due,
        completed: item.completed === true,
      },
    ];
  });
  return restored;
}

function isConnection(value: unknown): value is ConnectionRequest {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.personId === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    (value.direction === "incoming" || value.direction === "outgoing") &&
    (value.status === "pending" ||
      value.status === "connected" ||
      value.status === "declined")
  );
}

function isPreferences(value: unknown): value is WorkspacePreferences {
  return (
    isRecord(value) &&
    typeof value.emailNotifications === "boolean" &&
    typeof value.taskUpdates === "boolean" &&
    typeof value.mentions === "boolean" &&
    typeof value.weeklyDigest === "boolean" &&
    typeof value.timezone === "string" &&
    (value.weekStartsOn === "Monday" || value.weekStartsOn === "Sunday")
  );
}

function restoreProfile(value: unknown): Profile {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string"
  )
    return starterProfile;

  const availability = value.availability;
  return {
    ...starterProfile,
    id: value.id,
    name: value.name,
    email: value.email,
    role: typeof value.role === "string" ? value.role : starterProfile.role,
    pronouns: typeof value.pronouns === "string" ? value.pronouns : "",
    bio: typeof value.bio === "string" ? value.bio : "",
    availability:
      availability === "Away" || availability === "Do not disturb"
        ? availability
        : "Available",
    statusMessage:
      typeof value.statusMessage === "string" ? value.statusMessage : "",
  };
}

function isInvitation(value: unknown): value is Invitation {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.role === "string" &&
    (value.status === "Pending" || value.status === "Revoked") &&
    typeof value.createdAt === "string"
  );
}

function isActivityEntry(value: unknown): value is ActivityEntry {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.action === "string" &&
    typeof value.target === "string" &&
    typeof value.createdAt === "string"
  );
}

function isFeedbackEntry(value: unknown): value is FeedbackEntry {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.topic === "string" &&
    typeof value.message === "string" &&
    typeof value.email === "string" &&
    typeof value.createdAt === "string"
  );
}

function logActivity(
  current: AppData,
  action: string,
  target: string,
): AppData {
  const entry: ActivityEntry = {
    id: createId("activity"),
    action,
    target,
    createdAt: new Date().toISOString(),
  };
  return { ...current, activity: [entry, ...current.activity].slice(0, 100) };
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function WorkspaceStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Hydration-safe: restore the persisted workspace state only after mount so
    // the SSR HTML matches the initial client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(readSavedData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Keep the workspace usable when browser storage is unavailable.
    }
  }, [data, loaded]);

  function setActiveWorkspace(id: string) {
    setData((current) =>
      current.workspaces.some((workspace) => workspace.id === id)
        ? { ...current, activeWorkspaceId: id }
        : current,
    );
  }

  function createWorkspace(input: WorkspaceInput) {
    const workspace = { ...input, id: createId("ws") };
    setData((current) =>
      logActivity(
        {
          ...current,
          workspaces: [...current.workspaces, workspace],
          activeWorkspaceId: workspace.id,
        },
        "Created workspace",
        workspace.name,
      ),
    );
  }

  function updateWorkspace(id: string, input: WorkspaceInput) {
    setData((current) => ({
      ...current,
      workspaces: current.workspaces.map((workspace) =>
        workspace.id === id ? { ...workspace, ...input } : workspace,
      ),
    }));
  }

  function deleteWorkspace(id: string) {
    setData((current) => {
      if (current.workspaces.length < 2) return current;
      const workspaces = current.workspaces.filter(
        (workspace) => workspace.id !== id,
      );
      const projects = current.projects.filter(
        (project) => project.workspaceId !== id,
      );
      const projectIds = new Set(
        current.projects
          .filter((project) => project.workspaceId === id)
          .map((project) => project.id),
      );
      return {
        ...current,
        workspaces,
        projects,
        tasks: current.tasks.filter((task) => !projectIds.has(task.projectId)),
        activeWorkspaceId:
          current.activeWorkspaceId === id
            ? workspaces[0].id
            : current.activeWorkspaceId,
      };
    });
  }

  function createProject(input: ProjectInput) {
    const project = {
      ...input,
      id: createId("project"),
      progress: 0,
      members: [data.profile.id],
    };
    setData((current) =>
      logActivity(
        { ...current, projects: [project, ...current.projects] },
        "Created project",
        project.name,
      ),
    );
  }

  function updateProject(id: string, input: ProjectInput) {
    setData((current) => {
      const existing = current.projects.find((project) => project.id === id);
      if (!existing) return current;
      return logActivity(
        {
          ...current,
          projects: current.projects.map((project) =>
            project.id === id ? { ...project, ...input } : project,
          ),
          tasks: current.tasks.map((task) =>
            task.projectId === id ? { ...task, project: input.name } : task,
          ),
        },
        "Updated project",
        input.name,
      );
    });
  }

  function deleteProject(id: string) {
    setData((current) => {
      const project = current.projects.find((item) => item.id === id);
      if (!project) return current;
      return logActivity(
        {
          ...current,
          projects: current.projects.filter((item) => item.id !== id),
          tasks: current.tasks.filter((task) => task.projectId !== project.id),
        },
        "Deleted project",
        project.name,
      );
    });
  }

  function createTask(input: TaskInput) {
    const task = { ...input, id: createId("task"), completed: false };
    setData((current) =>
      logActivity(
        { ...current, tasks: [task, ...current.tasks] },
        "Created task",
        task.title,
      ),
    );
  }

  function updateTask(id: string, input: TaskInput) {
    setData((current) => {
      const existing = current.tasks.find((task) => task.id === id);
      if (!existing) return current;
      return logActivity(
        {
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === id ? { ...task, ...input } : task,
          ),
        },
        "Updated task",
        input.title,
      );
    });
  }

  function toggleTask(id: string) {
    setData((current) => {
      const task = current.tasks.find((item) => item.id === id);
      if (!task) return current;
      return logActivity(
        {
          ...current,
          tasks: current.tasks.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item,
          ),
        },
        task.completed ? "Reopened task" : "Completed task",
        task.title,
      );
    });
  }

  function deleteTask(id: string) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }));
  }

  function sendConnectionRequest(personId: string) {
    const person = peopleDirectory.find(
      (candidate) =>
        candidate.id.toLowerCase() === personId.trim().toLowerCase(),
    );
    if (!person || person.id === data.profile.id) return false;
    if (
      data.connections.some(
        (connection) =>
          connection.personId === person.id && connection.status !== "declined",
      )
    ) {
      return false;
    }
    setData((current) =>
      logActivity(
        {
          ...current,
          connections: [
            {
              id: createId("connection"),
              personId: person.id,
              name: person.name,
              email: person.email,
              direction: "outgoing",
              status: "pending",
            },
            ...current.connections,
          ],
        },
        "Sent connection request",
        person.name,
      ),
    );
    return true;
  }

  function updateConnectionStatus(
    id: string,
    status: ConnectionRequest["status"],
  ) {
    setData((current) => ({
      ...current,
      connections: current.connections.map((connection) =>
        connection.id === id ? { ...connection, status } : connection,
      ),
    }));
  }

  function deleteConnection(id: string) {
    setData((current) => ({
      ...current,
      connections: current.connections.filter(
        (connection) => connection.id !== id,
      ),
    }));
  }

  function updatePreferences(preferences: Partial<WorkspacePreferences>) {
    setData((current) => ({
      ...current,
      preferences: { ...current.preferences, ...preferences },
    }));
  }

  function updateProfile(profile: Profile) {
    setData((current) =>
      logActivity({ ...current, profile }, "Updated profile", profile.name),
    );
  }

  function inviteTeammate(email: string, role: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      normalizedEmail === data.profile.email.toLowerCase() ||
      data.invitations.some(
        (invitation) =>
          invitation.email === normalizedEmail &&
          invitation.status === "Pending",
      ) ||
      data.connections.some(
        (connection) =>
          connection.email.toLowerCase() === normalizedEmail &&
          connection.status !== "declined",
      )
    )
      return false;

    const invitation: Invitation = {
      id: createId("invite"),
      email: normalizedEmail,
      role,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setData((current) =>
      logActivity(
        { ...current, invitations: [invitation, ...current.invitations] },
        "Prepared teammate invite",
        normalizedEmail,
      ),
    );
    return true;
  }

  function revokeInvitation(id: string) {
    setData((current) => {
      const invitation = current.invitations.find((item) => item.id === id);
      if (!invitation || invitation.status !== "Pending") return current;
      return logActivity(
        {
          ...current,
          invitations: current.invitations.map((item) =>
            item.id === id ? { ...item, status: "Revoked" } : item,
          ),
        },
        "Revoked teammate invite",
        invitation.email,
      );
    });
  }

  function submitFeedback(input: Omit<FeedbackEntry, "id" | "createdAt">) {
    const entry: FeedbackEntry = {
      ...input,
      id: createId("feedback"),
      createdAt: new Date().toISOString(),
    };
    setData((current) =>
      logActivity(
        { ...current, feedback: [entry, ...current.feedback] },
        "Sent product feedback",
        entry.topic,
      ),
    );
  }

  return (
    <WorkspaceStoreContext.Provider
      value={{
        ...data,
        loaded,
        setActiveWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        sendConnectionRequest,
        updateConnectionStatus,
        deleteConnection,
        updatePreferences,
        updateProfile,
        inviteTeammate,
        revokeInvitation,
        submitFeedback,
      }}
    >
      {children}
    </WorkspaceStoreContext.Provider>
  );
}

export function useWorkspaceStore() {
  const value = useContext(WorkspaceStoreContext);
  if (!value)
    throw new Error(
      "useWorkspaceStore must be used within WorkspaceStoreProvider",
    );
  return value;
}
