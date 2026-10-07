"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { useTheme } from "@/lib/theme-provider";

export function Toaster(props: ToasterProps) {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="bottom-right"
      theme={theme}
      richColors={theme !== "dark"}
      closeButton
      toastOptions={{ duration: 5000 }}
      {...props}
    />
  );
}
