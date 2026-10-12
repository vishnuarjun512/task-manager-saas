import type { ConnectionRequest } from "@/lib/stores/types";

type RecordValue = Record<string, unknown>;

export type PublicPerson = {
  id: string;
  publicId: string;
  name: string;
  email: string;
};

export function parseConnectionsResponse(data: unknown): ConnectionRequest[] {
  const records =
    isRecord(data) && Array.isArray(data.connections)
      ? data.connections
      : isRecord(data) && Array.isArray(data.requests)
        ? data.requests
        : null;
  if (!records) {
    throw new Error(
      "The connections response did not include a connections array.",
    );
  }

  return records.map((value) => {
    if (!isRecord(value)) {
      throw new Error("The connections response contains an invalid record.");
    }
    const id = getString(value.connection_id ?? value.request_id ?? value.id);
    const personId = getString(
      value.person_id ??
        value.user_id ??
        value.recipient_user_id ??
        value.requester_user_id,
    );
    const publicId = getString(value.public_id ?? value.person_public_id);
    const name = getString(value.display_name ?? value.name);
    const email = getString(value.email);
    const direction =
      value.direction === "incoming" ||
      (value.requester_user_id &&
        value.current_user_is_requester === false)
        ? "incoming"
        : "outgoing";
    const status =
      value.status === "accepted" || value.status === "connected"
        ? "connected"
        : value.status === "declined"
          ? "declined"
          : value.status === "pending"
            ? "pending"
            : null;
    if (!id || !personId || !publicId || !name || !status) {
      throw new Error("The connections response contains an invalid record.");
    }
    return {
      id,
      personId,
      publicId,
      name,
      email: email ?? "",
      direction,
      status,
    };
  });
}

export function parsePublicPerson(data: unknown): PublicPerson {
  const person =
    isRecord(data) && isRecord(data.user)
      ? data.user
      : isRecord(data) && isRecord(data.person)
        ? data.person
        : isRecord(data)
          ? data
          : null;
  if (!person) throw new Error("The user lookup did not return a person.");
  const id = getString(person.user_id ?? person.id);
  const publicId = getString(person.public_id);
  const name = getString(person.display_name ?? person.full_name ?? person.name);
  const email = getString(person.email);
  if (!id || !publicId || !name) {
    throw new Error("The user lookup returned incomplete person details.");
  }
  return { id, publicId, name, email: email ?? "" };
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
