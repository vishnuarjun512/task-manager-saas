export type AuthCredentials = {
  email: string;
  password: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function postCredentials(path: string, email: string, password: string) {
  if (!apiBaseUrl) {
    throw new Error("Authentication API URL is not configured.");
  }

  const credentials: AuthCredentials = { email, password };
  return fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function login(email: string, password: string) {
  return postCredentials("/auth/login", email, password);
}

export function register(email: string, password: string) {
  return postCredentials("/auth/register", email, password);
}

export function requestPasswordReset(email: string) {
  if (!apiBaseUrl) {
    throw new Error("Authentication API URL is not configured.");
  }

  return fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function execute(request: () => Promise<Response>) {
  let response: Response;

  try {
    response = await request();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Authentication API URL is not configured."
    ) {
      throw error;
    }

    throw new Error("Unable to connect to the authentication service.");
  }

  if (!response.ok) {
    const body = (await response
      .clone()
      .json()
      .catch(() => null)) as {
      message?: unknown;
    } | null;
    const message =
      typeof body?.message === "string" && body.message.trim()
        ? body.message
        : "The authentication request failed.";

    throw new Error(message);
  }

  return response;
}
