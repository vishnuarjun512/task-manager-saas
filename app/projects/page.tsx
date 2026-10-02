import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";
import { ProjectManager } from "@/components/project-manager";

export default function ProjectsPage() {
  return (
    <OrbitWorkspace>
      <PageHeader
        title="Projects"
        description="Plan, track, and deliver your team's most important work."
      />
      <ProjectManager />
    </OrbitWorkspace>
  );
}
