"use client";

import type { ReactNode, MouseEvent } from "react";
import { X } from "lucide-react";

export function DialogShell({
  title,
  description,
  children,
  onClose,
  width = "max-w-120",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      role="presentation"
      onMouseDown={closeFromBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`max-h-[90vh] w-full ${width} overflow-y-auto rounded-xl border border-[#e7e9ee] bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#181920]`}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-[16px] font-semibold">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[11px] text-[#9297a3]">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#8c919d] hover:bg-[#f3f4f6] dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogShell title={title} description={description} onClose={onClose}>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-2 text-[11px] font-medium text-[#777d89] hover:bg-[#f3f4f6] dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-[#b93d3d] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#9f3030]"
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}
