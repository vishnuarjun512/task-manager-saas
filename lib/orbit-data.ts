export type ProjectStatus = "active" | "on_hold" | "completed" | "archived";
export type ProjectVisibility = "workspace" | "private";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type ProjectRecord = {
  project_id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  project_color: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  start_date: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TaskRecord = {
  task_id: string;
  workspace_id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  created_by: string;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  project_color: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  start_date: string | null;
  progress: number;
  due: string;
  members: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  workspace_id: string;
};

export type Task = {
  task_id: string;
  workspace_id: string;
  projectId: string;
  parent_task_id: string | null;
  title: string;
  description: string;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: string | null;
  assignee_ids?: string[];
  start_date: string | null;
  due_date: string | null;
  created_by: string;
  position: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  completed: boolean;
};

export type TaskInput = Omit<
  Task,
  "task_id" | "completed_at" | "created_at" | "updated_at" | "completed"
>;

export const projectData: Project[] = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    description: "Refresh the marketing site and launch the new visual system.",
    project_color: "bg-violet-500",
    status: "active",
    visibility: "workspace",
    start_date: "2026-09-14",
    progress: 72,
    due: "2026-10-18",
    members: ["ORB-1042", "ORB-2048", "ORB-3196"],
    created_by: "ORB-1042",
    created_at: "2026-09-14T09:00:00Z",
    updated_at: "2026-10-11T16:30:00Z",
    workspace_id: "ws-acme",
  },
  {
    id: "mobile-app-v2",
    name: "Mobile App v2",
    description: "A faster, more focused mobile experience for our customers.",
    project_color: "bg-cyan-500",
    status: "active",
    visibility: "workspace",
    start_date: "2026-09-21",
    progress: 48,
    due: "2026-11-02",
    members: ["ORB-1042", "ORB-2048", "ORB-5873"],
    created_by: "ORB-1042",
    created_at: "2026-09-21T09:00:00Z",
    updated_at: "2026-10-10T12:15:00Z",
    workspace_id: "ws-acme",
  },
  {
    id: "q4-campaign",
    name: "Q4 Campaign",
    description:
      "Coordinate the launch plan across content and lifecycle channels.",
    project_color: "bg-amber-500",
    status: "active",
    visibility: "workspace",
    start_date: "2026-09-28",
    progress: 31,
    due: "2026-11-14",
    members: ["ORB-1042", "ORB-3196", "ORB-6621"],
    created_by: "ORB-1042",
    created_at: "2026-09-28T09:00:00Z",
    updated_at: "2026-10-12T08:45:00Z",
    workspace_id: "ws-acme",
  },
  {
    id: "brand-refresh",
    name: "Brand Refresh",
    description:
      "Modernize the identity system and roll it out across touchpoints.",
    project_color: "bg-rose-500",
    status: "active",
    visibility: "workspace",
    start_date: "2026-09-18",
    progress: 64,
    due: "2026-10-30",
    members: ["ORB-1042", "ORB-7340", "ORB-9281"],
    created_by: "ORB-1042",
    created_at: "2026-09-18T09:00:00Z",
    updated_at: "2026-10-10T14:30:00Z",
    workspace_id: "ws-studio",
  },
  {
    id: "launch-experiments",
    name: "Launch Experiments",
    description:
      "Test onboarding and activation ideas with a small user cohort.",
    project_color: "bg-emerald-500",
    status: "on_hold",
    visibility: "private",
    start_date: "2026-10-01",
    progress: 22,
    due: "2026-11-20",
    members: ["ORB-1042", "ORB-8165", "ORB-3472"],
    created_by: "ORB-1042",
    created_at: "2026-10-01T09:00:00Z",
    updated_at: "2026-10-11T11:10:00Z",
    workspace_id: "ws-launch",
  },
];

export const tasks: Task[] = [
  {
    task_id: "finalize-homepage-copy",
    workspace_id: "ws-acme",
    projectId: "website-redesign",
    parent_task_id: null,
    title: "Finalize homepage copy",
    description:
      "Review the final landing-page headlines with the content team.",
    project: "Website Redesign",
    priority: "high",
    status: "in_progress",
    assignee_id: "ORB-2048",
    start_date: "2026-10-07T09:00:00Z",
    due_date: "2026-10-13T17:00:00Z",
    created_by: "ORB-1042",
    position: 10,
    completed_at: null,
    created_at: "2026-10-03T10:15:00Z",
    updated_at: "2026-10-11T13:05:00Z",
    completed: false,
  },
  {
    task_id: "review-onboarding-flow",
    workspace_id: "ws-acme",
    projectId: "mobile-app-v2",
    parent_task_id: null,
    title: "Review onboarding flow",
    description: "Walk through the new-user journey and collect feedback.",
    project: "Mobile App v2",
    priority: "medium",
    status: "todo",
    assignee_id: "ORB-5873",
    start_date: "2026-10-10T09:00:00Z",
    due_date: "2026-10-14T17:00:00Z",
    created_by: "ORB-1042",
    position: 20,
    completed_at: null,
    created_at: "2026-10-05T09:10:00Z",
    updated_at: "2026-10-10T11:40:00Z",
    completed: false,
  },
  {
    task_id: "prepare-campaign-brief",
    workspace_id: "ws-acme",
    projectId: "q4-campaign",
    parent_task_id: null,
    title: "Prepare campaign brief",
    description: "Align the audience, message, and channel plan for launch.",
    project: "Q4 Campaign",
    priority: "high",
    status: "in_review",
    assignee_id: "ORB-3196",
    start_date: "2026-10-02T09:00:00Z",
    due_date: "2026-10-16T17:00:00Z",
    created_by: "ORB-1042",
    position: 30,
    completed_at: null,
    created_at: "2026-10-04T08:30:00Z",
    updated_at: "2026-10-12T07:25:00Z",
    completed: false,
  },
  {
    task_id: "add-analytics-events",
    workspace_id: "ws-acme",
    projectId: "mobile-app-v2",
    parent_task_id: null,
    title: "Add analytics events",
    description: "Instrument the onboarding checkpoints for the new funnel.",
    project: "Mobile App v2",
    priority: "low",
    status: "todo",
    assignee_id: "ORB-1042",
    start_date: "2026-10-11T09:00:00Z",
    due_date: "2026-10-20T17:00:00Z",
    created_by: "ORB-1042",
    position: 40,
    completed_at: null,
    created_at: "2026-10-08T14:20:00Z",
    updated_at: "2026-10-08T14:20:00Z",
    completed: false,
  },
  {
    task_id: "approve-design-system",
    workspace_id: "ws-acme",
    projectId: "website-redesign",
    parent_task_id: null,
    title: "Approve design system",
    description: "Sign off on the color, typography, and component tokens.",
    project: "Website Redesign",
    priority: "urgent",
    status: "todo",
    assignee_id: "ORB-1042",
    start_date: "2026-10-12T09:00:00Z",
    due_date: "2026-10-15T17:00:00Z",
    created_by: "ORB-1042",
    position: 50,
    completed_at: null,
    created_at: "2026-10-10T11:30:00Z",
    updated_at: "2026-10-10T11:30:00Z",
    completed: false,
  },
  {
    task_id: "qa-checkout",
    workspace_id: "ws-acme",
    projectId: "mobile-app-v2",
    parent_task_id: null,
    title: "QA checkout on small screens",
    description: "Verify payment, error, and confirmation states on mobile.",
    project: "Mobile App v2",
    priority: "high",
    status: "done",
    assignee_id: "ORB-5873",
    start_date: "2026-10-04T09:00:00Z",
    due_date: "2026-10-09T17:00:00Z",
    created_by: "ORB-1042",
    position: 60,
    completed_at: "2026-10-09T15:22:00Z",
    created_at: "2026-10-02T10:00:00Z",
    updated_at: "2026-10-09T15:22:00Z",
    completed: true,
  },
  {
    task_id: "schedule-campaign",
    workspace_id: "ws-acme",
    projectId: "q4-campaign",
    parent_task_id: null,
    title: "Schedule launch announcements",
    description: "Prepare coordinated announcement timing for each channel.",
    project: "Q4 Campaign",
    priority: "medium",
    status: "todo",
    assignee_id: "ORB-6621",
    start_date: "2026-10-13T09:00:00Z",
    due_date: "2026-10-22T17:00:00Z",
    created_by: "ORB-1042",
    position: 70,
    completed_at: null,
    created_at: "2026-10-11T10:00:00Z",
    updated_at: "2026-10-11T10:00:00Z",
    completed: false,
  },
  {
    task_id: "review-accessibility",
    workspace_id: "ws-acme",
    projectId: "website-redesign",
    parent_task_id: null,
    title: "Run accessibility review",
    description: "Check keyboard flow, contrast, and screen-reader labels.",
    project: "Website Redesign",
    priority: "medium",
    status: "todo",
    assignee_id: "ORB-3196",
    start_date: "2026-10-14T09:00:00Z",
    due_date: "2026-10-24T17:00:00Z",
    created_by: "ORB-1042",
    position: 80,
    completed_at: null,
    created_at: "2026-10-11T11:45:00Z",
    updated_at: "2026-10-11T11:45:00Z",
    completed: false,
  },
  {
    task_id: "draft-email-sequence",
    workspace_id: "ws-acme",
    projectId: "q4-campaign",
    parent_task_id: null,
    title: "Draft launch email sequence",
    description: "Create the announcement and two follow-up messages.",
    project: "Q4 Campaign",
    priority: "high",
    status: "in_progress",
    assignee_id: "ORB-6621",
    start_date: "2026-10-06T09:00:00Z",
    due_date: "2026-10-19T17:00:00Z",
    created_by: "ORB-1042",
    position: 90,
    completed_at: null,
    created_at: "2026-10-06T08:15:00Z",
    updated_at: "2026-10-12T07:00:00Z",
    completed: false,
  },
  {
    task_id: "prototype-settings",
    workspace_id: "ws-acme",
    projectId: "mobile-app-v2",
    parent_task_id: null,
    title: "Prototype notification settings",
    description: "Explore a clear opt-in flow for product and account alerts.",
    project: "Mobile App v2",
    priority: "low",
    status: "todo",
    assignee_id: null,
    start_date: "2026-10-17T09:00:00Z",
    due_date: "2026-10-28T17:00:00Z",
    created_by: "ORB-1042",
    position: 100,
    completed_at: null,
    created_at: "2026-10-12T06:40:00Z",
    updated_at: "2026-10-12T06:40:00Z",
    completed: false,
  },
  {
    task_id: "collect-customer-quotes",
    workspace_id: "ws-acme",
    projectId: "q4-campaign",
    parent_task_id: null,
    title: "Collect customer quotes",
    description:
      "Gather approved customer stories for the campaign landing page.",
    project: "Q4 Campaign",
    priority: "medium",
    status: "done",
    assignee_id: "ORB-3196",
    start_date: "2026-10-01T09:00:00Z",
    due_date: "2026-10-08T17:00:00Z",
    created_by: "ORB-1042",
    position: 110,
    completed_at: "2026-10-08T12:10:00Z",
    created_at: "2026-09-29T08:30:00Z",
    updated_at: "2026-10-08T12:10:00Z",
    completed: true,
  },
  {
    task_id: "approve-brand-guidelines",
    workspace_id: "ws-studio",
    projectId: "brand-refresh",
    parent_task_id: null,
    title: "Approve brand guidelines",
    description: "Review the latest logo, color, and typography guidelines.",
    project: "Brand Refresh",
    priority: "high",
    status: "in_progress",
    assignee_id: "ORB-7340",
    start_date: "2026-10-08T09:00:00Z",
    due_date: "2026-10-17T17:00:00Z",
    created_by: "ORB-1042",
    position: 120,
    completed_at: null,
    created_at: "2026-10-08T09:00:00Z",
    updated_at: "2026-10-11T14:00:00Z",
    completed: false,
  },
  {
    task_id: "prototype-activation",
    workspace_id: "ws-launch",
    projectId: "launch-experiments",
    parent_task_id: null,
    title: "Prototype activation checklist",
    description:
      "Draft a lightweight checklist for the first-session experience.",
    project: "Launch Experiments",
    priority: "medium",
    status: "todo",
    assignee_id: "ORB-8165",
    start_date: "2026-10-12T09:00:00Z",
    due_date: "2026-10-25T17:00:00Z",
    created_by: "ORB-1042",
    position: 130,
    completed_at: null,
    created_at: "2026-10-10T13:45:00Z",
    updated_at: "2026-10-10T13:45:00Z",
    completed: false,
  },
];
