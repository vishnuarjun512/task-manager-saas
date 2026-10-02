import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";
import { WorkspaceManager } from "@/components/workspace-manager";

export default function WorkspacesPage() {
  return (
    <OrbitWorkspace>
      <PageHeader
        eyebrow="Your organization"
        title="Workspaces"
        description="Keep teams and their projects organized in separate spaces."
      />
      <WorkspaceManager />
    </OrbitWorkspace>
  );
}
