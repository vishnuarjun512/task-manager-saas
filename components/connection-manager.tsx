"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Link2, Plus, Trash2, X } from "lucide-react";
import { ConfirmDialog, DialogShell } from "@/components/dialog-shell";
import { peopleDirectory, useConnectionStore } from "@/lib/stores/connection-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import type { ConnectionRequest } from "@/lib/stores/types";

export function ConnectionManager() {
  const {
    connections,
    sendConnectionRequest,
    updateConnectionStatus,
    deleteConnection,
  } = useConnectionStore();
  const { profile } = useProfileStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [removing, setRemoving] = useState<ConnectionRequest | null>(null);
  const incomingCount = connections.filter(
    (connection) =>
      connection.direction === "incoming" && connection.status === "pending",
  ).length;

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold">People</h2>
          <p className="mt-1 text-[11px] text-[#9297a3]">
            {
              connections.filter(
                (connection) => connection.status === "connected",
              ).length
            }{" "}
            connected
            {incomingCount > 0 ? ` · ${incomingCount} requests to review` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#5947d3]"
        >
          <Plus size={14} /> Connect by ID
        </button>
      </div>

      {connections.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-[#e7e9ee] bg-white dark:border-white/10 dark:bg-[#181920]">
          <table className="w-full min-w-170 border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eff0f3] text-[9px] font-semibold uppercase tracking-widest text-[#969ba6] dark:border-white/10">
                <th className="px-4 py-3">Person</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((connection) => (
                <tr
                  key={connection.id}
                  className="border-b border-[#eff0f3] last:border-0 dark:border-white/10"
                >
                  <td className="px-4 py-3.5">
                    <p className="text-[11px] font-medium">{connection.name}</p>
                    <p className="mt-1 text-[10px] text-[#9297a3]">
                      {connection.email}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[10px] text-[#747a87]">
                    {connection.personId}
                  </td>
                  <td className="px-4 py-3.5 text-[10px] capitalize text-[#747a87]">
                    {connection.direction}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-medium ${statusStyle(connection.status)}`}
                    >
                      {connection.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      {connection.direction === "incoming" &&
                      connection.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              updateConnectionStatus(connection.id, "connected")
                            }
                            className="flex items-center gap-1 rounded-md bg-[#edfaf4] px-2 py-1.5 text-[10px] font-medium text-[#32825f] hover:bg-[#def5e9]"
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateConnectionStatus(connection.id, "declined")
                            }
                            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] text-[#888e99] hover:bg-[#f3f4f6]"
                          >
                            <X size={12} /> Decline
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          aria-label={`${connection.status === "pending" ? "Cancel" : "Remove"} ${connection.name}`}
                          onClick={() => setRemoving(connection)}
                          className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#fff1f1] hover:text-[#b93d3d] dark:hover:bg-white/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#dfe1e8] px-5 py-10 text-center dark:border-white/10">
          <Link2 size={18} className="mx-auto text-[#9ca1ac]" />
          <p className="mt-2 text-[12px] font-medium">
            No connection requests yet
          </p>
          <p className="mt-1 text-[10px] text-[#9297a3]">
            Connect with teammates using their Orbit ID.
          </p>
        </div>
      )}

      {dialogOpen && (
        <ConnectionForm
          currentUserId={profile.id}
          connections={connections}
          onClose={() => setDialogOpen(false)}
          onSend={sendConnectionRequest}
        />
      )}
      {removing && (
        <ConfirmDialog
          title={`${removing.status === "pending" ? "Cancel request to" : "Remove"} ${removing.name}?`}
          description="This person will no longer appear in your connections."
          confirmLabel={
            removing.status === "pending" ? "Cancel request" : "Remove"
          }
          onClose={() => setRemoving(null)}
          onConfirm={() => {
            deleteConnection(removing.id);
            setRemoving(null);
          }}
        />
      )}
    </section>
  );
}

function ConnectionForm({
  currentUserId,
  connections,
  onClose,
  onSend,
}: {
  currentUserId: string;
  connections: ConnectionRequest[];
  onClose: () => void;
  onSend: (personId: string) => boolean;
}) {
  const [personId, setPersonId] = useState("");
  const [feedback, setFeedback] = useState("");
  const person = useMemo(
    () =>
      peopleDirectory.find(
        (candidate) =>
          candidate.id.toLowerCase() === personId.trim().toLowerCase(),
      ),
    [personId],
  );
  const isSelf = person?.id === currentUserId;
  const existing = connections.find(
    (connection) =>
      connection.personId === person?.id && connection.status !== "declined",
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!person) return;
    const sent = onSend(person.id);
    if (sent) onClose();
    else setFeedback("A request or connection already exists for this ID.");
  }

  return (
    <DialogShell
      title="Connect with someone"
      description="Enter a teammate's Orbit ID to send a request."
      onClose={onClose}
    >
      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-[11px] font-medium">
          Orbit ID
          <input
            autoFocus
            required
            value={personId}
            onChange={(event) => {
              setPersonId(event.target.value.toUpperCase());
              setFeedback("");
            }}
            placeholder="ORB-2048"
            className="rounded-md border border-[#e1e3e9] bg-transparent px-3 py-2.5 font-mono text-[12px] outline-none focus:border-[#6755e8] dark:border-white/10"
          />
        </label>
        {person && !isSelf && (
          <div className="rounded-lg border border-[#e9eaf0] px-3 py-2.5 dark:border-white/10">
            <p className="text-[11px] font-medium">{person.name}</p>
            <p className="mt-1 text-[10px] text-[#9297a3]">{person.email}</p>
          </div>
        )}
        {personId && !person && (
          <p className="text-[10px] text-[#b93d3d]">
            No person found with that ID in this directory.
          </p>
        )}
        {isSelf && (
          <p className="text-[10px] text-[#b93d3d]">
            You cannot send a request to your own ID.
          </p>
        )}
        {(existing || feedback) && (
          <p className="text-[10px] text-[#b93d3d]">
            {feedback || "A request or connection already exists for this ID."}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-[11px] text-[#777d89] hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!person || isSelf || Boolean(existing)}
            className="rounded-md bg-[#6755e8] px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-40"
          >
            Send request
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

function statusStyle(status: ConnectionRequest["status"]) {
  if (status === "connected") return "bg-[#edfaf4] text-[#32825f]";
  if (status === "declined") return "bg-[#f4f4f6] text-[#858b97]";
  return "bg-[#fff5e8] text-[#a56b20]";
}
