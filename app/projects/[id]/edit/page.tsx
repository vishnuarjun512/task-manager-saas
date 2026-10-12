import { OrbitWorkspace } from "@/components/orbit-workspace";
import { ProjectEditorPage } from "../../(components)/project-manager";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <OrbitWorkspace>
      <ProjectEditorPage projectId={id} />
    </OrbitWorkspace>
  );
}
