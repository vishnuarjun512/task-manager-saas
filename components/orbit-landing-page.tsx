"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  LayoutGrid,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: LayoutGrid,
    title: "One calm workspace",
    text: "Keep projects, tasks, notes, and momentum in one focused place.",
    tone: {
      icon: "bg-[#f0edff] text-[#6755e8] dark:bg-[#27253d]",
      border: "border-t-[#6755e8]",
    },
  },
  {
    icon: Timer,
    title: "Plan around time",
    text: "Turn loose tasks into thoughtful schedules with a calendar built for flow.",
    tone: {
      icon: "bg-[#e6f5f1] text-[#258875] dark:bg-[#193b36] dark:text-[#71c7b3]",
      border: "border-t-[#258875]",
    },
  },
  {
    icon: Users,
    title: "Move together",
    text: "Give every teammate clarity without adding another layer of meetings.",
    tone: {
      icon: "bg-[#fff0e9] text-[#d66a45] dark:bg-[#422b25] dark:text-[#f29a76]",
      border: "border-t-[#d66a45]",
    },
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    detail: "For personal momentum",
    items: ["Unlimited personal tasks", "Calendar planning", "One workspace"],
    action: "Start for free",
  },
  {
    name: "Team",
    price: "$12",
    detail: "Per member / month",
    items: ["Unlimited projects", "Team workspaces", "Advanced planning"],
    action: "Choose Team",
    featured: true,
  },
  {
    name: "Scale",
    price: "$24",
    detail: "Per member / month",
    items: ["Priority support", "Admin controls", "Workspace insights"],
    action: "Talk to sales",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Bring the work together",
    text: "Give projects, tasks, and conversations one shared home.",
  },
  {
    number: "02",
    title: "Make a thoughtful plan",
    text: "Turn priorities into a schedule your team can actually follow.",
  },
  {
    number: "03",
    title: "Keep good work moving",
    text: "See what's changing, celebrate progress, and choose the next step.",
  },
];

export function OrbitLanding() {
  return (
    <div className="orbit-landing min-h-screen bg-[#fbfbfd] text-[#20232d] dark:bg-[#111218] dark:text-[#f4f4f6]">
      <header className="sticky top-0 z-20 border-b border-[#ececf1] bg-[#fbfbfd]/90 backdrop-blur dark:border-white/10 dark:bg-[#111218]/90">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="flex h-18 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#6755e8] text-white">
                <Sparkles size={16} fill="currentColor" />
              </span>
              <span className="text-[17px] font-semibold tracking-[-0.02em]">
                Orbit
              </span>
            </Link>
            <nav
              aria-label="Page sections"
              className="hidden items-center gap-6 text-[13px] text-[#737987] dark:text-[#b7bac5] md:flex"
            >
              <Link
                href="#product"
                className="hover:text-[#20232d] dark:hover:text-white"
              >
                Product
              </Link>
              <Link
                href="#workflow"
                className="hover:text-[#20232d] dark:hover:text-white"
              >
                How it works
              </Link>
              <Link
                href="#about"
                className="hover:text-[#20232d] dark:hover:text-white"
              >
                About
              </Link>
              <Link
                href="#pricing"
                className="hover:text-[#20232d] dark:hover:text-white"
              >
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-[13px] font-medium text-[#737987] hover:text-[#20232d] dark:text-[#b7bac5] dark:hover:text-white sm:block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#6755e8] px-3.5 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-[#5846d7]"
              >
                Get started <ArrowRight size={14} className="ml-1 inline" />
              </Link>
            </div>
          </div>
          <nav
            aria-label="Page sections"
            className="flex gap-6 overflow-x-auto border-t border-[#ececf1] py-2.5 text-[12px] text-[#737987] dark:border-white/10 dark:text-[#b7bac5] md:hidden"
          >
            <Link className="shrink-0" href="#product">
              Product
            </Link>
            <Link className="shrink-0" href="#workflow">
              How it works
            </Link>
            <Link className="shrink-0" href="#about">
              About
            </Link>
            <Link className="shrink-0" href="#pricing">
              Pricing
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e4e0ff] bg-[#f3f1ff] px-3 py-1.5 text-[11px] font-medium text-[#6755e8] dark:border-[#6755e8]/40 dark:bg-[#27253d]">
              <span className="size-1.5 rounded-full bg-[#6755e8]" />A better
              way to work together
            </div>
            <h1 className="max-w-xl text-[clamp(42px,6vw,72px)] font-semibold leading-[.98] tracking-[-0.07em]">
              Make space for{" "}
              <span className="text-[#6755e8]">better work.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-7 text-[#737987] dark:text-[#b7bac5]">
              Orbit brings your projects, tasks, and team into a workspace that
              feels clear from the very first click.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/home"
                className="rounded-xl bg-[#6755e8] px-5 py-3 text-[13px] font-semibold text-white shadow-lg shadow-[#6755e8]/20 hover:bg-[#5846d7]"
              >
                Start for free <ArrowRight size={15} className="ml-1 inline" />
              </Link>
              <Link
                href="#product"
                className="rounded-xl border border-[#e4e5eb] bg-white px-5 py-3 text-[13px] font-semibold text-[#4c515e] hover:border-[#cfd1db] dark:border-white/10 dark:bg-[#181920] dark:text-[#e1e2e8] dark:hover:border-white/20"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-[11px] text-[#a0a5b0] dark:text-[#9297a3]">
              No credit card required · Set up in minutes
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[32px] bg-[#eeeaff] blur-2xl dark:bg-[#27253d]" />
            <div className="relative rounded-[22px] border border-[#e4e5eb] bg-white p-4 shadow-[0_24px_70px_-30px_rgba(50,42,120,.35)] dark:border-white/10 dark:bg-[#181920]">
              <div className="flex items-center justify-between border-b border-[#f0f1f4] pb-4 dark:border-white/10">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#a0a5b0] dark:text-[#9297a3]">
                    Monday, Oct 12
                  </p>
                  <h2 className="mt-1 text-[18px] font-semibold">
                    Good morning, Vishnu
                  </h2>
                </div>
                <div className="flex size-8 items-center justify-center rounded-full bg-[#d8e8ff] text-[10px] font-semibold text-[#3963a8]">
                  VS
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-[#f6f5ff] p-3 dark:bg-[#27253d]">
                  <p className="text-[10px] text-[#858b97] dark:text-[#aeb1bc]">
                    Open tasks
                  </p>
                  <p className="mt-2 text-xl font-semibold text-[#6755e8]">
                    24
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8f9fb] p-3 dark:bg-white/5">
                  <p className="text-[10px] text-[#858b97] dark:text-[#aeb1bc]">
                    In progress
                  </p>
                  <p className="mt-2 text-xl font-semibold">08</p>
                </div>
                <div className="rounded-xl bg-[#f8f9fb] p-3 dark:bg-white/5">
                  <p className="text-[10px] text-[#858b97] dark:text-[#aeb1bc]">
                    Completed
                  </p>
                  <p className="mt-2 text-xl font-semibold">16</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-[#ececf1] p-3 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold">
                    Today&apos;s focus
                  </p>
                  <span className="text-[10px] text-[#6755e8]">View all</span>
                </div>
                {[
                  "Finalize launch brief",
                  "Review design exploration",
                  "Team sync · 2:30 PM",
                ].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 border-t border-[#f2f2f5] py-2.5 dark:border-white/10"
                  >
                    <CheckCircle2
                      size={15}
                      className={i === 0 ? "text-[#6755e8]" : "text-[#c8cad1"}
                    />
                    <span className="flex-1 text-[11px] text-[#545966] dark:text-[#d7d8df]">
                      {item}
                    </span>
                    <span className="text-[10px] text-[#a0a5b0] dark:text-[#9297a3]">
                      {i === 2 ? "Today" : "Orbit"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section
          id="product"
          className="border-y border-[#ececf1] bg-white dark:border-white/10 dark:bg-[#15161d]"
        >
          <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-[#6755e8]">
                <Sparkles size={14} />
                Less noise, more momentum
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl">
                Everything your team needs to get into a good rhythm.
              </h2>
              <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#737987] dark:text-[#b7bac5]">
                One clear place to plan, prioritize, and keep good work moving.
              </p>
            </div>
            <div className="mt-14 grid gap-5 md:mt-16 md:grid-cols-3">
              {features.map(({ icon: Icon, title, text, tone }, index) => (
                <div
                  key={title}
                  className={`min-h-64 rounded-2xl border border-t-4 border-[#ececf1] ${tone.border} bg-white p-7 shadow-[0_12px_35px_-28px_rgba(32,35,45,.3)] transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-[#181920] sm:p-8`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl ${tone.icon}`}
                    >
                      <Icon size={21} />
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums text-[#a0a5b0] dark:text-[#777d89]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#737987] dark:text-[#aeb1bc]">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="workflow"
          className="border-b border-[#dcebe3] bg-[#f1f7f3] dark:border-white/10 dark:bg-[#141a18]"
        >
          <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#258875] dark:text-[#71c7b3]">
                A better workday, in three steps
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl">
                From scattered to in sync.
              </h2>
              <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#5f7068] dark:text-[#b2c2bb]">
                Keep the busywork light and make the next move easier to see.
              </p>
            </div>
            <div className="mt-14 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-10">
              {workflowSteps.map((step) => (
                <article
                  key={step.number}
                  className="border-t border-[#cddfd5] pt-5 dark:border-white/15"
                >
                  <span className="text-[13px] font-semibold tabular-nums text-[#258875] dark:text-[#71c7b3]">
                    {step.number}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-[#5f7068] dark:text-[#b2c2bb]">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="about"
          className="border-b border-[#f0e2da] bg-[#fff7f2] dark:border-white/10 dark:bg-[#1b1716]"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-32">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#d66a45] dark:text-[#f29a76]">
                A little about Orbit
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.08] sm:text-5xl">
                Ambitious work deserves a calmer system.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-7 text-[#786b66] dark:text-[#c3b3ad]">
                We believe good tools make the next step obvious, bring people
                closer to the work, and then get out of the way.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold text-[#b94d2c] hover:text-[#8f371d] dark:text-[#f29a76] dark:hover:text-[#ffc0a7]"
              >
                Read our story <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-6 border-l border-[#ead5ca] pl-6 dark:border-white/15 sm:pl-8">
              {[
                "Clarity over constant updates",
                "Shared context over scattered tools",
                "Steady momentum over busywork",
              ].map((principle) => (
                <div key={principle} className="flex items-center gap-3">
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-[#d66a45] dark:text-[#f29a76]"
                  />
                  <p className="text-[15px] font-medium text-[#554942] dark:text-[#e3d7d2]">
                    {principle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="pricing"
          className="border-y border-[#e9e5ff] bg-[#f7f6ff] dark:border-white/10 dark:bg-[#13141b]"
        >
          <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#6755e8]">
                Room to grow
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl">
                A plan for your way of working.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[16px] leading-7 text-[#737987] dark:text-[#b7bac5]">
                Start with the essentials, then bring your whole team along. No
                surprises, just more room to make progress.
              </p>
            </div>
            <div className="mt-14 grid items-stretch gap-5 md:mt-16 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-7 transition-transform hover:-translate-y-1 sm:p-8 ${plan.featured ? "border-[#6755e8] bg-[#6755e8] text-white shadow-[0_24px_60px_-30px_rgba(103,85,232,.75)] md:scale-[1.03]" : "border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]"}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.featured && (
                      <span className="rounded-full bg-[#d9ff72] px-2.5 py-1 text-[10px] font-semibold text-[#283315]">
                        Team favorite
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-[14px] ${plan.featured ? "text-white/75" : "text-[#858b97] dark:text-[#aeb1bc]"}`}
                  >
                    {plan.detail}
                  </p>
                  <p className="mt-8 text-5xl font-semibold tabular-nums">
                    {plan.price}
                    <span className="text-[13px] font-normal opacity-65">
                      {" "}
                      / month
                    </span>
                  </p>
                  <ul className="mt-8 flex flex-col gap-4">
                    {plan.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-[14px]"
                      >
                        <Check
                          size={14}
                          className={
                            plan.featured ? "text-white" : "text-[#6755e8]"
                          }
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`mt-10 block rounded-lg px-4 py-3.5 text-center text-[13px] font-semibold transition-colors ${plan.featured ? "bg-white text-[#6755e8] hover:bg-[#f1edff]" : "border border-[#e3e4ea] text-[#4c515e] hover:border-[#6755e8] hover:text-[#6755e8] dark:border-white/10 dark:text-[#e1e2e8] dark:hover:border-[#8878f2] dark:hover:text-white"}`}
                  >
                    {plan.action}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#ececf1] bg-white dark:border-white/10 dark:bg-[#15161d]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-[12px] text-[#858b97] dark:text-[#aeb1bc] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link
            href="/"
            className="font-semibold text-[#20232d] dark:text-[#f4f4f6]"
          >
            Orbit
          </Link>
          <div className="flex gap-5">
            <Link href="#about">About</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/login">Log in</Link>
          </div>
          <span>© 2026 Orbit Workspace</span>
        </div>
      </footer>
    </div>
  );
}

export function PricingPage() {
  return <OrbitLanding />;
}

export { plans };
export { features };
export default OrbitLanding;
