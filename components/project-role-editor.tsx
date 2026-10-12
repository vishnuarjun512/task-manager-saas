"use client";

import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { Plus, X } from "lucide-react";
import { createStoreId } from "@/lib/stores/ids";
import type {
  ProjectPermission,
  ProjectRole,
} from "@/lib/stores/types";

const rolePermissions: { value: ProjectPermission; label: string }[] = [
  { value: "create_tasks", label: "Create tasks" },
  { value: "edit_tasks", label: "Edit tasks" },
  { value: "delete_tasks", label: "Delete tasks" },
  { value: "manage_members", label: "Manage project" },
];

/** Configures project roles and the task/member permissions granted to each. */
export function ProjectRoleEditor({
  projectId,
  roles,
  setRoles,
  assignments,
}: {
  projectId: string;
  roles: ProjectRole[];
  setRoles: Dispatch<SetStateAction<ProjectRole[]>>;
  assignments: Record<string, string>;
}) {
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<
    ProjectPermission[]
  >([]);

  function addCustomRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = roleName.trim();
    if (
      !name ||
      roles.some((role) => role.name.toLowerCase() === name.toLowerCase())
    ) {
      return;
    }
    setRoles((current) => [
      ...current,
      {
        id: createStoreId("project-role"),
        project_id: projectId,
        name,
        permissions: newRolePermissions,
        is_custom: true,
      },
    ]);
    setRoleName("");
    setNewRolePermissions([]);
    setIsAddingRole(false);
  }

  function updatePermission(
    roleId: string,
    permission: ProjectPermission,
    enabled: boolean,
  ) {
    setRoles((current) =>
      current.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: enabled
                ? [...new Set([...role.permissions, permission])]
                : role.permissions.filter((item) => item !== permission),
            }
          : role,
      ),
    );
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-[11px] font-medium">
        Team roles & permissions
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {roles.map((role) => {
          const assignedCount = Object.values(assignments).filter(
            (id) => id === role.id,
          ).length;
          return (
            <div
              key={role.id}
              className="rounded-lg border border-[#e8e9ef] p-3 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold">
                  {role.name}
                  {role.is_custom && (
                    <span className="ml-1 font-normal text-[#9da2ad]">
                      Custom
                    </span>
                  )}
                </span>
                <span className="text-[8px] text-[#9da2ad]">
                  {assignedCount} assigned
                </span>
                {role.is_custom && (
                  <button
                    type="button"
                    disabled={assignedCount > 0}
                    aria-label={`Remove ${role.name} role`}
                    title={
                      assignedCount > 0
                        ? "Reassign members before removing this role"
                        : "Remove custom role"
                    }
                    onClick={() =>
                      setRoles((current) =>
                        current.filter((item) => item.id !== role.id),
                      )
                    }
                    className="rounded p-1 text-[#9da2ad] hover:bg-[#fff1f1] hover:text-[#b93d3d] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
                {rolePermissions.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-1.5 text-[8px] text-[#747a87]"
                  >
                    <input
                      type="checkbox"
                      checked={role.permissions.includes(value)}
                      disabled={!role.is_custom}
                      onChange={(event) =>
                        updatePermission(
                          role.id,
                          value,
                          event.target.checked,
                        )
                      }
                      className="accent-[#6755e8]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {isAddingRole ? (
        <form
          onSubmit={addCustomRole}
          className="rounded-lg border border-[#e8e9ef] bg-[#fafbfc] p-3 dark:border-white/10 dark:bg-white/2"
        >
          <label className="flex flex-col gap-1.5 text-[9px] font-medium">
            Custom role name
            <input
              autoFocus
              required
              maxLength={40}
              value={roleName}
              onChange={(event) => setRoleName(event.target.value)}
              className="rounded-md border border-[#e1e3e9] bg-white px-2.5 py-2 text-[10px] dark:border-white/10 dark:bg-[#181920]"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">
            {rolePermissions.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-1.5 text-[8px] text-[#747a87]"
              >
                <input
                  type="checkbox"
                  checked={newRolePermissions.includes(value)}
                  onChange={(event) =>
                    setNewRolePermissions((current) =>
                      event.target.checked
                        ? [...current, value]
                        : current.filter((item) => item !== value),
                    )
                  }
                  className="accent-[#6755e8]"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingRole(false)}
              className="rounded px-2 py-1 text-[9px] text-[#747a87]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !roleName.trim() ||
                roles.some(
                  (role) =>
                    role.name.toLowerCase() === roleName.trim().toLowerCase(),
                )
              }
              className="rounded bg-[#6755e8] px-2 py-1 text-[9px] font-medium text-white disabled:opacity-40"
            >
              Add role
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingRole(true)}
          className="flex items-center gap-1 self-start rounded-md px-2 py-1.5 text-[9px] font-medium text-[#6755e8] hover:bg-[#f4f2ff] dark:hover:bg-white/5"
        >
          <Plus size={12} /> Create custom role
        </button>
      )}
      <p className="text-[9px] text-[#9297a3]">
        Permissions apply to task creation, editing, deletion, and managing
        project members.
      </p>
    </fieldset>
  );
}
