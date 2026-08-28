import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  flat,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        flat ? "glass-panel-flat" : "glass-panel",
        padded && "p-5 md:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
