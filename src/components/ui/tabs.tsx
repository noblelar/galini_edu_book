import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4", className)}>{children}</div>;
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 rounded-md bg-black/[.04] p-1 dark:bg-[#111]">{children}</div>;
}

export function TabsTrigger({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-white dark:text-zinc-300 dark:hover:bg-black",
        active && "bg-white shadow-sm dark:bg-black"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ hidden, children }: { hidden?: boolean; children: React.ReactNode }) {
  if (hidden) return null;
  return <div>{children}</div>;
}
