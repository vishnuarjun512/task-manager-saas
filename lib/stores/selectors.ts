import type { Project, Task } from "@/lib/orbit-data";

export function findProjectById(projects: Project[], projectId?: string) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function findTaskById(tasks: Task[], taskId?: string) {
  return tasks.find((task) => task.id === taskId) ?? null;
}
