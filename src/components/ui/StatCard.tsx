import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  trend,
  tone = "violet",
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { direction: "up" | "down"; label: string };
  tone?: "violet" | "success" | "warning" | "info" | "danger" | "gold" | "neutral";
}) {
  const iconWrap: Record<string, string> = {
    violet: "from-[#8131F0] to-[#4A1C8A]",
    success: "from-[#34d399] to-[#0f9b6e]",
    warning: "from-[#f5b544] to-[#c9800f]",
    info: "from-[#5cc8f5] to-[#1f7bb0]",
    danger: "from-[#f2617a] to-[#b3273f]",
    gold: "from-[#f5b544] to-[#c9800f]",
    neutral: "from-[#313564] to-[#191d3f]",
  };

  return (
    <div className="glass-panel-flat surface-hover p-5 hover:border-violet-600/30">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-[0_6px_18px_-6px_rgba(129,49,240,0.55)]",
            iconWrap[tone]
          )}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              trend.direction === "up" ? "bg-success/12 text-success" : "bg-danger/12 text-danger"
            )}
          >
            {trend.direction === "up" ? "▲" : "▼"} {trend.label}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-2xl font-semibold text-cloud-100">{value}</div>
      <div className="mt-0.5 text-[13px] text-mist-400">{label}</div>
    </div>
  );
}
