import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";
import { TaskManager } from "@/components/task-manager";

export default function TasksPage() {
  return (
    <OrbitWorkspace>
      <PageHeader
        title="My tasks"
        description="Everything assigned to you in one focused view."
      />
      <TaskManager />
    </OrbitWorkspace>
  );
}
