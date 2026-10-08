"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Target } from "lucide-react";
import { TaskManager } from "@/components/task-manager";
import { useProjectStore } from "@/lib/stores/project-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export function ProjectDetail({ id }: { id: string }) {
  const { projects } = useProjectStore();
  const { workspaces, loaded } = useWorkspaceStore();
  const project = projects.find((item) => item.id === id);
  const workspace = workspaces.find((item) => item.id === project?.workspaceId);

  if (!project) {
    return (
      <div>
        <Link
          href="/projects"
          className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium text-[#6755e8]"
        >
          <ArrowLeft size={14} /> All projects
        </Link>
        <h1 className="text-[22px] font-semibold">
          {loaded ? "Project not found" : "Loading project…"}
        </h1>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/projects"
        className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium text-[#6755e8]"
      >
        <ArrowLeft size={14} /> All projects
      </Link>
      <div className="flex items-start gap-3">
        <span
          className={`mt-2 size-3 shrink-0 rounded-full ${project.color}`}
        />
        <div>
          <h1 className="text-[25px] font-semibold">{project.name}</h1>
          <p className="mt-1 max-w-2xl text-[12px] text-[#858b97]">
            {project.description}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <ProjectMetric icon={<Target size={18} />} label="Progress">
          <p className="mt-1 text-2xl font-semibold">{project.progress}%</p>
          <div className="mt-3 h-1.5 rounded-full bg-[#f0f1f4]">
            <div
              className={`h-full rounded-full ${project.color}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </ProjectMetric>
        <ProjectMetric icon={<CalendarDays size={18} />} label="Due date">
          <p className="mt-1 text-2xl font-semibold">
            {formatDate(project.due)}
          </p>
        </ProjectMetric>
        <ProjectMetric label="Workspace">
          <p className="mt-1 truncate text-[15px] font-semibold">
            {workspace?.name ?? "Unknown workspace"}
          </p>
          <p className="mt-1 font-mono text-[9px] text-[#9297a3]">
            {workspace?.id}
          </p>
        </ProjectMetric>
      </div>

      <TaskManager projectId={project.id} />
    </>
  );
}

function ProjectMetric({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e7e9ee] bg-white p-5 dark:border-white/10 dark:bg-[#181920]">
      {icon && <div className="text-[#6755e8]">{icon}</div>}
      <p className={`${icon ? "mt-4" : ""} text-[11px] text-[#9ca1ac]`}>
        {label}
      </p>
      {children}
    </section>
  );
}

function formatDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}
