"use client";

import { DialogShell } from "@/components/dialog-shell";

const shortcuts = [
  { action: "Open search", keys: ["⌘", "K"] },
  { action: "Show keyboard shortcuts", keys: ["?"] },
  { action: "Close dialogs and menus", keys: ["Esc"] },
];

export function KeyboardShortcutList() {
  return (
    <dl className="divide-y divide-[#eff0f3] dark:divide-white/10">
      {shortcuts.map(({ action, keys }) => (
        <div
          key={action}
          className="flex items-center justify-between gap-4 py-3"
        >
          <dt className="text-[11px] text-[#666c78] dark:text-[#c4c7d0]">
            {action}
          </dt>
          <dd className="flex shrink-0 items-center gap-1">
            {keys.map((key) => (
              <kbd
                key={key}
                className="min-w-7 rounded border border-[#e1e3e9] bg-[#f7f8fa] px-2 py-1 text-center text-[10px] text-[#737987] dark:border-white/10 dark:bg-white/5 dark:text-[#d5d7df]"
              >
                {key}
              </kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogShell
      title="Keyboard shortcuts"
      description="Quick actions available throughout Orbit."
      onClose={onClose}
    >
      <div className="mt-4">
        <KeyboardShortcutList />
      </div>
    </DialogShell>
  );
}
