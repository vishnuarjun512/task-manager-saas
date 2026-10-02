import { AuthShell } from "@/app/(auth)/AuthShell";

export const metadata = { title: "Log in — Orbit" };

export default function LoginPage() {
  return <AuthShell mode="login" />;
}
