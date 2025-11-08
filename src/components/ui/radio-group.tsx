import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function RadioGroup({ name, value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn("grid gap-3", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const checked = child.props.value === value;
        return React.cloneElement(child as React.ReactElement<any>, {
          name,
          checked,
          onChange: () => onValueChange(child.props.value),
        });
      })}
    </div>
  );
}

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: string;
}

export function RadioGroupItem({ label, className, ...props }: RadioGroupItemProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 rounded-md border border-black/[.08] p-3 hover:bg-black/[.03] dark:border-white/[.145] dark:hover:bg-[#111]", className)}>
      <input type="radio" className="h-4 w-4" {...props} />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
