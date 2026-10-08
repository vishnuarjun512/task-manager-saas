"use client";

import { useState } from "react";
import { Bell, CalendarDays, Globe2, SlidersHorizontal } from "lucide-react";
import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";

const timezones = [
  "UTC",
  "America/Los_Angeles",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    loaded,
  } = useWorkspaceStore();
  const { preferences, updatePreferences } = useSettingsStore();
  const [saved, setSaved] = useState(false);

  function updatePreference(input: Parameters<typeof updatePreferences>[0]) {
    updatePreferences(input);
    setSaved(true);
  }

  return (
    <OrbitWorkspace>
      <PageHeader
        title="Settings"
        description="Tune your workspace, notifications, and calendar defaults."
      />

      <div className="mt-7 max-w-3xl divide-y divide-[#eff0f3] overflow-hidden rounded-xl border border-[#e7e9ee] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#181920]">
        <section className="p-5 sm:p-6">
          <SectionHeading
            icon={<SlidersHorizontal size={16} />}
            title="Workspace"
          />
          <label className="mt-5 block max-w-md text-[11px] font-medium">
            Active workspace
            <select
              value={activeWorkspaceId}
              onChange={(event) => setActiveWorkspace(event.target.value)}
              disabled={!loaded}
              className="mt-2 w-full rounded-md border border-[#e1e3e9] bg-white px-3 py-2.5 text-[12px] dark:border-white/10 dark:bg-[#181920]"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-[10px] text-[#9297a3]">
            Manage workspace names and project access from Workspaces.
          </p>
        </section>

        <section className="p-5 sm:p-6">
          <SectionHeading icon={<Bell size={16} />} title="Notifications" />
          <div className="mt-3 divide-y divide-[#eff0f3] dark:divide-white/10">
            <PreferenceToggle
              label="Email notifications"
              description="Send workspace activity to your email."
              checked={preferences.emailNotifications}
              disabled={!loaded}
              onChange={(checked) =>
                updatePreference({ emailNotifications: checked })
              }
            />
            <PreferenceToggle
              label="Task updates"
              description="Notify me when tasks are assigned or changed."
              checked={preferences.taskUpdates}
              disabled={!loaded}
              onChange={(checked) => updatePreference({ taskUpdates: checked })}
            />
            <PreferenceToggle
              label="Mentions"
              description="Notify me when someone mentions my profile."
              checked={preferences.mentions}
              disabled={!loaded}
              onChange={(checked) => updatePreference({ mentions: checked })}
            />
            <PreferenceToggle
              label="Weekly digest"
              description="Send a weekly summary of projects and deadlines."
              checked={preferences.weeklyDigest}
              disabled={!loaded}
              onChange={(checked) =>
                updatePreference({ weeklyDigest: checked })
              }
            />
          </div>
        </section>

        <section className="p-5 sm:p-6">
          <SectionHeading
            icon={<CalendarDays size={16} />}
            title="Calendar defaults"
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-[11px] font-medium">
              Week starts on
              <select
                value={preferences.weekStartsOn}
                onChange={(event) =>
                  updatePreference({
                    weekStartsOn: event.target.value as "Monday" | "Sunday",
                  })
                }
                disabled={!loaded}
                className="mt-2 w-full rounded-md border border-[#e1e3e9] bg-white px-3 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
              >
                <option>Monday</option>
                <option>Sunday</option>
              </select>
            </label>
            <label className="text-[11px] font-medium">
              Time zone
              <span className="relative mt-2 block">
                <Globe2
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9297a3]"
                />
                <select
                  value={preferences.timezone}
                  onChange={(event) =>
                    updatePreference({ timezone: event.target.value })
                  }
                  disabled={!loaded}
                  className="w-full rounded-md border border-[#e1e3e9] bg-white py-2.5 pl-9 pr-3 text-[11px] dark:border-white/10 dark:bg-[#181920]"
                >
                  {!timezones.includes(preferences.timezone) && (
                    <option>{preferences.timezone}</option>
                  )}
                  {timezones.map((timezone) => (
                    <option key={timezone}>{timezone}</option>
                  ))}
                </select>
              </span>
            </label>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 bg-[#fafbfc] px-5 py-3.5 dark:bg-white/2 sm:px-6">
          <p role="status" className="text-[10px] text-[#858b97]">
            {!loaded
              ? "Loading preferences"
              : saved
                ? "Changes saved"
                : "Preferences apply during this session"}
          </p>
          <span className="text-[9px] text-[#a0a5af]">Local workspace</span>
        </div>
      </div>
    </OrbitWorkspace>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[#6755e8]">{icon}</span>
      <h2 className="text-[13px] font-semibold">{title}</h2>
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3.5">
      <span>
        <span className="block text-[11px] font-medium">{label}</span>
        <span className="mt-1 block text-[10px] text-[#9297a3]">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 accent-[#6755e8]"
      />
    </label>
  );
}
