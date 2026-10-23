"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "./stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiFetch(
  path: string,
  method: ApiMethod = "GET",
  body?: unknown,
): Promise<Response> {
  if (!API_URL) {
    throw new Error("API URL is not configured.");
  }

  return fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && {
        "Content-Type": "application/json",
      }),
    },
    ...(body !== undefined && {
      body: JSON.stringify(body),
    }),
  });
}

export function useApi() {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const execute = useCallback(
    async (apiCall: () => Promise<Response>) => {
      try {
        let response = await apiCall();

        // Only refresh when an API request returns 401.
        if (response.status === 401) {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          // Refresh failed: session has expired.
          if (!refreshResponse.ok) {
            throw new Error("SESSION_EXPIRED");
          }

          // Retry the original API request.
          response = await apiCall();

          // Still unauthorized: end the session.
          if (response.status === 401) {
            throw new Error("SESSION_EXPIRED");
          }
        }

        return await response.json();
      } catch (error) {
        if (error instanceof Error && error.message === "SESSION_EXPIRED") {
          clearUser();
          toast.error("Session expired. Please log in again.");
          router.replace("/");
          throw error;
        }

        throw error instanceof Error
          ? error
          : new Error("Unable to connect to the server.");
      }
    },
    [clearUser, router],
  );

  return { execute };
}
