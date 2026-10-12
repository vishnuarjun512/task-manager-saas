import { OrbitWorkspace } from "@/components/orbit-workspace";
import { ProjectEditorPage } from "@/components/project-editor-page";

export default function NewProjectPage() {
  return (
    <OrbitWorkspace>
      <ProjectEditorPage />
    </OrbitWorkspace>
  );
}
