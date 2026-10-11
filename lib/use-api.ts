"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./stores/auth-store";

export function useApi() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const execute = useCallback(
    async (apiCall: () => Promise<Response>) => {
      try {
        const response = await apiCall();

        if (response.status === 401) {
          clearUser();
          router.push("/login");
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (!response.ok) {
          throw new Error("Something went wrong.");
        }

        const responseText = await response.text();
        const responseBody = responseText.trim()
          ? JSON.parse(responseText)
          : undefined;

        return responseBody;
      } catch (cause) {
        throw cause instanceof Error
          ? cause
          : new Error("Unable to connect to the server.");
      }
    },
    [router],
  );

  return { execute };
}
