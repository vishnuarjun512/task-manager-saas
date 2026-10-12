"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import { useActivityStore } from "@/lib/stores/activity-store";
import { createStoreId } from "@/lib/stores/ids";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { createDefaultProjectRoles } from "@/lib/project-roles";
import type { Project, ProjectMember, ProjectRole } from "@/lib/stores/types";

type ProjectInput = Omit<Project, "id" | "progress">;

type ProjectState = {
  projects: Project[];
  projectMembers: ProjectMember[];
  projectRoles: ProjectRole[];
  createProject: (input: ProjectInput) => void;
  setProjects: (input: Project[]) => void;
  setWorkspaceProjects: (workspaceId: string, input: Project[]) => void;
  setProjectMembers: (
    projectId: string,
    memberIds: string[],
    workspaceId: string,
  ) => void;
  setProjectAssignments: (
    projectId: string,
    workspaceId: string,
    assignments: { user_id: string; role_id: string }[],
    roles: ProjectRole[],
  ) => void;
  updateProject: (id: string, input: ProjectInput) => void;
  deleteProject: (id: string) => void;
};

const initialData = getMockWorkspaceData();

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: initialData.projects,
  projectMembers: initialData.project_members,
  projectRoles: initialData.project_roles,
  createProject: (input) => {
    const now = new Date().toISOString();
    const project: Project = {
      ...input,
      id: createStoreId("project"),
      progress: 0,
      created_at: input.created_at ?? now,
      updated_at: now,
    };
    set((state) => ({
      projects: [project, ...state.projects],
      projectMembers: [
        ...state.projectMembers,
        ...makeMemberships(
          project,
          [],
          createDefaultProjectRoles(project.id),
        ),
      ],
      projectRoles: [
        ...createDefaultProjectRoles(project.id),
        ...state.projectRoles,
      ],
    }));
    useActivityStore.getState().logActivity("Created project", project.name);
  },

  setProjects: (projects) => {
    set((state) => ({
      projects,
      projectRoles: [
        ...state.projectRoles.filter(
          (role) => !projects.some((project) => project.id === role.project_id),
        ),
        ...projects.flatMap((project) =>
          state.projectRoles.some((role) => role.project_id === project.id)
            ? state.projectRoles.filter(
                (role) => role.project_id === project.id,
              )
            : createDefaultProjectRoles(project.id),
        ),
      ],
      projectMembers: [
        ...state.projectMembers.filter(
          (member) => !projects.some((project) => project.id === member.project_id),
        ),
        ...projects.flatMap((project) =>
          makeMemberships(
            project,
            state.projectMembers.filter(
              (member) => member.project_id === project.id,
            ),
            state.projectRoles.filter(
              (role) => role.project_id === project.id,
            ).length > 0
              ? state.projectRoles.filter(
                  (role) => role.project_id === project.id,
                )
              : createDefaultProjectRoles(project.id),
          ),
        ),
      ],
    }));
  },

  setWorkspaceProjects: (workspaceId, projects) => {
    set((state) => {
      const currentProjects = new Map(
        state.projects
          .filter((project) => project.workspace_id === workspaceId)
          .map((project) => [project.id, project]),
      );
      const refreshedProjects = projects.map((project) => ({
        ...project,
        members:
          project.members.length > 0
            ? project.members
            : (currentProjects.get(project.id)?.members ?? []),
      }));
      const refreshedProjectIds = new Set(
        refreshedProjects.map((project) => project.id),
      );
      const refreshedRoles = refreshedProjects.flatMap(
        (project) =>
          state.projectRoles.filter((role) => role.project_id === project.id)
            .length > 0
            ? state.projectRoles.filter(
                (role) => role.project_id === project.id,
              )
            : createDefaultProjectRoles(project.id),
      );

      return {
        projects: [
          ...state.projects.filter(
            (project) => project.workspace_id !== workspaceId,
          ),
          ...refreshedProjects,
        ],
        projectMembers: [
          ...state.projectMembers.filter(
            (member) =>
              member.workspace_id !== workspaceId ||
              !refreshedProjectIds.has(member.project_id),
          ),
          ...refreshedProjects.flatMap((project) =>
            makeMemberships(
              project,
              state.projectMembers.filter(
                (member) => member.project_id === project.id,
              ),
              refreshedRoles.filter((role) => role.project_id === project.id),
            ),
          ),
        ],
        projectRoles: [
          ...state.projectRoles.filter(
            (role) =>
              role.project_id === undefined ||
              !refreshedProjectIds.has(role.project_id),
          ),
          ...refreshedRoles,
        ],
      };
    });
  },

  setProjectMembers: (projectId, memberIds, workspaceId) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project || project.workspace_id !== workspaceId) return;

    const updatedMembers = [...new Set(memberIds)];
    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === projectId
          ? {
              ...item,
              members: updatedMembers,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
      projectMembers: [
        ...state.projectMembers.filter(
          (member) => member.project_id !== projectId,
        ),
        ...makeMemberships(
          { ...project, members: updatedMembers },
          state.projectMembers.filter(
            (member) => member.project_id === projectId,
          ),
          state.projectRoles.filter((role) => role.project_id === projectId),
        ),
      ],
    }));
  },

  setProjectAssignments: (projectId, workspaceId, assignments, roles) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project || project.workspace_id !== workspaceId) return;

    const roleIds = new Map(
      roles.map((role) => [
        role.id,
        role.is_custom ? role.id : `${projectId}:${role.name.toLowerCase()}`,
      ]),
    );
    const projectRoles = roles.map((role) => ({
      ...role,
      id: roleIds.get(role.id) ?? role.id,
      project_id: projectId,
    }));
    const projectRoleIds = new Set(projectRoles.map((role) => role.id));
    const uniqueAssignments = [
      ...new Map(
        assignments
          .flatMap((assignment) => {
            const roleId = roleIds.get(assignment.role_id);
            return roleId
              ? [[assignment.user_id, { ...assignment, role_id: roleId }] as const]
              : [];
          })
          .filter(([, assignment]) =>
            projectRoleIds.has(assignment.role_id),
          ),
      ).values(),
    ];
    const joinedAt = new Date().toISOString();
    const addedBy = useProfileStore.getState().profile.id;
    const projectMembers = uniqueAssignments.map((assignment) => {
      const previous = get().projectMembers.find(
        (member) =>
          member.project_id === projectId &&
          member.user_id === assignment.user_id &&
          member.role_id === assignment.role_id &&
          member.workspace_id === workspaceId,
      );
      return (
        previous ?? {
          workspace_id: workspaceId,
          project_id: projectId,
          user_id: assignment.user_id,
          role_id: assignment.role_id,
          added_by: addedBy,
          joined_at: joinedAt,
        }
      );
    });

    set((state) => ({
      projects: state.projects.map((item) =>
        item.id === projectId
          ? {
              ...item,
              members: projectMembers.map((member) => member.user_id),
              updated_at: joinedAt,
            }
          : item,
      ),
      projectMembers: [
        ...state.projectMembers.filter(
          (member) => member.project_id !== projectId,
        ),
        ...projectMembers,
      ],
      projectRoles: [
        ...state.projectRoles.filter((role) => role.project_id !== projectId),
        ...projectRoles,
      ],
    }));
    useTaskStore
      .getState()
      .restrictProjectAssignees(
        projectId,
        uniqueAssignments.map((assignment) => assignment.user_id),
      );
  },

  updateProject: (id, input) => {
    const currentProject = get().projects.find((project) => project.id === id);
    if (!currentProject) return;
    const updatedProject = {
      ...currentProject,
      ...input,
      updated_at: new Date().toISOString(),
    };
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? updatedProject : project,
      ),
      projectMembers: [
        ...state.projectMembers.filter((member) => member.project_id !== id),
        ...makeMemberships(
          updatedProject,
          state.projectMembers.filter((member) => member.project_id === id),
          state.projectRoles.filter((role) => role.project_id === id),
        ),
      ],
    }));
    if (currentProject.workspace_id !== updatedProject.workspace_id) {
      useTaskStore
        .getState()
        .moveProjectWorkspace(id, updatedProject.workspace_id);
    }
    useTaskStore.getState().renameProjectTasks(id, input.name);
    useActivityStore.getState().logActivity("Updated project", input.name);
  },
  deleteProject: (id) => {
    const project = get().projects.find((item) => item.id === id);
    if (!project) return;
    set((state) => ({
      projects: state.projects.filter((item) => item.id !== id),
      projectMembers: state.projectMembers.filter(
        (member) => member.project_id !== id,
      ),
      projectRoles: state.projectRoles.filter(
        (role) => role.project_id !== id,
      ),
    }));
    useTaskStore.getState().deleteProjectTasks(id);
    useActivityStore.getState().logActivity("Deleted project", project.name);
  },
}));

function makeMemberships(
  project: Project,
  existing: ProjectMember[],
  roles: ProjectRole[],
): ProjectMember[] {
  const joinedAt = new Date().toISOString();
  const addedBy = useProfileStore.getState().profile.id;
  const defaultRoleId =
    roles.find((role) => role.name === "Editor")?.id ??
    roles.find((role) => role.name === "Viewer")?.id ??
    `${project.id}:viewer`;
  return project.members.map(
    (user_id) =>
      existing.find((member) => member.user_id === user_id) ?? {
        workspace_id: project.workspace_id,
        project_id: project.id,
        user_id,
        role_id:
          user_id === project.created_by
            ? roles.find((role) => role.name === "Owner")?.id ??
              `${project.id}:owner`
            : defaultRoleId,
        added_by: addedBy,
        joined_at: joinedAt,
      },
  );
}
