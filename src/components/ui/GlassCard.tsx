import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  padded?: boolean;
}

export function GlassCard({
  children,
  className,
  flat,
  padded = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        flat ? "glass-panel-flat" : "glass-panel",
        padded && "p-5 md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
