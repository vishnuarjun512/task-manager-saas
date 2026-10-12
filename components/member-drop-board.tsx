"use client";

import { UserRound, X } from "lucide-react";
import type { ProjectRole } from "@/lib/stores/types";

export type AssignablePerson = {
  id: string;
  name: string;
  email?: string;
};

export function MemberDropBoard({
  people,
  roles,
  assignments,
  onAssign,
  onRemove,
  emptyMessage = "Drag a connection here",
}: {
  people: AssignablePerson[];
  roles: ProjectRole[];
  assignments: Record<string, string>;
  onAssign: (personId: string, roleId: string) => void;
  onRemove: (personId: string) => void;
  emptyMessage?: string;
}) {
  const assignedIds = new Set(Object.keys(assignments));

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(150px,0.8fr)_minmax(0,2fr)]">
      <section
        aria-label="Available connections"
        className="rounded-lg border border-dashed border-[#d8dbe4] bg-[#fafbfc] p-3 dark:border-white/15 dark:bg-white/[0.02]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const personId = event.dataTransfer.getData("text/person-id");
          if (personId) onRemove(personId);
        }}
      >
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#888e9a]">
          Connections
        </h4>
        <p className="mb-2 mt-1 text-[9px] text-[#a0a5ae]">
          Drag into a role
        </p>
        <div className="flex min-h-14 flex-col gap-2">
          {people.filter((person) => !assignedIds.has(person.id)).length > 0 ? (
            people
              .filter((person) => !assignedIds.has(person.id))
              .map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/person-id", person.id)
                  }
                />
              ))
          ) : (
            <p className="rounded-md border border-dashed border-[#e1e3e9] px-2 py-4 text-center text-[9px] text-[#a0a5ae] dark:border-white/10">
              No unassigned connections
            </p>
          )}
        </div>
      </section>
      <div className="grid gap-2 sm:grid-cols-2">
        {roles.map((role) => {
          const members = people.filter(
            (person) => assignments[person.id] === role.id,
          );
          return (
            <section
              key={role.id}
              aria-label={`${role.name} role`}
              className="min-h-28 rounded-lg border border-[#e6e8ee] bg-white p-3 transition-colors dark:border-white/10 dark:bg-[#181920]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const personId = event.dataTransfer.getData("text/person-id");
                if (personId) onAssign(personId, role.id);
              }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-[10px] font-semibold">{role.name}</h4>
                  <p className="mt-0.5 text-[8px] text-[#9da2ad]">
                    {role.permissions.length} permissions · {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
              <div className="flex min-h-12 flex-col gap-1.5">
                {members.length > 0 ? (
                  members.map((person) => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      onDragStart={(event) =>
                        event.dataTransfer.setData("text/person-id", person.id)
                      }
                      onRemove={() => onRemove(person.id)}
                    />
                  ))
                ) : (
                  <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-[#e1e3e9] px-2 py-3 text-center text-[9px] text-[#a0a5ae] dark:border-white/10">
                    {emptyMessage}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PersonCard({
  person,
  onDragStart,
  onRemove,
}: {
  person: AssignablePerson;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onRemove?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex cursor-grab items-center gap-2 rounded-md border border-[#e9eaf0] bg-white px-2 py-1.5 active:cursor-grabbing dark:border-white/10 dark:bg-[#20212a]"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f0edff] text-[#6755e8] dark:bg-white/10">
        <UserRound size={12} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[9px] font-medium">
          {person.name}
        </span>
        {person.email && (
          <span className="block truncate text-[8px] text-[#9da2ad]">
            {person.email}
          </span>
        )}
      </span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${person.name}`}
          onClick={onRemove}
          className="rounded p-1 text-[#9da2ad] hover:bg-[#f3f4f6] hover:text-[#b93d3d] dark:hover:bg-white/10"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
