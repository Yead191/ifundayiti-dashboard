import type { ReactNode } from "react";

export function PageToolbar({
  eyebrow,
  count,
  children,
}: {
  eyebrow: string;
  count?: number;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-mist-400">
        {eyebrow}
        {typeof count === "number" && (
          <span className="ml-2 rounded-full bg-navy-700/70 px-2 py-0.5 text-xs font-medium text-cloud-100">
            {count}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
