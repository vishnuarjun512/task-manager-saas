import type { Project, Task } from "@/lib/orbit-data";

export function findProjectById(projects: Project[], projectId?: string) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function findTaskById(tasks: Task[], taskId?: string) {
  if (!taskId) return null;
  return tasks.find((task) => task.task_id === taskId) ?? null;
}
