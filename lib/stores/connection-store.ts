"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import { useActivityStore } from "@/lib/stores/activity-store";
import { createStoreId } from "@/lib/stores/ids";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { ConnectionRequest } from "@/lib/stores/types";

export const peopleDirectory = [
  { id: "ORB-1042", name: "Vishnu S", email: "vishnu@example.com" },
  { id: "ORB-2048", name: "Sarah Lee", email: "sarah.lee@example.com" },
  { id: "ORB-3196", name: "Marcus Chen", email: "marcus.chen@example.com" },
  { id: "ORB-4510", name: "Alex Rivera", email: "alex.rivera@example.com" },
  { id: "ORB-5873", name: "Jordan Davis", email: "jordan.davis@example.com" },
  { id: "ORB-6621", name: "Maya Patel", email: "maya.patel@example.com" },
] as const;

type ConnectionState = {
  connections: ConnectionRequest[];
  sendConnectionRequest: (personId: string) => boolean;
  updateConnectionStatus: (
    id: string,
    status: ConnectionRequest["status"],
  ) => void;
  deleteConnection: (id: string) => void;
};

const initialData = getMockWorkspaceData();

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: initialData.connections,
  sendConnectionRequest: (personId) => {
    const person = peopleDirectory.find(
      (candidate) =>
        candidate.id.toLowerCase() === personId.trim().toLowerCase(),
    );
    if (
      !person ||
      person.id === useProfileStore.getState().profile.id ||
      get().connections.some(
        (connection) =>
          connection.personId === person.id && connection.status !== "declined",
      )
    ) {
      return false;
    }
    set((state) => ({
      connections: [
        {
          id: createStoreId("connection"),
          personId: person.id,
          name: person.name,
          email: person.email,
          direction: "outgoing",
          status: "pending",
        },
        ...state.connections,
      ],
    }));
    useActivityStore
      .getState()
      .logActivity("Sent connection request", person.name);
    return true;
  },
  updateConnectionStatus: (id, status) =>
    set((state) => ({
      connections: state.connections.map((connection) =>
        connection.id === id ? { ...connection, status } : connection,
      ),
    })),
  deleteConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter(
        (connection) => connection.id !== id,
      ),
    })),
}));
