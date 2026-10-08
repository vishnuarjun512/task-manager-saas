"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Command, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DialogShell } from "@/components/dialog-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { login, register, requestPasswordReset } from "@/lib/auth-api";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { AuthUser } from "@/lib/stores/types";
import { useApi } from "@/lib/use-api";

const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(3, "Password must be at least 3 characters."),
});

type Credentials = z.infer<typeof credentialsSchema>;
const resetEmailSchema = z.object({
  email: z.email("Enter a valid email address."),
});
type ResetEmail = z.infer<typeof resetEmailSchema>;

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();
  const { execute } = useApi();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register: registerField,
    handleSubmit,
    getValues,
    reset: resetCredentials,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ resolver: zodResolver(credentialsSchema) });

  const {
    register: registerResetEmail,
    handleSubmit: handleResetSubmit,
    setValue: setResetValue,
    reset: resetForgotForm,
    formState: { errors: resetErrors, isSubmitting: isSendingReset },
  } = useForm<ResetEmail>({ resolver: zodResolver(resetEmailSchema) });

  const onSubmit = async ({ email, password }: Credentials) => {
    try {
      let message: string | undefined;
      if (isLogin) {
        const data = await execute(() => login(email, password));
        if (!data.user) {
          throw new Error("Login response did not include user data.");
        }
        setUser(data.user);
        message = data.message;
      } else {
        ({ message } = await execute(() => register(email, password)));
      }
      toast.success(isLogin ? "Welcome back" : "Account created", {
        description:
          message ??
          (isLogin
            ? "You have been signed in successfully."
            : "Your account has been created successfully."),
      });
      if (isLogin) {
        router.push("/home");
      } else {
        resetCredentials();
        resetForgotForm();
        setForgotPasswordOpen(false);
        router.replace("/login");
      }
    } catch (error) {
      toast.error(isLogin ? "Login failed" : "Registration failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const onForgotPassword = async ({ email }: ResetEmail) => {
    try {
      const { message } = await execute(() => requestPasswordReset(email));
      toast.success("Password reset requested", {
        description:
          message ??
          "If an account exists for that email, a reset link will be sent.",
      });
      setForgotPasswordOpen(false);
      resetForgotForm();
    } catch (error) {
      toast.error("Password reset failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#fbfbfd] px-5 py-10 dark:bg-[#111218]">
      <ThemeToggle className="absolute right-5 top-5" />
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-[#e7e8ee] bg-white text-[#20232d] shadow-[0_24px_80px_-32px_rgba(50,42,120,.3)] dark:border-white/10 dark:bg-[#181920] dark:text-[#f4f4f6] md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-[#6755e8] p-10 text-white md:flex">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Sparkles size={17} fill="currentColor" /> Orbit
            </Link>
            <h1 className="mt-20 text-4xl font-semibold leading-tight tracking-[-.06em]">
              Make room for the work that matters.
            </h1>
            <p className="mt-5 text-sm leading-6 text-white/70">
              A focused home for your projects, priorities, and people.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Command size={14} /> Built for thoughtful teams
          </div>
        </div>
        <div className="p-7 sm:p-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold md:hidden"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#6755e8] text-white">
              <Sparkles size={14} fill="currentColor" />
            </span>{" "}
            Orbit
          </Link>
          <div className="mt-8 md:mt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#6755e8]">
              {isLogin ? "Welcome back" : "Get started"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tighter">
              {isLogin ? "Log in to Orbit" : "Create your account"}
            </h2>
            <p className="mt-2 text-[13px] text-[#858b97] dark:text-[#aeb1bc]">
              {isLogin
                ? "Continue where you left off."
                : "Create an account with your email and password."}
            </p>
            <form
              className="mt-8 flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label className="flex flex-col gap-1.5 text-[12px] font-medium">
                Email
                <input
                  {...registerField("email")}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  className="rounded-lg border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#6755e8] aria-invalid:border-red-500 dark:border-white/10 dark:placeholder:text-[#777d89]"
                />
                {errors.email && (
                  <span className="text-[11px] text-red-600" role="alert">
                    {errors.email.message}
                  </span>
                )}
              </label>
              <label className="flex flex-col gap-1.5 text-[12px] font-medium">
                Password
                <input
                  {...registerField("password")}
                  type="password"
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  aria-invalid={Boolean(errors.password)}
                  className="rounded-lg border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#6755e8] aria-invalid:border-red-500 dark:border-white/10 dark:placeholder:text-[#777d89]"
                />
                {errors.password && (
                  <span className="text-[11px] text-red-600" role="alert">
                    {errors.password.message}
                  </span>
                )}
              </label>
              {isLogin && (
                <button
                  className="self-end text-[11px] font-medium text-[#6755e8] hover:underline"
                  onClick={() => {
                    setResetValue("email", getValues("email"));
                    setForgotPasswordOpen(true);
                  }}
                  type="button"
                >
                  Forgot password?
                </button>
              )}
              <button
                className="mt-2 rounded-lg bg-[#6755e8] py-3 text-[13px] font-semibold text-white hover:bg-[#5846d7] disabled:cursor-wait disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isLogin
                    ? "Log in"
                    : "Create account"}
              </button>
            </form>
            <p className="mt-6 text-center text-[12px] text-[#858b97] dark:text-[#aeb1bc]">
              {isLogin ? "New to Orbit?" : "Already have an account?"}{" "}
              <Link
                href={isLogin ? "/register" : "/login"}
                className="font-semibold text-[#6755e8]"
              >
                {isLogin ? "Create an account" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
      {forgotPasswordOpen && (
        <DialogShell
          title="Reset your password"
          description="Enter your email and we’ll send a password reset link if an account exists."
          onClose={() => setForgotPasswordOpen(false)}
        >
          <form
            className="mt-5 flex flex-col gap-4"
            onSubmit={handleResetSubmit(onForgotPassword)}
          >
            <label className="flex flex-col gap-1.5 text-[12px] font-medium">
              Email
              <input
                {...registerResetEmail("email")}
                autoFocus
                autoComplete="email"
                type="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(resetErrors.email)}
                className="rounded-lg border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#6755e8] aria-invalid:border-red-500 dark:border-white/10 dark:placeholder:text-[#777d89]"
              />
              {resetErrors.email && (
                <span className="text-[11px] text-red-600" role="alert">
                  {resetErrors.email.message}
                </span>
              )}
            </label>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md px-3 py-2 text-[11px] font-medium text-[#777d89] hover:bg-[#f3f4f6] dark:hover:bg-white/5"
                onClick={() => setForgotPasswordOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#5846d7] disabled:opacity-60"
                disabled={isSendingReset}
                type="submit"
              >
                {isSendingReset ? "Sending..." : "Send reset link"}
              </button>
            </div>
          </form>
        </DialogShell>
      )}
    </main>
  );
}
