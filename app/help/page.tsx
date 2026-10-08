"use client";

import { useState, type FormEvent } from "react";
import { MessageSquareText } from "lucide-react";
import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";
import { KeyboardShortcutList } from "@/components/shortcuts-dialog";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useProfileStore } from "@/lib/stores/profile-store";

const questions = [
  {
    category: "Workspace",
    question: "How do I switch or create a workspace?",
    answer:
      "Use the workspace selector near the top of the sidebar to switch spaces. Open Workspaces from the sidebar to create, rename, or remove one.",
  },
  {
    category: "Tasks",
    question: "How do I organize a task under a project?",
    answer:
      "Create or edit a task from My tasks or a project page, then choose its project, priority, status, and due date. Completing a task updates its status across the workspace.",
  },
  {
    category: "Calendar",
    question: "How do I schedule a task?",
    answer:
      "Open Calendar, select one or more unscheduled tasks, then choose a date. You can also drag a task onto a day. Add a time from the schedule details panel.",
  },
  {
    category: "People",
    question: "How do connection requests work?",
    answer:
      "Open Connections and enter a teammate's Orbit ID. Incoming requests can be accepted or declined from Inbox or Connections.",
  },
  {
    category: "Data",
    question: "Where is my workspace data saved?",
    answer:
      "This preview uses in-memory mock data. Changes are available during your current session and are not synced to other people or devices.",
  },
];

const topics = ["Feature request", "Bug report", "Account question", "Other"];

export default function HelpPage() {
  const { profile } = useProfileStore();
  const { submitFeedback } = useActivityStore();
  const [topic, setTopic] = useState(topics[0]);
  const [email, setEmail] = useState(profile.email);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || !email.trim()) return;
    submitFeedback({ topic, email: email.trim(), message: message.trim() });
    setMessage("");
    setNotice("Feedback recorded for this session.");
  }

  return (
    <OrbitWorkspace>
      <PageHeader
        eyebrow="Support"
        title="Help & feedback"
        description="Answers for the workflows you use every day."
      />

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section>
          <h2 className="mb-3 text-[13px] font-semibold">Common questions</h2>
          <div className="divide-y divide-[#eff0f3] rounded-xl border border-[#e7e9ee] bg-white px-4 dark:divide-white/10 dark:border-white/10 dark:bg-[#181920] sm:px-5">
            {questions.map((item) => (
              <details key={item.question} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-start gap-3 py-1 text-[11px] font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">{item.question}</span>
                  <span className="text-[9px] font-normal text-[#9297a3]">
                    {item.category}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-1 text-[14px] leading-3 text-[#858b97] transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-1 pl-0 pr-6 pt-2 text-[10px] leading-5 text-[#777d89]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <section className="mt-6 rounded-xl border border-[#e7e9ee] bg-white p-4 dark:border-white/10 dark:bg-[#181920] sm:p-5">
            <div className="flex items-center gap-2">
              <MessageSquareText size={15} className="text-[#6755e8]" />
              <h2 className="text-[13px] font-semibold">Send feedback</h2>
            </div>
            <form
              onSubmit={sendFeedback}
              className="mt-4 flex flex-col gap-3.5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-[10px] font-medium">
                  Topic
                  <select
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="rounded-md border border-[#e1e3e9] bg-white px-3 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
                  >
                    {topics.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-[10px] font-medium">
                  Reply email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[11px] dark:border-white/10"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-[10px] font-medium">
                Message
                <textarea
                  required
                  rows={4}
                  maxLength={1200}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setNotice("");
                  }}
                  placeholder="Share your feedback"
                  className="resize-y rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[11px] outline-none focus:border-[#6755e8] dark:border-white/10"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p role="status" className="text-[10px] text-[#32825f]">
                  {notice}
                </p>
                <button
                  type="submit"
                  className="rounded-md bg-[#6755e8] px-3.5 py-2.5 text-[10px] font-semibold text-white hover:bg-[#5947d3]"
                >
                  Save feedback
                </button>
              </div>
            </form>
          </section>
        </section>

        <section className="rounded-xl border border-[#e7e9ee] bg-white p-4 dark:border-white/10 dark:bg-[#181920] sm:p-5">
          <h2 className="text-[13px] font-semibold">Keyboard shortcuts</h2>
          <p className="mt-1 text-[10px] text-[#9297a3]">
            Navigate and search without leaving the keyboard.
          </p>
          <div className="mt-3">
            <KeyboardShortcutList />
          </div>
        </section>
      </div>
    </OrbitWorkspace>
  );
}
