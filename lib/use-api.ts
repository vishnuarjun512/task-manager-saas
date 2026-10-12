"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SessionExpiredError } from "@/lib/api-fetch";
import { useAuthStore } from "./stores/auth-store";

export function useApi() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const execute = useCallback(
    async (apiCall: () => Promise<Response>) => {
      try {
        const response = await apiCall();

        if (!response.ok) {
          throw new Error("Something went wrong.");
        }

        const responseText = await response.text();
        const responseBody = responseText.trim()
          ? JSON.parse(responseText)
          : undefined;

        return responseBody;
      } catch (cause) {
        if (cause instanceof SessionExpiredError) {
          clearUser();
          toast.error("Session expired");
          router.replace("/");
          throw cause;
        }

        throw cause instanceof Error
          ? cause
          : new Error("Unable to connect to the server.");
      }
    },
    [clearUser, router],
  );

  return { execute };
}
