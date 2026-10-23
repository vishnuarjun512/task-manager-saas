import { OrbitWorkspace } from "@/components/orbit-workspace";
import { TaskEditorPage } from "@/app/tasks/components/task-editor-page";

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
