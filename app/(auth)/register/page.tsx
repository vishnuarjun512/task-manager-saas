import { AuthShell } from "@/app/(auth)/AuthShell";

export const metadata = { title: "Register in — Orbit" };

export default function RegisterPage() {
  return <AuthShell mode="register" />;
}
