import { apiFetch } from "@/lib/api-fetch";

export function login(email: string, password: string) {
  return apiFetch("/auth/login", "POST", { email, password });
}

export function register(email: string, password: string) {
  return apiFetch("/auth/register", "POST", { email, password });
}

export function requestPasswordReset(email: string) {
  return apiFetch("/auth/forgot-password", "POST", { email });
}
