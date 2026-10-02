"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/orbit-workspace";
import { TaskList } from "@/components/task-list";
import { useWorkspaceStore } from "@/lib/workspace-store";

export function OverviewDashboard() {
  const { tasks, projects, activeWorkspaceId, connections } =
    useWorkspaceStore();
  const workspaceProjects = projects.filter(
    (project) => project.workspaceId === activeWorkspaceId,
  );
  const projectIds = useMemo(
    () => new Set(workspaceProjects.map((project) => project.id)),
    [workspaceProjects],
  );
  const workspaceTasks = tasks.filter((task) => projectIds.has(task.projectId));
  const openTasks = workspaceTasks.filter((task) => !task.completed);
  const completedTasks = workspaceTasks.filter((task) => task.completed);
  const pendingConnections = connections.filter(
    (connection) => connection.status === "pending",
  );
  const stats = [
    {
      label: "Projects",
      value: workspaceProjects.length,
      icon: FolderKanban,
      color: "text-[#6755e8]",
    },
    {
      label: "Open tasks",
      value: openTasks.length,
      icon: ListTodo,
      color: "text-[#c17628]",
    },
    {
      label: "Completed",
      value: completedTasks.length,
      icon: CheckCircle2,
      color: "text-[#32825f]",
    },
    {
      label: "Connection requests",
      value: pendingConnections.length,
      icon: Users,
      color: "text-[#3971b5]",
    },
  ];
  const upcomingTasks = [...openTasks]
    .sort((left, right) => {
      const leftDate = isDate(left.due) ? left.due : "9999-12-31";
      const rightDate = isDate(right.due) ? right.due : "9999-12-31";
      return leftDate.localeCompare(rightDate);
    })
    .slice(0, 4);
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <>
      <PageHeader
        eyebrow={today}
        title="Workspace overview"
        description="A clear view of active projects, tasks, and people."
        action={
          <Link
            href="/tasks"
            className="flex items-center gap-2 rounded-md bg-[#6755e8] px-3.5 py-2.5 text-[11px] font-semibold text-white hover:bg-[#5947d3]"
          >
            <ListTodo size={14} /> Open tasks
          </Link>
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg border border-[#e7e9ee] bg-white p-4 dark:border-white/10 dark:bg-[#181920]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium text-[#8d929e]">
                {label}
              </span>
              <Icon size={15} className={color} />
            </div>
            <p className="mt-3 text-[23px] font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold">My tasks</h2>
              <p className="mt-1 text-[10px] text-[#9ca1ac]">
                {openTasks.length} open in this workspace
              </p>
            </div>
            <Link
              href="/tasks"
              className="flex items-center gap-1 text-[10px] font-medium text-[#6755e8]"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <TaskList items={openTasks.slice(0, 5)} />
        </section>

        <section className="rounded-xl border border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]">
          <div className="flex items-center justify-between border-b border-[#eff0f3] px-4 py-3.5 dark:border-white/10 sm:px-5">
            <div>
              <h2 className="text-[13px] font-semibold">Project deadlines</h2>
              <p className="mt-1 text-[10px] text-[#9ca1ac]">
                Tasks with the nearest due dates
              </p>
            </div>
            <CalendarDays size={15} className="text-[#a4a8b3]" />
          </div>
          <div className="divide-y divide-[#eff0f3] px-4 dark:divide-white/10 sm:px-5">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <Link
                  key={task.id}
                  href="/tasks"
                  className="flex items-center gap-3 py-3.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#f5f3ff] text-[9px] font-semibold text-[#6755e8] dark:bg-white/5">
                    {shortDue(task.due)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium">
                      {task.title}
                    </span>
                    <span className="mt-1 block truncate text-[9px] text-[#9ca1ac]">
                      {task.project}
                    </span>
                  </span>
                  <ArrowRight size={13} className="shrink-0 text-[#b4b8c1]" />
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-[10px] text-[#9297a3]">
                No open tasks in this workspace.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold">Projects</h2>
            <p className="mt-1 text-[10px] text-[#9ca1ac]">
              {workspaceProjects.length} in this workspace
            </p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-[10px] font-medium text-[#6755e8]"
          >
            Manage projects <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {workspaceProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-lg border border-[#e7e9ee] bg-white p-4 transition hover:border-[#c9c4f4] dark:border-white/10 dark:bg-[#181920] dark:hover:border-white/20"
            >
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${project.color}`} />
                <span className="truncate text-[11px] font-semibold">
                  {project.name}
                </span>
                <span className="ml-auto text-[10px] text-[#9297a3]">
                  {project.progress}%
                </span>
              </div>
              <p className="mt-3 line-clamp-2 min-h-8 text-[10px] leading-4 text-[#858b97]">
                {project.description}
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#f0f1f4]">
                <div
                  className={`h-full ${project.color}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </Link>
          ))}
          {workspaceProjects.length === 0 && (
            <Link
              href="/projects"
              className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-[#dfe1e8] text-[10px] font-medium text-[#6755e8] dark:border-white/10"
            >
              Create the first project
            </Link>
          )}
        </div>
      </section>
    </>
  );
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function shortDue(value: string) {
  if (isDate(value)) {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(new Date(`${value}T12:00:00`));
  }
  return value === "No due date" ? "—" : value;
}
