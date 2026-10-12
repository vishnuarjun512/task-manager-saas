"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTaskStore } from "@/lib/stores/task-store";

let hydrationRequest: Promise<void> | null = null;

function hydrateStoredWork() {
  if (!hydrationRequest) {
    hydrationRequest = Promise.all([
      useProjectStore.persist.rehydrate(),
      useTaskStore.persist.rehydrate(),
    ])
      .then(() => undefined)
      .catch((error: unknown) => {
        hydrationRequest = null;
        throw error;
      });
  }
  return hydrationRequest;
}

export function useStoreHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateStoredWork()
      .then(() => {
        if (!cancelled) setIsHydrated(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error("Saved project data could not be loaded", {
            description:
              error instanceof Error ? error.message : "Something went wrong.",
          });
          setIsHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return isHydrated;
}
