import type { ReactNode } from "react";
import { Button } from "antd";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-600/70 px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800 text-2xl text-mist-400">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[15px] font-semibold text-cloud-100">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-mist-400">{description}</p>}
      {actionLabel && onAction && (
        <Button type="primary" className="btn-gradient !mt-5 !border-0" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
