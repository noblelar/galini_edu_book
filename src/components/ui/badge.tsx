import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className }: { children: React.ReactNode; variant?: "default" | "blue" | "green" | "red" | "outline"; className?: string }) {
  const variants = {
    default: "bg-black/10 text-black dark:bg-white/10 dark:text-white",
    blue: "bg-[#4586F7]/15 text-[#0a46c4]",
    green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    red: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    outline: "border border-black/[.08] dark:border-white/[.145]",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}
