"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiFetch, isApiConfigured, SessionExpiredError } from "@/lib/api-fetch";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { parseProjectsResponse } from "@/lib/project-data";
import type {
  AuthUser,
  Profile,
  Workspace,
  WorkspacePreferences,
} from "@/lib/stores/types";
import { useApi } from "@/lib/use-api";

type BootstrapResponse = {
  user: AuthUser;
  profile?: Partial<Profile> & { display_name?: string; role_title?: string };
  preferences?: Partial<WorkspacePreferences> & {
    active_workspace_id?: string;
  };
  workspaces: Record<string, unknown>[];
};

export function useBackendBootstrap() {
  const { execute } = useApi();
  const [bootstrapped, setBootstrapped] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const setWorkspaceProjects = useProjectStore(
    (state) => state.setWorkspaceProjects,
  );

  useEffect(() => {
    if (!isApiConfigured) return;
    let cancelled = false;
    execute(() => apiFetch("/me", "GET"))
      .then((data: unknown) => {
        const bootstrap = parseBootstrapResponse(data);
        if (cancelled) return;

        setUser(bootstrap.user);
        setProfile(bootstrap.profile);
        setWorkspaces(
          bootstrap.workspaces,
          bootstrap.preferences?.active_workspace_id,
        );
        setBootstrapped(true);
      })
      .catch((error: unknown) => {
        if (cancelled || error instanceof SessionExpiredError) return;
        toast.error("Account data could not be loaded", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [execute, setProfile, setUser, setWorkspaces]);

  useEffect(() => {
    if (!isApiConfigured || !bootstrapped || !activeWorkspaceId) return;
    let cancelled = false;
    execute(() =>
      apiFetch(`/projects/${encodeURIComponent(activeWorkspaceId)}`, "GET"),
    )
      .then((data) => {
        if (!cancelled) {
          setWorkspaceProjects(
            activeWorkspaceId,
            parseProjectsResponse(data, activeWorkspaceId),
          );
        }
      })
      .catch((error: unknown) => {
        if (cancelled || error instanceof SessionExpiredError) return;
        toast.error("Projects could not be loaded", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [
    activeWorkspaceId,
    bootstrapped,
    execute,
    setWorkspaceProjects,
  ]);
}

function parseBootstrapResponse(data: unknown): {
  user: AuthUser;
  profile: Profile;
  preferences?: BootstrapResponse["preferences"];
  workspaces: Workspace[];
} {
  if (!isRecord(data) || !isRecord(data.user) || !Array.isArray(data.workspaces)) {
    throw new Error(
      "The account response must include user and workspaces data.",
    );
  }
  const user = data.user;
  const userId = readString(user.user_id ?? user.id);
  const email = readString(user.email);
  const createdAt = readString(user.created_at);
  if (!userId || !email || !createdAt) {
    throw new Error("The account response contains an invalid user.");
  }

  const userDetails: AuthUser = {
    user_id: userId,
    email,
    username: readString(user.username),
    full_name: readString(user.full_name ?? user.display_name),
    avatar_url: readString(user.avatar_url) ?? undefined,
    created_at: createdAt,
    public_id: readString(user.public_id) ?? undefined,
  };

  const profileData = isRecord(data.profile) ? data.profile : {};
  const profile: Profile = {
    id: userId,
    public_id:
      readString(profileData.public_id ?? user.public_id) ?? undefined,
    name:
      readString(profileData.display_name ?? profileData.name) ??
      userDetails.full_name ??
      userDetails.username ??
      email,
    email,
    role:
      readString(profileData.role_title ?? profileData.role) ?? "",
    pronouns: readString(profileData.pronouns) ?? "",
    bio: readString(profileData.bio) ?? "",
    availability: parseAvailability(profileData.availability),
    statusMessage: readString(profileData.status_message) ?? "",
  };

  const workspaces = data.workspaces.map(parseWorkspace);
  return {
    user: userDetails,
    profile,
    preferences: isRecord(data.preferences)
      ? (data.preferences as BootstrapResponse["preferences"])
      : undefined,
    workspaces,
  };
}

function parseWorkspace(value: unknown): Workspace {
  if (!isRecord(value)) {
    throw new Error("The account response contains an invalid workspace.");
  }
  const workspaceId = readString(value.workspace_id ?? value.id);
  const name = readString(value.name);
  if (!workspaceId || !name) {
    throw new Error("The account response contains an invalid workspace.");
  }
  return {
    workspace_id: workspaceId,
    name,
    description: readString(value.description) ?? "",
    created_by: readString(value.created_by) ?? undefined,
    created_at: readString(value.created_at) ?? undefined,
    updated_at: readString(value.updated_at) ?? undefined,
  };
}

function parseAvailability(value: unknown): Profile["availability"] {
  if (value === "Away" || value === "away") return "Away";
  if (
    value === "Do not disturb" ||
    value === "do_not_disturb"
  ) {
    return "Do not disturb";
  }
  return "Available";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
