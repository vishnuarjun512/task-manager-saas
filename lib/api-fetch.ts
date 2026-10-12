import { toast } from "sonner";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class SessionExpiredError extends Error {
  constructor() {
    super("SESSION_EXPIRED");
    this.name = "SessionExpiredError";
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
let refreshRequest: Promise<boolean> | null = null;

export const isApiConfigured = Boolean(apiBaseUrl);

export async function apiFetch(
  path: string,
  method: ApiMethod,
  body?: unknown,
): Promise<Response> {
  if (!apiBaseUrl) {
    throw new Error("API URL is not configured.");
  }

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    credentials: "include",
    headers,
    ...(body !== undefined
      ? {
          body: JSON.stringify(body),
        }
      : {}),
  };

  let response = await fetch(`${apiBaseUrl}${path}`, options);

  if (response.status !== 401 || path.startsWith("/auth/")) {
    return response;
  }

  if (!refreshRequest) {
    toast("Refreshing Session", {
      id: "session-refresh",
      description: "Please wait while we restore your session...",
    });

    refreshRequest = fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((refreshResponse) => refreshResponse.ok)
      .finally(() => {
        toast.dismiss("session-refresh");
        refreshRequest = null;
      });
  }

  if (!(await refreshRequest)) {
    throw new SessionExpiredError();
  }

  response = await fetch(`${apiBaseUrl}${path}`, options);
  if (response.status === 401) {
    throw new SessionExpiredError();
  }

  return response;
}
