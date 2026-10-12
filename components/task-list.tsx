"use client";

import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/lib/orbit-data";
import { peopleDirectory, useConnectionStore } from "@/lib/stores/connection-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useTaskStore } from "@/lib/stores/task-store";

export function TaskList({
  items,
  onEdit,
  onDelete,
  canToggleTask,
  canEditTask,
  canDeleteTask,
}: {
  items?: ReadonlyArray<Task>;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  canToggleTask?: (task: Task) => boolean;
  canEditTask?: (task: Task) => boolean;
  canDeleteTask?: (task: Task) => boolean;
}) {
  const { tasks, toggleTask } = useTaskStore();
  const { connections } = useConnectionStore();
  const { profile } = useProfileStore();
  const visibleTasks = items ?? tasks;

  if (visibleTasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#dfe1e8] px-5 py-8 text-center text-[11px] text-[#9297a3] dark:border-white/10">
        No tasks yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#f0f1f4] rounded-xl border border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]">
      {visibleTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
        >
          <button
            type="button"
            disabled={canToggleTask ? !canToggleTask(task) : false}
            aria-label={
              task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`
            }
            aria-pressed={task.completed}
            onClick={() => {
              if (!canToggleTask || canToggleTask(task)) toggleTask(task.id);
            }}
            className="shrink-0 text-[#c3c7cf] hover:text-[#6755e8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {task.completed ? (
              <CheckCircle2 size={17} className="text-[#6755e8]" />
            ) : (
              <Circle size={17} />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-[12px] font-medium ${task.completed ? "text-[#a0a5b0] line-through" : ""}`}
            >
              {task.title}
            </p>
            <p className="mt-1 text-[10px] text-[#a0a5b0]">{task.project}</p>
            {task.description && (
              <p className="mt-1 truncate text-[10px] text-[#a0a5b0]">
                {task.description}
              </p>
            )}
          </div>
          <span className="hidden text-[10px] font-medium text-[#6755e8] sm:block">
            {capitalize(task.priority)}
          </span>
          <span className="hidden rounded-md bg-[#f6f7f9] px-2 py-1 text-[10px] text-[#858b97] md:block">
            {task.completed ? "Complete" : formatStatus(task.status)}
          </span>
          <span className="hidden max-w-32 truncate text-right text-[10px] text-[#9da2ad] lg:block">
            {getAssigneeNames(
              task.assignee_ids ??
                (task.assignee_id ? [task.assignee_id] : []),
              profile.id,
              connections,
            )}
          </span>
          <span className="max-w-21 truncate text-right text-[10px] text-[#9da2ad]">
            {formatDueDate(task.due_date)}
          </span>
          {(onEdit || onDelete) && (
            <div className="flex shrink-0 items-center gap-0.5">
              {onEdit && (!canEditTask || canEditTask(task)) && (
                <button
                  type="button"
                  aria-label={`Edit ${task.title}`}
                  onClick={() => onEdit(task)}
                  className="rounded p-1.5 text-[#9da2ad] hover:bg-[#f3f4f6] dark:hover:bg-white/10"
                >
                  <Pencil size={13} />
                </button>
              )}
              {onDelete && (!canDeleteTask || canDeleteTask(task)) && (
                <button
                  type="button"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => onDelete(task)}
                  className="rounded p-1.5 text-[#9da2ad] hover:bg-[#fff1f1] hover:text-[#b93d3d] dark:hover:bg-white/10"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getAssigneeNames(
  assigneeIds: string[],
  currentUserId: string,
  connections: ReturnType<typeof useConnectionStore.getState>["connections"],
) {
  if (assigneeIds.length === 0) return "Unassigned";
  return assigneeIds
    .map((id) => {
      if (id === currentUserId) return "You";
      return (
        connections.find((connection) => connection.personId === id)?.name ??
        peopleDirectory.find((person) => person.id === id)?.name ??
        "Teammate"
      );
    })
    .join(", ");
}

function formatDueDate(value: string | null) {
  if (!value) return "No due date";
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function formatStatus(value: Task["status"]) {
  return value
    .split("_")
    .map(capitalize)
    .join(" ");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
