"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import { useActivityStore } from "@/lib/stores/activity-store";
import type { Profile } from "@/lib/stores/types";

type ProfileState = {
  profile: Profile;
  updateProfile: (profile: Profile) => void;
};

const initialData = getMockWorkspaceData();

export const useProfileStore = create<ProfileState>((set) => ({
  profile: initialData.profile,
  updateProfile: (profile) => {
    set({ profile });
    useActivityStore.getState().logActivity("Updated profile", profile.name);
  },
}));
