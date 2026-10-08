"use client";

import { create } from "zustand";
import { getMockWorkspaceData } from "@/lib/mock-api";
import type { Message } from "@/lib/stores/types";

type MessageState = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  markMessageRead: (id: string) => void;
  clearMessages: () => void;
};

const initialData = getMockWorkspaceData();

export const useMessageStore = create<MessageState>((set) => ({
  messages: initialData.messages,
  setMessages: (messages) => set({ messages }),
  markMessageRead: (id) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, read: true } : message,
      ),
    })),
  clearMessages: () => set({ messages: [] }),
}));
