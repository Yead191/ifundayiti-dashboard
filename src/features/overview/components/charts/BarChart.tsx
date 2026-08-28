import { useMemo } from "react";
import { Tooltip } from "antd";
import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
}

/**
 * Lightweight, dependency-free vertical bar chart. Bars use the violet brand
 * gradient and animate in on mount. Empty months render as faint baselines so
 * the axis stays readable even when the dataset is sparse.
 */
export function BarChart({
  data,
  height = 200,
  valueFormatter = (v) => `${v}`,
  gradientFrom = "#8131F0",
  gradientTo = "#4A1C8A",
}: {
  data: BarDatum[];
  height?: number;
  valueFormatter?: (value: number) => string;
  gradientFrom?: string;
  gradientTo?: string;
}) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full items-end gap-1.5">
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <Tooltip title={`${d.label}: ${valueFormatter(d.value)}`}>
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-[26px] rounded-t-md transition-all duration-500 ease-out",
                      d.value === 0 && "opacity-40"
                    )}
                    style={{
                      height: d.value === 0 ? 3 : `${Math.max(pct, 2)}%`,
                      background:
                        d.value === 0
                          ? "rgba(255,255,255,0.06)"
                          : `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})`,
                      boxShadow: d.value === 0 ? "none" : `0 6px 16px -8px ${gradientFrom}99`,
                    }}
                  />
                </div>
              </Tooltip>
              <span className="w-full truncate text-center text-[10px] font-medium text-mist-600">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
