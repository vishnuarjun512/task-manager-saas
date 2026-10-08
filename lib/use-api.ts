"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useApi() {
  const router = useRouter();

  const execute = useCallback(
    async (apiCall: () => Promise<Response>) => {
      try {
        const response = await apiCall();

        const responseBody = await response.json();

        if (response.status === 401) {
          router.push("/login");
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (!response.ok) {
          throw new Error("Something went wrong.");
        }

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
