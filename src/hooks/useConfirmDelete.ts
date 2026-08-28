import { useState } from "react";

/**
 * Generic controller for a "confirm delete" flow: holds the record pending
 * deletion, exposes open/close handlers, and wraps the async delete call
 * with a small loading + toast-friendly state.
 */
export function useConfirmDelete<T>(onDelete: (record: T) => void | Promise<void>) {
  const [target, setTarget] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const request = (record: T) => setTarget(record);
  const cancel = () => {
    if (loading) return;
    setTarget(null);
  };

  const confirm = async () => {
    if (!target) return;
    setLoading(true);
    try {
      await onDelete(target);
    } finally {
      setLoading(false);
      setTarget(null);
    }
  };

  return { target, isOpen: !!target, loading, request, cancel, confirm };
}
