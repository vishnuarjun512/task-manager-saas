"use client";

import { useState, type FormEvent } from "react";
import { DialogShell } from "@/components/dialog-shell";
import { useActivityStore } from "@/lib/stores/activity-store";

export function InviteTeammateDialog({ onClose }: { onClose: () => void }) {
  const { inviteTeammate } = useActivityStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = inviteTeammate(email, role);
    if (created) {
      onClose();
      return;
    }
    setNotice("Check the email address or existing invitations.");
  }

  return (
    <DialogShell
      title="Invite a teammate"
      description="Prepare a workspace invitation."
      onClose={onClose}
    >
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Email address
          <input
            autoFocus
            required
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setNotice("");
            }}
            placeholder="teammate@example.com"
            className="rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Workspace role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-md border border-[#e1e3e9] bg-white px-3 py-2.5 text-[11px] dark:border-white/10 dark:bg-[#181920]"
          >
            <option>Member</option>
            <option>Admin</option>
            <option>Guest</option>
          </select>
        </label>
        <p role="status" className="min-h-4 text-[10px] text-[#858b97]">
          {notice || "Invites are prepared for this session; no email will be sent."}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-[11px] text-[#777d89] hover:bg-[#f3f4f6] dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"

            className="rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            Create invite
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
