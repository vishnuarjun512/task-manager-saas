import { ArrowRight, CalendarDays, Inbox, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "About — Orbit" };

const principles = [
  {
    icon: Inbox,
    title: "Keep context together",
    text: "Projects, tasks, and team details stay close enough to act on.",
  },
  {
    icon: CalendarDays,
    title: "Plan with time in mind",
    text: "Turn priorities into a schedule that leaves room for focused work.",
  },
  {
    icon: Users,
    title: "Make progress visible",
    text: "Give everyone a shared view of what is moving and where help is needed.",
  },
];

export default function AboutRoute() {
  return (
    <main className="min-h-screen bg-[#fbfbfd] text-[#20232d] dark:bg-[#111218] dark:text-[#f4f4f6]">
      <header className="border-b border-[#ececf1] bg-white dark:border-white/10 dark:bg-[#15161d]">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#6755e8] text-white">
              <Sparkles size={15} fill="currentColor" />
            </span>{" "}
            Orbit
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-[13px] text-[#737987] dark:text-[#b7bac5]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
        <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#6755e8]">
          The story behind Orbit
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
          Work should feel clear.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#737987] dark:text-[#b7bac5]">
          Orbit is for teams who want less ceremony and more momentum: one
          thoughtful place to see the work, make a plan, and move forward
          together.
        </p>
      </section>

      <section className="border-y border-[#ececf1] bg-white dark:border-white/10 dark:bg-[#15161d]">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#6755e8]">
              Why we are building it
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Good work gets harder when its context is scattered.
            </h2>
          </div>
          <div className="space-y-5 text-[15px] leading-7 text-[#646a76] dark:text-[#b7bac5]">
            <p>
              Most teams do not lack ideas. The hard part is keeping plans,
              tasks, and people connected as the day fills up. Priorities blur,
              updates pile on, and someone has to piece together what matters
              again.
            </p>
            <p>
              Orbit starts with a simple belief: a good workspace should make
              the next step easier to see. Bring the plan close to the work,
              give the team a shared view, and leave enough quiet for people to
              focus.
            </p>
            <p className="border-l-2 border-[#6755e8] pl-4 font-medium text-[#353944] dark:text-[#e3e4e8]">
              Less time connecting dots. More room to move forward together.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#6755e8]">
            What guides the product
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            A calmer way to make progress.
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
          {principles.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className="border-t border-[#e7e9ee] pt-6 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#f0edff] text-[#6755e8] dark:bg-[#27253d]">
                  <Icon size={19} />
                </span>
                <span className="text-[12px] font-semibold tabular-nums text-[#a0a5b0] dark:text-[#777d89]">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-[14px] leading-6 text-[#858b97] dark:text-[#aeb1bc]">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e9e5ff] bg-[#f7f6ff] dark:border-white/10 dark:bg-[#15161d]">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-16">
          <div>
            <p className="text-xl font-semibold">Make room for good work.</p>
            <p className="mt-2 text-[14px] text-[#737987] dark:text-[#b7bac5]">
              Start with a clearer view of what comes next.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6755e8] px-4 py-3 text-[13px] font-semibold text-white hover:bg-[#5846d7]"
          >
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
