import { projectData, tasks } from "@/lib/orbit-data";
import type {
  Message,
  Notification,
  Workspace,
  MockWorkspaceData,
} from "@/lib/stores/types";

const workspaces: Workspace[] = [
  {
    id: "ws-acme",
    name: "Acme workspace",
    description: "The shared space for Acme product and marketing work.",
  },
];

export function getMockWorkspaceData(): MockWorkspaceData {
  return {
    workspaces: workspaces.map((workspace) => ({ ...workspace })),
    activeWorkspaceId: workspaces[0].id,
    projects: projectData.map((project) => ({
      ...project,
      members: [...project.members],
      workspaceId: workspaces[0].id,
    })),
    tasks: tasks.map((task) => ({ ...task })),
    connections: [
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
