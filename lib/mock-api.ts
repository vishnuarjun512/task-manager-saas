import { projectData, tasks } from "@/lib/orbit-data";
import type {
  Message,
  Notification,
  ProjectMember,
  TaskAssignee,
  Workspace,
  MockWorkspaceData,
} from "@/lib/stores/types";
import { createDefaultProjectRoles } from "@/lib/project-roles";

const workspaces: Workspace[] = [
  {
    workspace_id: "ws-acme",
    name: "Acme workspace",
    description: "The shared space for Acme product and marketing work.",
    created_by: "ORB-1042",
    created_at: "2026-08-12T09:00:00Z",
    updated_at: "2026-10-10T12:00:00Z",
  },
  {
    workspace_id: "ws-studio",
    name: "Studio North",
    description: "Brand, design systems, and creative production.",
    created_by: "ORB-1042",
    created_at: "2026-07-20T09:00:00Z",
    updated_at: "2026-10-09T16:20:00Z",
  },
  {
    workspace_id: "ws-launch",
    name: "Launch Lab",
    description: "A focused workspace for experiments and product launches.",
    created_by: "ORB-1042",
    created_at: "2026-09-01T09:00:00Z",
    updated_at: "2026-10-11T11:10:00Z",
  },
];

export function getMockWorkspaceData(): MockWorkspaceData {
  return {
    workspaces: workspaces.map((workspace) => ({ ...workspace })),
    activeWorkspaceId: workspaces[0].workspace_id,
    projects: projectData.map((project) => ({ ...project })),
    project_roles: projectData.flatMap((project) =>
      createDefaultProjectRoles(project.id),
    ),
    project_members: projectData.flatMap((project) =>
      project.members.map((user_id, index): ProjectMember => ({
          workspace_id: project.workspace_id,
          project_id: project.id,
          user_id,
          role_id:
            user_id === project.created_by
              ? `${project.id}:owner`
              : index % 2 === 0
                ? `${project.id}:editor`
                : `${project.id}:contributor`,
          added_by: project.created_by ?? null,
          joined_at: "2026-09-14T09:00:00Z",
        })),
    ),
    tasks: tasks.map((task) => ({
      ...task,
      assignee_ids: getTaskAssigneeIds(task.task_id, task.assignee_id),
    })),
    task_assignees: tasks.flatMap((task): TaskAssignee[] => {
      return getTaskAssigneeIds(task.task_id, task.assignee_id).map((user_id) => ({
        workspace_id: task.workspace_id,
        project_id: task.projectId,
        task_id: task.task_id,
        user_id,
        assigned_by: task.created_by,
        assigned_at: task.created_at,
      }));
    }),
    connections: [
      {
        id: "connection-sarah",
        personId: "ORB-2048",
        name: "Sarah Lee",
        email: "sarah.lee@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-marcus",
        personId: "ORB-3196",
        name: "Marcus Chen",
        email: "marcus.chen@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-jordan",
        personId: "ORB-5873",
        name: "Jordan Davis",
        email: "jordan.davis@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-maya",
        personId: "ORB-6621",
        name: "Maya Patel",
        email: "maya.patel@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-emma",
        personId: "ORB-7340",
        name: "Emma Wilson",
        email: "emma.wilson@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-noah",
        personId: "ORB-8165",
        name: "Noah Kim",
        email: "noah.kim@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-priya",
        personId: "ORB-9281",
        name: "Priya Shah",
        email: "priya.shah@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-oliver",
        personId: "ORB-3472",
        name: "Oliver Brown",
        email: "oliver.brown@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-ava",
        personId: "ORB-5093",
        name: "Ava Thompson",
        email: "ava.thompson@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "connection-leo",
        personId: "ORB-7738",
        name: "Leo Martinez",
        email: "leo.martinez@example.com",
        direction: "outgoing",
        status: "connected",
      },
      {
        id: "request-alex",
        personId: "ORB-4510",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        direction: "incoming",
        status: "pending",
      },
    ],
    preferences: {
      emailNotifications: true,
      taskUpdates: true,
      mentions: true,
      weeklyDigest: false,
      timezone: "UTC",
      weekStartsOn: "Monday",
    },
    profile: {
      id: "ORB-1042",
      name: "Vishnu S",
      email: "vishnu@example.com",
      role: "Product manager",
      pronouns: "",
      bio: "",
      availability: "Available",
      statusMessage: "",
    },
    notifications: [] satisfies Notification[],
    messages: [] satisfies Message[],
  };
}

function getTaskAssigneeIds(taskId: string, primaryAssigneeId: string | null) {
  if (taskId === "finalize-homepage-copy") {
    return ["ORB-2048", "ORB-3196"];
  }
  if (taskId === "prepare-campaign-brief") {
    return ["ORB-3196", "ORB-6621"];
  }
  return primaryAssigneeId ? [primaryAssigneeId] : [];
}
