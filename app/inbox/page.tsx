"use client";

import Link from "next/link";
import { Check, Link2, UserRoundPlus, X } from "lucide-react";
import { OrbitWorkspace, PageHeader } from "@/components/orbit-workspace";
import { useWorkspaceStore } from "@/lib/workspace-store";

export default function InboxPage() {
  const { connections, updateConnectionStatus, deleteConnection } =
    useWorkspaceStore();
  const received = connections.filter(
    (connection) =>
      connection.direction === "incoming" && connection.status === "pending",
  );
  const sent = connections.filter(
    (connection) =>
      connection.direction === "outgoing" && connection.status === "pending",
  );

  return (
    <OrbitWorkspace>
      <PageHeader
        title="Inbox"
        description="Review requests and keep up with your workspace network."
        action={
          <Link
            href="/connections"
            className="flex items-center gap-2 rounded-md border border-[#e1e3e9] px-3 py-2 text-[10px] font-medium text-[#6755e8] dark:border-white/10"
          >
            <Link2 size={13} /> All connections
          </Link>
        }
      />

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold">Requests for you</h2>
            <p className="mt-1 text-[10px] text-[#9297a3]">
              {received.length} awaiting your response
            </p>
          </div>
        </div>
        {received.length > 0 ? (
          <div className="divide-y divide-[#eff0f3] rounded-xl border border-[#e7e9ee] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#181920]">
            {received.map((connection) => (
              <div
                key={connection.id}
                className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e8e3ff] text-[10px] font-semibold text-[#6755e8]">
                  {initials(connection.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">
                    {connection.name}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-[#9297a3]">
                    {connection.personId} · {connection.email}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateConnectionStatus(connection.id, "connected")
                    }
                    className="flex items-center gap-1.5 rounded-md bg-[#32825f] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#276c4e]"
                  >
                    <Check size={13} /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateConnectionStatus(connection.id, "declined")
                    }
                    className="flex items-center gap-1.5 rounded-md border border-[#e1e3e9] px-3 py-2 text-[10px] font-medium text-[#777d89] hover:bg-[#f5f6f8] dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <X size={13} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#dfe1e8] px-5 py-9 text-center dark:border-white/10">
            <UserRoundPlus size={18} className="mx-auto text-[#9ca1ac]" />
            <p className="mt-2 text-[11px] font-medium">
              You are all caught up
            </p>
            <p className="mt-1 text-[10px] text-[#9297a3]">
              New connection requests will appear here.
            </p>
          </div>
        )}
      </section>

      {sent.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-[13px] font-semibold">Sent requests</h2>
          <div className="divide-y divide-[#eff0f3] rounded-xl border border-[#e7e9ee] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#181920]">
            {sent.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium">{connection.name}</p>
                  <p className="mt-1 font-mono text-[9px] text-[#9297a3]">
                    {connection.personId}
                  </p>
                </div>
                <span className="text-[10px] text-[#a56b20]">Pending</span>
                <button
                  type="button"
                  aria-label={`Cancel request to ${connection.name}`}
                  onClick={() => deleteConnection(connection.id)}
                  className="rounded-md p-1.5 text-[#9297a3] hover:bg-[#fff1f1] hover:text-[#b93d3d]"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </OrbitWorkspace>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
