import { OrbitWorkspace } from "@/components/orbit-workspace";
import { TaskEditorPage } from "@/components/task-editor-page";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string | string[] }>;
}) {
  const params = await searchParams;
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  return (
    <OrbitWorkspace>
      <TaskEditorPage projectId={projectId} />
    </OrbitWorkspace>
  );
}
