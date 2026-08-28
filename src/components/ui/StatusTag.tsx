import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/common";

const TONE_STYLES: Record<StatusTone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/12 text-warning border-warning/25",
  danger: "bg-danger/12 text-danger border-danger/25",
  info: "bg-info/12 text-info border-info/25",
  violet: "bg-violet-600/15 text-violet-glow border-violet-600/30",
  gold: "bg-[#f5b544]/12 text-[#f5b544] border-[#f5b544]/30",
  neutral: "bg-white/[0.06] text-mist-400 border-white/10",
};

export function StatusTag({
  tone,
  children,
  icon,
}: {
  tone: StatusTone;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium leading-none",
        TONE_STYLES[tone]
      )}
    >
      {icon}
      {children}
    </span>
  );
}
