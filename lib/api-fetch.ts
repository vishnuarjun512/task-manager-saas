export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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

  // 1. Make the original request

  let response = await fetch(`${apiBaseUrl}${path}`, options);

  // 2. If it wasn't unauthorized, return it normally
  if (response.status !== 401) {
    return response;
  }

  // 3. Access token expired/missing → try refresh
  const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  // 4. Refresh token also invalid/expired
  if (!refreshResponse.ok) {
    throw new Error("SESSION_EXPIRED");
  }

  // 5. Refresh succeeded → retry original request once
  response = await fetch(`${apiBaseUrl}${path}`, options);

  // 6. If it is still 401, don't keep retrying
  if (response.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  return response;
}
