export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export function apiFetch(
  path: string,
  method: ApiMethod,
  body?: unknown,
): Promise<Response> {
  if (!apiBaseUrl) {
    throw new Error("API URL is not configured.");
  }

  return fetch(`${apiBaseUrl}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
