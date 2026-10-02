import { OrbitWorkspace } from "@/components/orbit-workspace";
import { ProjectDetail } from "@/components/project-detail";
import { projectData } from "@/lib/orbit-data";

export function generateStaticParams() {
  return projectData.map((project) => ({ id: project.id }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <OrbitWorkspace>
      <ProjectDetail id={id} />
    </OrbitWorkspace>
  );
}
