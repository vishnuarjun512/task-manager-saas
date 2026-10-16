"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Pencil,
  Target,
  Users,
} from "lucide-react";
import { TaskManager } from "@/components/task-manager";
import { hasProjectPermission } from "@/lib/project-roles";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

export function ProjectDetail({ id }: { id: string }) {
  const { projects, projectMembers, projectRoles } = useProjectStore();
  const { workspaces, loaded } = useWorkspaceStore();
  const { profile } = useProfileStore();
  const { user } = useAuthStore();
  const currentUserId = user?.user_id ?? profile.id;
  const project = projects.find((item) => item.id === id);
  const workspace = workspaces.find(
    (item) => item.workspace_id === project?.workspace_id,
  );

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

  const canManage = hasProjectPermission(
    project.id,
    currentUserId,
    "manage_members",
    projects,
    projectMembers,
    projectRoles,
  );

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
          className={`mt-2 size-3 shrink-0 rounded-full ${project.project_color}`}
        />
        <div className="flex flex-1 items-start justify-between gap-3">
          <div>
            <h1 className="text-[25px] font-semibold">{project.name}</h1>
            <p className="mt-1 max-w-2xl text-[12px] text-[#858b97]">
              {project.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="rounded-full bg-[#f0edff] px-2 py-1 capitalize text-[#5b49d4] dark:bg-white/10 dark:text-[#c6bdff]">
                {project.status.replace("_", " ")}
              </span>
              <span className="flex items-center gap-1 text-[#9297a3]">
                <Eye size={11} /> {project.visibility}
              </span>
            </div>
          </div>
          {canManage && (
            <Link
              href={`/projects/${encodeURIComponent(project.id)}/edit`}
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[#e1e3e9] px-3 py-2 text-[11px] font-medium hover:bg-[#f3f4f6] dark:border-white/10 dark:hover:bg-white/10"
            >
              <Pencil size={13} /> Edit project
            </Link>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <ProjectMetric icon={<Target size={18} />} label="Progress">
          <p className="mt-1 text-2xl font-semibold">{project.progress}%</p>
          <div className="mt-3 h-1.5 rounded-full bg-[#f0f1f4]">
            <div
              className={`h-full rounded-full ${project.project_color}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </ProjectMetric>
        <ProjectMetric icon={<CalendarDays size={18} />} label="Due date">
          <p className="mt-1 text-2xl font-semibold">
            {formatDate(project.due)}
          </p>
          <p className="mt-1 text-[10px] text-[#9297a3]">
            Starts {formatDate(project.start_date)}
          </p>
        </ProjectMetric>
        <ProjectMetric icon={<Users size={18} />} label="Project members">
          <p className="mt-1 text-2xl font-semibold">
            {project.members.length}
          </p>
          <p className="mt-1 truncate text-[10px] text-[#9297a3]">
            {workspace?.name ?? "Unknown workspace"}
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

function formatDate(value: string | null) {
  if (!value || value === "No due date") return "Not set";
  const date = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
