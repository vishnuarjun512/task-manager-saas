"use client";

import { useState, type FormEvent } from "react";
import { Clock3, Copy, Mail, Send, Trash2, UserRound } from "lucide-react";
import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";
import { useWorkspaceStore } from "@/lib/workspace-store";

type ProfileTab = "profile" | "invites" | "activity";

export default function ProfilePage() {
  const {
    profile,
    updateProfile,
    invitations,
    inviteTeammate,
    revokeInvitation,
    activity,
    loaded,
  } = useWorkspaceStore();
  const [tab, setTab] = useState<ProfileTab>("profile");
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [pronouns, setPronouns] = useState(profile.pronouns);
  const [bio, setBio] = useState(profile.bio);
  const [availability, setAvailability] = useState(profile.availability);
  const [statusMessage, setStatusMessage] = useState(profile.statusMessage);
  const [profileNotice, setProfileNotice] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviteNotice, setInviteNotice] = useState("");

  const pendingInvites = invitations.filter(
    (invitation) => invitation.status === "Pending",
  ).length;

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    updateProfile({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      pronouns: pronouns.trim(),
      bio: bio.trim(),
      availability,
      statusMessage: statusMessage.trim(),
    });
    setProfileNotice("Profile changes saved.");
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(profile.id);
      setProfileNotice("Orbit ID copied.");
    } catch {
      setProfileNotice("Could not copy the Orbit ID from this browser.");
    }
  }

  function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = inviteTeammate(inviteEmail, inviteRole);
    setInviteNotice(
      created
        ? "Invite saved in this browser. Email delivery is not connected."
        : "Check the email address or existing invitations.",
    );
    if (created) setInviteEmail("");
  }

  return (
    <OrbitWorkspace>
      <PageHeader
        title="Profile"
        description="Your identity, availability, and recent work."
      />

      <section className="mt-7 max-w-4xl overflow-hidden rounded-xl border border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]">
        <div className="flex flex-wrap items-center gap-4 border-b border-[#eff0f3] p-5 dark:border-white/10 sm:p-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#d8e8ff] text-[15px] font-semibold text-[#3963a8]">
            {initials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[14px] font-semibold">
              {profile.name}
            </h2>
            <p className="mt-1 truncate text-[11px] text-[#9ca1ac]">
              {profile.role || "Add your role"}
              {profile.pronouns ? ` · ${profile.pronouns}` : ""}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#737987]">
              <span
                className={`size-2 rounded-full ${availabilityColor(profile.availability)}`}
              />
              {profile.availability}
              {profile.statusMessage && (
                <span className="truncate">· {profile.statusMessage}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={copyId}
            className="flex items-center gap-2 rounded-md bg-[#f7f8fa] px-2.5 py-2 font-mono text-[10px] text-[#777d89] hover:bg-[#f0edff] dark:bg-white/5 dark:hover:bg-white/10"
          >
            <UserRound size={13} /> {profile.id} <Copy size={12} />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex gap-1 overflow-x-auto border-b border-[#eff0f3] px-4 pt-3 dark:border-white/10 sm:px-6"
        >
          <ProfileTabButton
            active={tab === "profile"}
            onClick={() => setTab("profile")}
          >
            Profile
          </ProfileTabButton>
          <ProfileTabButton
            active={tab === "invites"}
            onClick={() => setTab("invites")}
          >
            Invites{" "}
            {pendingInvites > 0 && (
              <span className="ml-1 text-[9px] opacity-70">
                {pendingInvites}
              </span>
            )}
          </ProfileTabButton>
          <ProfileTabButton
            active={tab === "activity"}
            onClick={() => setTab("activity")}
          >
            Activity
          </ProfileTabButton>
        </div>

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="p-5 sm:p-6">
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <FormField label="Full name">
                <input
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setProfileNotice("");
                  }}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Email">
                <input
                  required
                  type="email"
                  maxLength={160}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setProfileNotice("");
                  }}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Role or title">
                <input
                  maxLength={80}
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="e.g. Product designer"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Pronouns">
                <input
                  maxLength={40}
                  value={pronouns}
                  onChange={(event) => setPronouns(event.target.value)}
                  placeholder="e.g. they/them"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Availability">
                <select
                  value={availability}
                  onChange={(event) =>
                    setAvailability(event.target.value as typeof availability)
                  }
                  className={inputClass}
                >
                  <option>Available</option>
                  <option>Away</option>
                  <option>Do not disturb</option>
                </select>
              </FormField>
              <FormField label="Status message">
                <input
                  maxLength={80}
                  value={statusMessage}
                  onChange={(event) => setStatusMessage(event.target.value)}
                  placeholder="A short note for your team"
                  className={inputClass}
                />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="About me">
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Share a little about your role and what you work on."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p role="status" className="text-[10px] text-[#32825f]">
                {profileNotice}
              </p>
              <button
                type="submit"
                disabled={!loaded}
                className="rounded-md bg-[#6755e8] px-3.5 py-2.5 text-[11px] font-semibold text-white hover:bg-[#5947d3] disabled:opacity-50"
              >
                Save profile
              </button>
            </div>
          </form>
        )}

        {tab === "invites" && (
          <div className="p-5 sm:p-6">
            <div className="mb-5">
              <h3 className="text-[13px] font-semibold">Invite a teammate</h3>
              <p className="mt-1 text-[10px] text-[#9297a3]">
                Create a pending invite record for this workspace.
              </p>
            </div>
            <form
              onSubmit={createInvite}
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]"
            >
              <label className="text-[10px] font-medium">
                Email address
                <span className="relative mt-1.5 block">
                  <Mail
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9297a3]"
                  />
                  <input
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => {
                      setInviteEmail(event.target.value);
                      setInviteNotice("");
                    }}
                    placeholder="teammate@example.com"
                    className={`${inputClass} pl-9`}
                  />
                </span>
              </label>
              <label className="text-[10px] font-medium">
                Workspace role
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  className={inputClass}
                >
                  <option>Member</option>
                  <option>Admin</option>
                  <option>Guest</option>
                </select>
              </label>
              <button
                type="submit"
                disabled={!loaded}
                className="mt-auto flex items-center justify-center gap-2 rounded-md bg-[#6755e8] px-3 py-2.5 text-[10px] font-semibold text-white hover:bg-[#5947d3] disabled:opacity-50"
              >
                <Send size={13} /> Create invite
              </button>
            </form>
            <p
              role="status"
              className="mt-3 min-h-4 text-[10px] text-[#777d89]"
            >
              {inviteNotice}
            </p>

            <div className="mt-4 border-t border-[#eff0f3] pt-4 dark:border-white/10">
              <h3 className="mb-2 text-[11px] font-semibold">Invite history</h3>
              {invitations.length > 0 ? (
                <div className="divide-y divide-[#eff0f3] dark:divide-white/10">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex flex-wrap items-center gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium">
                          {invitation.email}
                        </p>
                        <p className="mt-1 text-[9px] text-[#9297a3]">
                          {invitation.role} · {formatDate(invitation.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[9px] ${invitation.status === "Pending" ? "bg-[#fff5e8] text-[#a56b20]" : "bg-[#f2f3f5] text-[#858b97]"}`}
                      >
                        {invitation.status}
                      </span>
                      {invitation.status === "Pending" && (
                        <button
                          type="button"
                          aria-label={`Revoke invite to ${invitation.email}`}
                          onClick={() => revokeInvitation(invitation.id)}
                          className="rounded-md p-1.5 text-[#9297a3] hover:bg-[#fff1f1] hover:text-[#b93d3d]"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-5 text-center text-[10px] text-[#9297a3]">
                  No invites yet.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Clock3 size={15} className="text-[#6755e8]" />
              <h3 className="text-[13px] font-semibold">
                Your recent activity
              </h3>
            </div>
            {activity.length > 0 ? (
              <ol className="divide-y divide-[#eff0f3] dark:divide-white/10">
                {activity.map((entry) => (
                  <li key={entry.id} className="flex gap-3 py-3.5 first:pt-1">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#6755e8]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium">{entry.action}</p>
                      <p className="mt-1 truncate text-[10px] text-[#858b97]">
                        {entry.target}
                      </p>
                    </div>
                    <time
                      dateTime={entry.createdAt}
                      className="shrink-0 text-[9px] text-[#9ca1ac]"
                    >
                      {formatDate(entry.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg border border-dashed border-[#dfe1e8] px-4 py-8 text-center text-[10px] text-[#9297a3] dark:border-white/10">
                Your project and task updates will appear here.
              </p>
            )}
          </div>
        )}
      </section>
    </OrbitWorkspace>
  );
}

function ProfileTabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[10px] font-medium ${active ? "border-[#6755e8] text-[#5b49d4]" : "border-transparent text-[#858b97] hover:text-[#4b505c]"}`}
    >
      {children}
    </button>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[10px] font-medium">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-md border border-[#e1e3e8] bg-transparent px-3 py-2.5 text-[11px] outline-none focus:border-[#6755e8] dark:border-white/10";

function availabilityColor(status: string) {
  if (status === "Away") return "bg-[#e28a4a]";
  if (status === "Do not disturb") return "bg-[#b93d3d]";
  return "bg-[#32825f]";
}

function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== new Date().getFullYear()
      ? { year: "numeric" as const }
      : {}),
  }).format(date);
}
