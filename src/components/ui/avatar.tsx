import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ src, name, className }: { src?: string; name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-sm font-semibold text-black dark:bg-white/10 dark:text-white", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
