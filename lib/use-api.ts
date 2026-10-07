"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

type ApiResponse = {
  error?: unknown;
  message?: unknown;
  body?: unknown;
};

type ApiResult<T> = {
  data: T;
  message?: string;
};

export function useApi() {
  const router = useRouter();

  const execute = useCallback(
    async <T,>(
      apiCall: () => Promise<Response>,
    ): Promise<ApiResult<T>> => {
      try {
        const response = await apiCall();
        const responseBody = (await response.json().catch(() => null)) as
          | ApiResponse
          | null;
        const backendMessage =
          typeof responseBody?.message === "string" &&
          responseBody.message.trim()
            ? responseBody.message
            : undefined;

        if (response.status === 401) {
          router.push("/login");
          throw new Error(
            backendMessage ?? "Your session has expired. Please sign in again.",
          );
        }

        if (!response.ok || responseBody?.error === true) {
          throw new Error(backendMessage ?? "Something went wrong.");
        }

        return {
          data: (responseBody && "body" in responseBody
            ? responseBody.body
            : responseBody) as T,
          message: backendMessage,
        };
      } catch (cause) {
        const error =
          cause instanceof Error
            ? cause
            : new Error("Unable to connect to the server.");
        console.error("API request failed:", error);
        throw error;
      }
    },
    [router],
  );

  return { execute };
}
