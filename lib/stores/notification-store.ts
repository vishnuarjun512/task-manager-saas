"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import { createStoreId } from "@/lib/stores/ids";
import type { Notification } from "@/lib/stores/types";

type NotificationState = {
  notifications: Notification[];
  addNotification: (
    input: Omit<Notification, "id" | "createdAt" | "read">,
  ) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
};

const initialData = getMockWorkspaceData();

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialData.notifications,
  addNotification: (input) =>
    set((state) => ({
      notifications: [
        {
          ...input,
          id: createStoreId("notification"),
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
