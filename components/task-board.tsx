"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/orbit-data";
import type { Project } from "@/lib/stores/types";

const taskStatuses: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "Pending" },
  { value: "in_review", label: "Review" },
  { value: "done", label: "Done" },
];

export function TaskBoard({
  projects,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  canEditTask,
  canDeleteTask,
}: {
  projects: Project[];
  tasks: Task[];
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canEditTask: (task: Task) => boolean;
  canDeleteTask: (task: Task) => boolean;
}) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#dfe1e8] px-5 py-8 text-center text-[11px] text-[#9297a3] dark:border-white/10">
        No projects to show.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {projects.map((project) => {
        const projectTasks = tasks.filter(
          (task) => task.projectId === project.id,
        );

        return (
          <section key={project.id} aria-label={`${project.name} task board`}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${project.project_color}`}
              />
              <h3 className="text-[12px] font-semibold">{project.name}</h3>
              <span className="text-[10px] text-[#9297a3]">
                {projectTasks.length}{" "}
                {projectTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[900px] grid-cols-4 gap-3">
                {taskStatuses.map((status) => {
                  const columnTasks = projectTasks.filter(
                    (task) => task.status === status.value,
                  );

                  return (
                    <section
                      key={status.value}
                      aria-label={`${project.name}: ${status.label}`}
                      className="min-h-52 rounded-xl border border-[#e7e9ee] bg-[#f8f9fb] p-2.5 dark:border-white/10 dark:bg-white/[0.03]"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const taskId =
                          event.dataTransfer.getData("application/x-task-id");
                        const task = projectTasks.find(
                          (item) => item.id === taskId,
                        );
                        if (task && task.status !== status.value) {
                          onStatusChange(task, status.value);
                        }
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between px-0.5">
                        <h4 className="text-[10px] font-semibold">
                          {status.label}
                        </h4>
                        <span className="flex size-5 items-center justify-center rounded-full bg-white text-[9px] text-[#858b97] dark:bg-white/10">
                          {columnTasks.length}
                        </span>
                      </div>
                      <div className="flex min-h-40 flex-col gap-2">
                        {columnTasks.map((task) => {
                          const editable = canEditTask(task);
                          return (
                            <article
                              key={task.id}
                              draggable={editable}
                              onDragStart={(event) => {
                                event.dataTransfer.setData(
                                  "application/x-task-id",
                                  task.id,
                                );
                                event.dataTransfer.effectAllowed = "move";
                              }}
                              className={`rounded-lg border border-[#e6e8ee] bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#181920] ${
                                editable ? "cursor-grab active:cursor-grabbing" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <p className="min-w-0 flex-1 text-[10px] font-medium leading-4">
                                  {task.title}
                                </p>
                                <div className="flex shrink-0 items-center">
                                  {editable && (
                                    <button
                                      type="button"
                                      aria-label={`Edit ${task.title}`}
                                      onClick={() => onEdit(task)}
                                      className="rounded p-1 text-[#9da2ad] hover:bg-[#f3f4f6] dark:hover:bg-white/10"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                  )}
                                  {canDeleteTask(task) && (
                                    <button
                                      type="button"
                                      aria-label={`Delete ${task.title}`}
                                      onClick={() => onDelete(task)}
                                      className="rounded p-1 text-[#9da2ad] hover:bg-[#fff1f1] hover:text-[#b93d3d] dark:hover:bg-white/10"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {task.description && (
                                <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-[#9297a3]">
                                  {task.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="rounded bg-[#f3f1ff] px-1.5 py-1 text-[8px] font-medium capitalize text-[#6755e8] dark:bg-white/10 dark:text-[#c6bdff]">
                                  {task.priority}
                                </span>
                                {task.due_date && (
                                  <span className="truncate text-[8px] text-[#9297a3]">
                                    Due {formatDueDate(task.due_date)}
                                  </span>
                                )}
                              </div>
                            </article>
                          );
                        })}
                        {columnTasks.length === 0 && (
                          <p className="flex min-h-24 flex-1 items-center justify-center rounded-lg border border-dashed border-[#dfe1e8] px-2 text-center text-[9px] text-[#a0a5ae] dark:border-white/10">
                            Drop a task here
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function formatDueDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}
