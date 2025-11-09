import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ children, className }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-left text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="text-xs text-zinc-500">{children}</thead>;
}

export function TRow({ children, className }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-black/[.06] dark:border-white/[.095]", className)}>{children}</tr>;
}

export function TH({ children, className }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-3 py-2 font-medium", className)}>{children}</th>;
}

export function TD({ children, className }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-3", className)}>{children}</td>;
}
