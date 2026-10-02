"use client";

import { Command, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
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
                : "Your workspace is a few clicks away."}
            </p>
            <form
              className="mt-8 flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="flex flex-col gap-1.5 text-[12px] font-medium">
                Email
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="rounded-lg border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#6755e8] dark:border-white/10 dark:placeholder:text-[#777d89]"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[12px] font-medium">
                Password
                <input
                  type="password"
                  placeholder="••••••••"
                  className="rounded-lg border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#6755e8] dark:border-white/10 dark:placeholder:text-[#777d89]"
                  required
                />
              </label>
              {!isLogin && (
                <label className="flex flex-col gap-1.5 text-[12px] font-medium">
                  Workspace name
                  <input
                    type="text"
                    placeholder="Acme workspace"
                    className="rounded-lg border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#6755e8] dark:border-white/10 dark:placeholder:text-[#777d89]"
                    required
                  />
                </label>
              )}
              <button className="mt-2 rounded-lg bg-[#6755e8] py-3 text-[13px] font-semibold text-white hover:bg-[#5846d7]">
                {isLogin ? "Log in" : "Create account"}
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
            <p className="mt-5 text-center text-[10px] text-[#a0a5b0] dark:text-[#9297a3]">
              Authentication is ready to connect when a backend is enabled.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
