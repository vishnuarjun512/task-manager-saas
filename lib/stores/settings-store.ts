"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import type { WorkspacePreferences } from "@/lib/stores/types";

type SettingsState = {
  preferences: WorkspacePreferences;
  updatePreferences: (preferences: Partial<WorkspacePreferences>) => void;
};

const initialData = getMockWorkspaceData();

export const useSettingsStore = create<SettingsState>((set) => ({
  preferences: initialData.preferences,
  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),
}));
