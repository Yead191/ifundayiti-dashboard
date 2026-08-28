import { useMemo } from "react";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * Dependency-free SVG donut chart with a centered total and an inline legend.
 * Slices are drawn as stroked circle segments using dash arrays.
 */
export function DonutChart({
  data,
  size = 168,
  thickness = 18,
  centerLabel = "Total",
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
}) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const segments = data.map((slice) => {
    const fraction = total === 0 ? 0 : slice.value / total;
    const dash = fraction * circumference;
    const segment = {
      ...slice,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -accumulated,
    };
    accumulated += dash;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={thickness}
          />
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-cloud-100">{total}</span>
          <span className="text-[11px] text-mist-600">{centerLabel}</span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-1">
        {data.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-mist-300">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.color }} />
              {slice.label}
            </span>
            <span className="font-medium text-cloud-100">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
