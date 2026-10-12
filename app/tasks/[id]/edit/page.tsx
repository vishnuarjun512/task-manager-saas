import { OrbitWorkspace } from "@/components/orbit-workspace";
import { TaskEditorPage } from "@/components/task-manager";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <OrbitWorkspace>
      <TaskEditorPage taskId={id} />
    </OrbitWorkspace>
  );
}
