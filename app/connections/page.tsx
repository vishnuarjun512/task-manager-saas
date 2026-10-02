import { ConnectionManager } from "@/components/connection-manager";
import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";

export default function ConnectionsPage() {
  return (
    <OrbitWorkspace>
      <PageHeader
        eyebrow="Team directory"
        title="Connections"
        description="Find teammates by Orbit ID and manage connection requests."
      />
      <ConnectionManager />
    </OrbitWorkspace>
  );
}
