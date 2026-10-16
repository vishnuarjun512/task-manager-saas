import { OrbitWorkspace } from "@/components/orbit-workspace";
import { OverviewDashboard } from "@/app/home/overview-dashboard";

export default function HomePage() {
  return (
    <OrbitWorkspace>
      <OverviewDashboard />
    </OrbitWorkspace>
  );
}
