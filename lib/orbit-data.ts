export const projectData = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    description: "Refresh the marketing site and launch the new visual system.",
    color: "bg-violet-500",
    progress: 72,
    tasks: 25,
    due: "Oct 18",
    members: ["SL", "MC", "AR"],
  },
  {
    id: "mobile-app-v2",
    name: "Mobile App v2",
    description: "A faster, more focused mobile experience for our customers.",
    color: "bg-cyan-500",
    progress: 48,
    tasks: 25,
    due: "Nov 02",
    members: ["JD", "SL", "KT"],
  },
  {
    id: "q4-campaign",
    name: "Q4 Campaign",
    description:
      "Coordinate the launch plan across content and lifecycle channels.",
    color: "bg-amber-500",
    progress: 31,
    tasks: 26,
    due: "Nov 14",
    members: ["MC", "AR"],
  },
] as const;

export type Task = {
  id: string;
  projectId: string;
  title: string;
  project: string;
  priority: string;
  status: string;
  due: string;
  completed: boolean;
};

export const tasks: Task[] = [
  {
    id: "finalize-homepage-copy",
    projectId: "website-redesign",
    title: "Finalize homepage copy",
    project: "Website Redesign",
    priority: "High",
    status: "In progress",
    due: "Today",
    completed: false,
  },
  {
    id: "review-onboarding-flow",
    projectId: "mobile-app-v2",
    title: "Review onboarding flow",
    project: "Mobile App v2",
    priority: "Medium",
    status: "Todo",
    due: "Tomorrow",
    completed: false,
  },
  {
    id: "prepare-campaign-brief",
    projectId: "q4-campaign",
    title: "Prepare campaign brief",
    project: "Q4 Campaign",
    priority: "High",
    status: "In review",
    due: "Oct 08",
    completed: false,
  },
  {
    id: "add-analytics-events",
    projectId: "mobile-app-v2",
    title: "Add analytics events",
    project: "Mobile App v2",
    priority: "Low",
    status: "Todo",
    due: "Oct 10",
    completed: false,
  },
];

export type Project = (typeof projectData)[number];
