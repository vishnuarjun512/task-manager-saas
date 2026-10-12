"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { apiFetch, isApiConfigured, SessionExpiredError } from "@/lib/api-fetch";
import { parseConnectionsResponse } from "@/lib/connection-api";
import { useConnectionStore } from "@/lib/stores/connection-store";
import { useApi } from "@/lib/use-api";

/** Refreshes connected people and request state from the authenticated account. */
export function useConnectionHydration() {
  const { execute } = useApi();
  const setConnections = useConnectionStore((state) => state.setConnections);

  useEffect(() => {
    if (!isApiConfigured) return;
    let cancelled = false;
    execute(() => apiFetch("/connections", "GET"))
      .then((data) => {
        if (!cancelled) setConnections(parseConnectionsResponse(data));
      })
      .catch((error: unknown) => {
        if (cancelled || error instanceof SessionExpiredError) return;
        toast.error("Connections could not be loaded", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [execute, setConnections]);
}
