"use client";

import { create } from "zustand";
import { createStoreId } from "@/lib/stores/ids";
import { useConnectionStore } from "@/lib/stores/connection-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { ActivityEntry, FeedbackEntry, Invitation } from "./types";

type ActivityState = {
  invitations: Invitation[];
  activity: ActivityEntry[];
  feedback: FeedbackEntry[];
  logActivity: (action: string, target: string) => void;
  inviteTeammate: (email: string, role: string) => boolean;
  revokeInvitation: (id: string) => void;
  submitFeedback: (feedback: Omit<FeedbackEntry, "id" | "createdAt">) => void;
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  invitations: [],
  activity: [],
  feedback: [],
  logActivity: (action, target) =>
    set((state) => ({
      activity: [
        {
          id: createStoreId("activity"),
          action,
          target,
          createdAt: new Date().toISOString(),
        },
        ...state.activity,
      ].slice(0, 100),
    })),

  inviteTeammate: (email, role) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return false;
    const profile = useProfileStore.getState().profile;
    const hasConnection = useConnectionStore
      .getState()
      .connections.some(
        (connection) =>
          connection.email.toLowerCase() === normalizedEmail &&
          connection.status !== "declined",
      );
    const invitationExists = get().invitations.some(
      (invitation) =>
        invitation.email === normalizedEmail && invitation.status === "Pending",
    );
    if (
      invitationExists ||
      normalizedEmail === profile.email.toLowerCase() ||
      hasConnection
    ) {
      return false;
    }

    const invitation: Invitation = {
      id: createStoreId("invite"),
      email: normalizedEmail,
      role,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ invitations: [invitation, ...state.invitations] }));
    get().logActivity("Prepared teammate invite", normalizedEmail);
    return true;
  },
  revokeInvitation: (id) => {
    const invitation = get().invitations.find((item) => item.id === id);
    if (!invitation || invitation.status !== "Pending") return;
    set((state) => ({
      invitations: state.invitations.map((item) =>
        item.id === id ? { ...item, status: "Revoked" } : item,
      ),
    }));
    get().logActivity("Revoked teammate invite", invitation.email);
  },
  submitFeedback: (input) => {
    const entry: FeedbackEntry = {
      ...input,
      id: createStoreId("feedback"),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ feedback: [entry, ...state.feedback] }));
    get().logActivity("Sent product feedback", entry.topic);
  },
}));
