"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GripVertical,
  ListTodo,
  X,
} from "lucide-react";
import type { Task } from "@/lib/orbit-data";
import { useWorkspaceStore } from "@/lib/workspace-store";

type ScheduledTask = { date: string; time?: string };
type Schedule = Record<string, ScheduledTask>;
type PlannerTask = Task & { color: string };

const storageKey = "orbit-task-schedule";
const mondayFirst = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const sundayFirst = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readSchedule(taskIds: ReadonlySet<string>): Schedule {
  if (typeof window === "undefined") return {};

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};

    return Object.fromEntries(
      Object.entries(saved).filter(([id, value]) => {
        if (!taskIds.has(id) || !value || typeof value !== "object")
          return false;
        return /^\d{4}-\d{2}-\d{2}$/.test((value as ScheduledTask).date);
      }),
    ) as Schedule;
  } catch {
    return {};
  }
}

function getMonthDays(
  year: number,
  month: number,
  weekStartsOn: "Monday" | "Sunday",
) {
  const firstDay = new Date(year, month, 1).getDay();
  const firstDayOffset =
    weekStartsOn === "Monday" ? (firstDay + 6) % 7 : firstDay;
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstDayOffset + dayCount) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstDayOffset + 1;
    return day > 0 && day <= dayCount ? new Date(year, month, day) : null;
  });
}

function PlannerTaskRow({
  task,
  selected,
  onSelect,
  onDragStart,
}: {
  task: PlannerTask;
  selected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, event: React.DragEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      draggable
      aria-pressed={selected}
      onClick={() => onSelect(task.id)}
      onDragStart={(event) => onDragStart(task.id, event)}
      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
        selected
          ? "border-[#6755e8] bg-[#f7f5ff] dark:bg-[#27253d]"
          : "border-[#e9eaf0] hover:border-[#c8c3f4] dark:border-white/10 dark:hover:border-white/20"
      }`}
    >
      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${task.color}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-medium leading-4">
          {task.title}
        </span>
        <span className="mt-1 block text-[10px] text-[#9297a3]">
          {task.project}
        </span>
      </span>
      <GripVertical size={14} className="mt-0.5 shrink-0 text-[#b3b7c1]" />
    </button>
  );
}

export function CalendarPlanner() {
  const {
    tasks,
    projects,
    activeWorkspaceId,
    preferences,
    loaded: tasksLoaded,
  } = useWorkspaceStore();
  const workspaceProjectIds = useMemo(
    () =>
      new Set(
        projects
          .filter((project) => project.workspaceId === activeWorkspaceId)
          .map((project) => project.id),
      ),
    [activeWorkspaceId, projects],
  );
  const plannerTasks = useMemo<PlannerTask[]>(
    () =>
      tasks
        .filter((task) => workspaceProjectIds.has(task.projectId))
        .map((task) => ({
          ...task,
          color:
            projects.find((project) => project.id === task.projectId)?.color ??
            "bg-slate-500",
        })),
    [projects, tasks, workspaceProjectIds],
  );
  const taskIds = useMemo(
    () => new Set<string>(plannerTasks.map((task) => task.id)),
    [plannerTasks],
  );
  const knownTaskIds = useMemo(
    () => new Set<string>(tasks.map((task) => task.id)),
    [tasks],
  );
  const [schedule, setSchedule] = useState<Schedule>(() =>
    tasksLoaded ? readSchedule(knownTaskIds) : {},
  );
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (!tasksLoaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(schedule));
    } catch {
      // Keep the planner usable when browser storage is unavailable.
    }
  }, [schedule, tasksLoaded]);

  const calendarDays = useMemo(
    () =>
      getMonthDays(
        viewMonth.getFullYear(),
        viewMonth.getMonth(),
        preferences.weekStartsOn,
      ),
    [preferences.weekStartsOn, viewMonth],
  );
  const weekdays =
    preferences.weekStartsOn === "Monday" ? mondayFirst : sundayFirst;
  const scheduledIds = useMemo(
    () => new Set(Object.keys(schedule)),
    [schedule],
  );
  const unscheduledTasks = plannerTasks.filter(
    (task) => !scheduledIds.has(task.id) && !task.completed,
  );
  const selectedTasks = plannerTasks.filter(
    (task) => schedule[task.id]?.date === selectedDate,
  );
  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);
  const selectedDateLabel = selectedDate
    ? new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(`${selectedDate}T12:00:00`))
    : "Choose a date";

  function selectTask(id: string) {
    setSelectedTaskIds((current) =>
      current.includes(id)
        ? current.filter((taskId) => taskId !== id)
        : [...current, id],
    );
  }

  function scheduleTasks(ids: string[], date: string) {
    if (ids.length === 0) {
      setSelectedDate(date);
      return;
    }

    setSchedule((current) => ({
      ...current,
      ...Object.fromEntries(
        ids.map((id) => [id, { date } satisfies ScheduledTask]),
      ),
    }));
    setSelectedTaskIds((current) => current.filter((id) => !ids.includes(id)));
    setSelectedDate(date);
  }

  function handleDragStart(
    id: string,
    event: React.DragEvent<HTMLButtonElement>,
  ) {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(date: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text/plain");
    const ids = new Set(selectedTaskIds);
    if (taskIds.has(draggedId)) ids.add(draggedId);
    scheduleTasks([...ids], date);
  }

  function changeMonth(offset: number) {
    const nextMonth = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth() + offset,
      1,
    );
    setViewMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  }

  function updateTaskTime(id: string, time: string) {
    setSchedule((current) => {
      const currentTask = current[id];
      if (!currentTask) return current;
      const nextTask = { ...currentTask };
      if (time) nextTask.time = time;
      else delete nextTask.time;
      return { ...current, [id]: nextTask };
    });
  }

  function removeTask(id: string) {
    setSchedule((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="mt-7 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      <section className="min-w-0 rounded-xl border border-[#e7e9ee] bg-white p-4 dark:border-white/10 dark:bg-[#181920] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
              className="rounded-md border border-[#e6e8ed] p-2 text-[#858b97] hover:bg-[#f5f6f8] dark:border-white/10 dark:hover:bg-white/5"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="min-w-36.25 text-center text-[15px] font-semibold">
              {monthLabel}
            </h2>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
              className="rounded-md border border-[#e6e8ed] p-2 text-[#858b97] hover:bg-[#f5f6f8] dark:border-white/10 dark:hover:bg-white/5"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewMonth(
                  new Date(today.getFullYear(), today.getMonth(), 1),
                );
                setSelectedDate(toDateKey(today));
              }}
              className="rounded-md px-2 py-1.5 text-[11px] font-medium text-[#6755e8] hover:bg-[#f7f5ff] dark:hover:bg-white/5"
            >
              Today
            </button>
          </div>
          <p className="flex items-center gap-2 text-[10px] text-[#9297a3]">
            <GripVertical size={14} /> Select tasks, then choose a date
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-157.5">
            <div className="grid grid-cols-7 border-b border-[#eff0f3] dark:border-white/10">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2.5 text-center text-[9px] font-semibold tracking-widest text-[#989da8]"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`blank-${index}`}
                      className="min-h-25 border-b border-r border-[#eff0f3] bg-[#fafbfc]/70 dark:border-white/10 dark:bg-white/1.5"
                    />
                  );
                }

                const dateKey = toDateKey(date);
                const dayTasks = plannerTasks.filter(
                  (task) => schedule[task.id]?.date === dateKey,
                );
                const isSelected = selectedDate === dateKey;
                const isToday = toDateKey(new Date()) === dateKey;

                return (
                  <div
                    key={dateKey}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(dateKey, event)}
                    className={`min-h-25 border-b border-r border-[#eff0f3] p-1.5 transition-colors dark:border-white/10 sm:p-2 ${
                      isSelected
                        ? "bg-[#f8f7ff] dark:bg-[#252434]"
                        : "bg-white hover:bg-[#fafbfc] dark:bg-[#181920] dark:hover:bg-white/2.5"
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Select ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date)}${selectedTaskIds.length ? ` and schedule ${selectedTaskIds.length} selected tasks` : ""}`}
                      onClick={() => scheduleTasks(selectedTaskIds, dateKey)}
                      className={`flex size-6 items-center justify-center rounded-full text-[10px] transition ${
                        isSelected
                          ? "bg-[#6755e8] font-semibold text-white"
                          : isToday
                            ? "border border-[#6755e8] font-semibold text-[#6755e8]"
                            : "text-[#707684] hover:bg-[#f0edff] dark:hover:bg-white/10"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                    <div className="mt-1.5 flex flex-col gap-1">
                      {dayTasks.map((task) => (
                        <button
                          type="button"
                          key={task.id}
                          draggable
                          onDragStart={(event) =>
                            handleDragStart(task.id, event)
                          }
                          onClick={() => setSelectedDate(dateKey)}
                          className={`flex min-w-0 items-center gap-1 rounded px-1.5 py-1 text-left text-[9px] font-medium text-white ${task.color}`}
                          title={`${task.title}${schedule[task.id].time ? `, ${schedule[task.id].time}` : ""}`}
                        >
                          <span className="truncate">{task.title}</span>
                          {schedule[task.id].time && (
                            <span className="shrink-0 opacity-80">
                              {schedule[task.id].time}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-xl border border-[#e7e9ee] bg-white p-4 dark:border-white/10 dark:bg-[#181920]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#f0edff] text-[#6755e8] dark:bg-[#27253d]">
                <CalendarDays size={16} />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold">
                  {selectedDateLabel}
                </h2>
                <p className="mt-1 text-[10px] text-[#9ca1ac]">
                  {selectedTasks.length} scheduled{" "}
                  {selectedTasks.length === 1 ? "task" : "tasks"}
                </p>
              </div>
            </div>
            {selectedTaskIds.length > 0 && (
              <span className="rounded-full bg-[#f0edff] px-2 py-1 text-[10px] font-medium text-[#6755e8] dark:bg-[#27253d]">
                {selectedTaskIds.length} selected
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {selectedTasks.length > 0 ? (
              selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-[#e9eaf0] p-3 dark:border-white/10"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${task.color}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium leading-4">
                        {task.title}
                      </p>
                      <p className="mt-1 text-[10px] text-[#9ca1ac]">
                        {task.project}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${task.title} from calendar`}
                      onClick={() => removeTask(task.id)}
                      className="rounded p-1 text-[#a3a7b1] hover:bg-[#f3f4f6] hover:text-[#535866] dark:hover:bg-white/10"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-[10px] text-[#8d929e]">
                    <Clock3 size={13} />
                    <span>Time · {preferences.timezone}</span>
                    <input
                      aria-label={`Set time for ${task.title}`}
                      type="time"
                      value={schedule[task.id].time ?? ""}
                      onChange={(event) =>
                        updateTaskTime(task.id, event.target.value)
                      }
                      className="ml-auto rounded border border-[#e6e8ed] bg-transparent px-2 py-1 text-[10px] dark:border-white/10"
                    />
                  </label>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-[#dfe1e8] px-3 py-4 text-center text-[10px] leading-4 text-[#9297a3] dark:border-white/10">
                {selectedTaskIds.length > 0
                  ? "Choose a day in the calendar to schedule selected tasks."
                  : "No tasks scheduled for this day yet."}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#e7e9ee] bg-white p-4 dark:border-white/10 dark:bg-[#181920]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListTodo size={15} className="text-[#777d89]" />
              <h2 className="text-[12px] font-semibold">Unscheduled tasks</h2>
            </div>
            <span className="text-[10px] text-[#9ca1ac]">
              {unscheduledTasks.length}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {unscheduledTasks.length > 0 ? (
              unscheduledTasks.map((task) => (
                <PlannerTaskRow
                  key={task.id}
                  task={task}
                  selected={selectedTaskIds.includes(task.id)}
                  onSelect={selectTask}
                  onDragStart={handleDragStart}
                />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-[#dfe1e8] px-3 py-4 text-center text-[10px] text-[#9297a3] dark:border-white/10">
                All tasks are on the calendar.
              </p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
