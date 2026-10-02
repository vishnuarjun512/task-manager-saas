import { CalendarPlanner } from "@/components/calendar-planner";
import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";

export default function CalendarPage() {
  return (
    <OrbitWorkspace>
      <PageHeader
        eyebrow="Plan your work"
        title="Calendar"
        description="Schedule tasks, make time for focused work, and keep the team moving."
      />
      <CalendarPlanner />
    </OrbitWorkspace>
  );
}
