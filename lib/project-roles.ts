import type {
  ProjectMember,
  ProjectPermission,
  ProjectRole,
  Project as StoreProject,
} from "@/lib/stores/types";

const allPermissions: ProjectPermission[] = [
  "create_tasks",
  "edit_tasks",
  "delete_tasks",
  "manage_members",
];

export function createDefaultProjectRoles(projectId: string): ProjectRole[] {
  return [
    {
      id: `${projectId}:owner`,
      project_id: projectId,
      name: "Owner",
      permissions: [...allPermissions],
      is_custom: false,
    },
    {
      id: `${projectId}:editor`,
      project_id: projectId,
      name: "Editor",
      permissions: ["create_tasks", "edit_tasks", "delete_tasks"],
      is_custom: false,
    },
    {
      id: `${projectId}:contributor`,
      project_id: projectId,
      name: "Contributor",
      permissions: ["create_tasks"],
      is_custom: false,
    },
    {
      id: `${projectId}:viewer`,
      project_id: projectId,
      name: "Viewer",
      permissions: [],
      is_custom: false,
    },
  ];
}

export function roleHasPermission(
  role: ProjectRole | undefined,
  permission: ProjectPermission,
) {
  return role?.permissions.includes(permission) ?? false;
}

export function hasProjectPermission(
  projectId: string,
  userId: string,
  permission: ProjectPermission,
  projects: StoreProject[],
  members: ProjectMember[],
  roles: ProjectRole[],
) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return false;

  const membership = members.find(
    (member) =>
      member.project_id === projectId && member.user_id === userId,
  );
  if (!membership && project.created_by !== userId) return false;

  const role = roles.find(
    (item) =>
      item.id === (membership?.role_id ?? `${projectId}:owner`) &&
      item.project_id === projectId,
  );
  return roleHasPermission(role, permission);
}
