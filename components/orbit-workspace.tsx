"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  Copy,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  UserRound,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { projectData, tasks } from "@/lib/orbit-data";
import { InviteTeammateDialog } from "@/components/invite-teammate-dialog";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import { useWorkspaceStore } from "@/lib/workspace-store";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/tasks", label: "My tasks", icon: ListTodo },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/connections", label: "Connections", icon: Users },
  { href: "/workspaces", label: "Workspaces", icon: BriefcaseBusiness },
];

export function OrbitWorkspace({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    projects,
    tasks: allTasks,
    connections,
    profile,
  } = useWorkspaceStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileIdCopied, setProfileIdCopied] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );
  const workspaceProjects = projects.filter(
    (project) => project.workspaceId === activeWorkspaceId,
  );
  const workspaceProjectIds = new Set(
    workspaceProjects.map((project) => project.id),
  );
  const workspaceTasks = allTasks.filter((task) =>
    workspaceProjectIds.has(task.projectId),
  );
  const openTaskCount = workspaceTasks.filter((task) => !task.completed).length;
  const incomingCount = connections.filter(
    (connection) =>
      connection.direction === "incoming" && connection.status === "pending",
  ).length;
  const currentLabel = useMemo(() => {
    const route = navigation.find((item) => item.href === pathname);
    if (route) return route.label;
    const project = projects.find((item) => pathname.includes(item.id));
    return (
      project?.name ?? (pathname === "/projects" ? "Projects" : "Workspace")
    );
  }, [pathname, projects]);

  useEffect(() => {
    const saved = window.localStorage.getItem("orbit-theme") === "dark";
    // Hydration-safe: initialize from localStorage after mount so the server
    // and client render the same markup before the browser restores state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target;
      const editingText =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      } else if (event.key === "?" && !editingText) {
        event.preventDefault();
        setShortcutsOpen(true);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
        setWorkspaceOpen(false);
        setProfileOpen(false);
        setInviteOpen(false);
        setShortcutsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("orbit-theme", next ? "dark" : "light");
  }

  async function copyProfileId() {
    try {
      await navigator.clipboard.writeText(profile.id);
      setProfileIdCopied(true);
      window.setTimeout(() => setProfileIdCopied(false), 1600);
    } catch {
      setProfileIdCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#20232d] dark:bg-[#111218] dark:text-[#f4f4f6]">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-20 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-62 flex-col border-r border-[#e6e8ed] bg-white px-4 py-5 transition-transform dark:border-white/10 dark:bg-[#181920] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#6755e8] text-white">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <span className="text-[17px] font-semibold">Orbit</span>
            <button
              type="button"
              aria-label="Close navigation"
              className="ml-auto rounded-md p-1 text-[#9da2ae] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <WorkspacePicker
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            activeWorkspaceName={activeWorkspace?.name ?? "Workspace"}
            open={workspaceOpen}
            onToggle={() => setWorkspaceOpen((value) => !value)}
            onSelect={(id) => {
              setActiveWorkspace(id);
              setWorkspaceOpen(false);
            }}
          />

          <nav
            className="mt-7 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
            aria-label="Main navigation"
          >
            <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-[#a3a7b1]">
              Workspace
            </p>
            {navigation.map(({ href, label, icon: Icon }) => {
              const count =
                href === "/tasks"
                  ? openTaskCount
                  : href === "/inbox"
                    ? incomingCount
                    : null;
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-[12px] font-medium ${active ? "bg-[#f0edff] text-[#5b49d4] dark:bg-white/10 dark:text-[#c6bdff]" : "text-[#737987] hover:bg-[#f5f6f8] dark:hover:bg-white/5"}`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  {count !== null && count > 0 && (
                    <span className="rounded-md bg-[#f1f2f5] px-1.5 py-0.5 text-[9px] text-[#9297a3] dark:bg-white/10">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="mb-1 mt-6 flex items-center justify-between px-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[#a3a7b1]">
                Projects
              </p>
              <Link
                href="/projects"
                aria-label="All projects"
                className="rounded p-1 text-[#a3a7b1] hover:bg-[#f3f4f6] hover:text-[#6755e8] dark:hover:bg-white/10"
              >
                <Plus size={13} />
              </Link>
            </div>
            {workspaceProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-[12px] ${pathname === `/projects/${project.id}` ? "bg-[#f0edff] text-[#5b49d4] dark:bg-white/10 dark:text-[#c6bdff]" : "text-[#737987] hover:bg-[#f5f6f8] dark:hover:bg-white/5"}`}
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${project.color}`}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
            {workspaceProjects.length === 0 && (
              <p className="px-3 py-2 text-[10px] text-[#a3a7b1]">
                No projects yet
              </p>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-1 border-t border-[#eff0f3] pt-3 dark:border-white/10">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[12px] text-[#737987] hover:bg-[#f5f6f8] dark:hover:bg-white/5"
            >
              <Settings size={16} /> Settings
            </Link>
            <div className="relative">
              <button
                type="button"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((value) => !value)}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-[#f5f6f8] dark:hover:bg-white/5"
              >
                <Avatar name={profile.name} />
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                  {profile.name}
                </span>
                <MoreHorizontal size={16} className="text-[#a2a6b0]" />
              </button>
              {profileOpen && (
                <div className="absolute bottom-full left-0 right-0 z-40 mb-2 rounded-xl border border-[#e6e8ed] bg-white p-2 text-[11px] shadow-xl dark:border-white/10 dark:bg-[#22232c]">
                  <div className="mb-2 border-b border-[#eff0f3] px-2 pb-2.5 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={profile.name} />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold">
                          {profile.name}
                        </p>
                        <p className="truncate text-[9px] text-[#9297a3]">
                          {profile.email}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[9px] text-[#777d89]">
                          <span
                            className={`size-1.5 rounded-full ${profile.availability === "Available" ? "bg-[#32825f]" : profile.availability === "Away" ? "bg-[#e28a4a]" : "bg-[#b93d3d]"}`}
                          />
                          {profile.availability}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={copyProfileId}
                      className="mt-2 flex w-full items-center gap-2 rounded-md bg-[#f7f8fa] px-2 py-1.5 text-left font-mono text-[9px] text-[#777d89] hover:bg-[#f0edff] dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      {profileIdCopied ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span className="flex-1">
                        {profileIdCopied ? "Copied Orbit ID" : profile.id}
                      </span>
                    </button>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f6f8] dark:hover:bg-white/5"
                  >
                    <UserRound size={14} /> My profile
                  </Link>
                  <Link
                    href="/connections"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f6f8] dark:hover:bg-white/5"
                  >
                    <Users size={14} /> Connections
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f6f8] dark:hover:bg-white/5"
                  >
                    <Settings size={14} /> Account settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setInviteOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-[#f5f6f8] dark:hover:bg-white/5"
                  >
                    <UserPlus size={14} /> Invite teammates
                  </button>
                  <Link
                    href="/help"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[#f5f6f8] dark:hover:bg-white/5"
                  >
                    <CircleHelp size={14} /> Help & feedback
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setShortcutsOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-[#f5f6f8] dark:hover:bg-white/5"
                  >
                    <Command size={14} /> Keyboard shortcuts
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="mt-1 flex w-full items-center gap-2 border-t border-[#eff0f3] px-2 py-2 text-left hover:bg-[#f5f6f8] dark:border-white/10 dark:hover:bg-white/5"
                  >
                    {dark ? <Sun size={14} /> : <Moon size={14} />}
                    {dark ? "Switch to light mode" : "Switch to dark mode"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-17 items-center justify-between border-b border-[#e6e8ed] bg-white/85 px-4 backdrop-blur dark:border-white/10 dark:bg-[#181920]/85 sm:px-6 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                className="rounded-lg p-2 hover:bg-[#f2f3f6] lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={19} />
              </button>
              <div className="hidden items-center gap-2 text-[11px] text-[#a0a5b0] sm:flex">
                <span>{activeWorkspace?.name ?? "Workspace"}</span>
                <span>/</span>
                <span className="font-medium text-[#4b505c] dark:text-[#d7d8df]">
                  {currentLabel}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Search tasks and projects"
                onClick={() => setSearchOpen((value) => !value)}
                className="flex items-center gap-2 rounded-lg border border-[#e6e8ed] px-2.5 py-1.5 text-[11px] text-[#9ba0ab] dark:border-white/10"
              >
                <Search size={15} />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden rounded bg-[#f1f2f5] px-1.5 py-0.5 text-[9px] sm:inline">
                  ⌘ K
                </kbd>
              </button>
              <Link
                href="/inbox"
                aria-label="Open inbox"
                className="relative rounded-lg p-2 text-[#7e8491] hover:bg-[#f5f6f8] dark:hover:bg-white/5"
              >
                <Bell size={17} />
                {incomingCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#e28a4a]" />
                )}
              </Link>
              <Link href="/profile" aria-label="View profile">
                <Avatar name={profile.name} />
              </Link>
            </div>
          </header>
          {searchOpen && (
            <>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="fixed inset-0 z-30 cursor-default bg-black/10 backdrop-blur-[1px]"
              />
              <SearchPanel
                projects={workspaceProjects}
                tasks={workspaceTasks}
                onClose={() => setSearchOpen(false)}
              />
            </>
          )}
          {inviteOpen && (
            <InviteTeammateDialog onClose={() => setInviteOpen(false)} />
          )}
          {shortcutsOpen && (
            <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />
          )}
          <div className="mx-auto w-full max-w-330 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function WorkspacePicker({
  workspaces,
  activeWorkspaceId,
  activeWorkspaceName,
  open,
  onToggle,
  onSelect,
}: {
  workspaces: ReturnType<typeof useWorkspaceStore>["workspaces"];
  activeWorkspaceId: string;
  activeWorkspaceName: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative mt-7">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg border border-[#e8e9ee] px-2.5 py-2 text-left text-[11px] dark:border-white/10"
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#e8e3ff] text-[9px] font-bold text-[#6755e8]">
          {initials(activeWorkspaceName)}
        </div>
        <span className="flex-1 truncate font-medium">
          {activeWorkspaceName}
        </span>
        <ChevronDown size={14} className="text-[#a2a6b0]" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-10 z-20 rounded-xl border border-[#e6e8ed] bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#22232c]">
          <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-widest text-[#a3a7b1]">
            Your workspaces
          </p>
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              onClick={() => onSelect(workspace.id)}
              className={`mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] ${workspace.id === activeWorkspaceId ? "bg-[#f0edff] text-[#5b49d4] dark:bg-white/10" : "hover:bg-[#f5f6f8] dark:hover:bg-white/5"}`}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#e8e3ff] text-[9px] font-bold text-[#6755e8]">
                {initials(workspace.name)}
              </span>
              <span className="flex-1 truncate">{workspace.name}</span>
              {workspace.id === activeWorkspaceId && <Check size={13} />}
            </button>
          ))}
          <Link
            href="/workspaces"
            className="mt-2 flex items-center gap-2 rounded-lg border-t border-[#eff0f3] px-2 py-2.5 text-[10px] font-medium text-[#6755e8] dark:border-white/10"
          >
            <Plus size={13} /> Manage workspaces
          </Link>
        </div>
      )}
    </div>
  );
}

function SearchPanel({
  projects,
  tasks,
  onClose,
}: {
  projects: ReturnType<typeof useWorkspaceStore>["projects"];
  tasks: ReturnType<typeof useWorkspaceStore>["tasks"];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const matchingProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(normalized),
  );
  const matchingTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(normalized),
  );

  return (
    <div className="fixed left-1/2 top-19 z-40 w-[min(720px,calc(100vw-24px))] -translate-x-1/2 rounded-xl border border-[#e5e7ec] bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#22232c] sm:top-20 sm:p-5">
      <div className="flex items-center gap-3 rounded-lg bg-[#f7f8fa] px-4 dark:bg-white/5">
        <Search size={17} className="shrink-0 text-[#9297a3]" />
        <input
          autoFocus
          aria-label="Search tasks and projects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks and projects"
          className="min-w-0 flex-1 bg-transparent py-3.5 text-[13px] outline-none"
        />
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="rounded p-1 text-[#9297a3] hover:bg-white dark:hover:bg-white/10"
        >
          <X size={13} />
        </button>
      </div>
      {query && (
        <div className="mt-2 max-h-64 overflow-y-auto">
          {matchingProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              onClick={onClose}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-[11px] hover:bg-[#f5f6f8] dark:hover:bg-white/5"
            >
              <FolderKanban size={13} className="text-[#6755e8]" />{" "}
              {project.name}
            </Link>
          ))}
          {matchingTasks.map((task) => (
            <Link
              key={task.id}
              href="/tasks"
              onClick={onClose}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-[11px] hover:bg-[#f5f6f8] dark:hover:bg-white/5"
            >
              <ListTodo size={13} className="text-[#6755e8]" /> {task.title}
            </Link>
          ))}
          {matchingProjects.length === 0 && matchingTasks.length === 0 && (
            <p className="px-2 py-3 text-[10px] text-[#9297a3]">
              No matching tasks or projects.
            </p>
          )}
        </div>
      )}
      {!query && (
        <p className="px-2 py-3 text-[10px] text-[#9297a3]">
          Type to search your workspace.
        </p>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d8e8ff] text-[9px] font-semibold text-[#3963a8]">
      {initials(name)}
    </span>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-medium text-[#989da8]">{eyebrow}</p>
        )}
        <h1 className="mt-1.5 text-[27px] font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[12px] text-[#858b97]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ProjectCard({
  project,
}: {
  project: (typeof projectData)[number];
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-[#e7e9ee] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#181920]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex size-8 items-center justify-center rounded-lg ${project.color} text-white`}
          >
            <Target size={15} />
          </div>
          <div>
            <h3 className="text-[12px] font-semibold">{project.name}</h3>
            <p className="mt-0.5 text-[10px] text-[#9da2ad]">
              {project.progress}% complete
            </p>
          </div>
        </div>
        <MoreHorizontal size={15} className="text-[#c0c4cc]" />
      </div>
      <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-[#8d929d]">
        {project.description}
      </p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f0f1f4]">
        <div
          className={`h-full rounded-full ${project.color}`}
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] text-[#9da2ad]">
        <span className="flex items-center gap-1">
          <Users size={12} /> {project.members.length} members
        </span>
        <span>Due {project.due}</span>
      </div>
    </Link>
  );
}

export { TaskList } from "@/components/task-list";
export { tasks };
