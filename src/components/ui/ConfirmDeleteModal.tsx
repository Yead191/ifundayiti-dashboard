import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

export function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      width={420}
      footer={null}
      closable={false}
      maskClosable={!loading}
    >
      <div className="flex gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/12 text-danger">
          <ExclamationCircleFilled className="text-lg" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[15px] font-semibold text-cloud-100">{title}</h3>
          {description && <p className="mt-1.5 text-sm leading-relaxed text-mist-400">{description}</p>}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-navy-600 px-3.5 py-2 text-sm font-medium text-mist-400 transition hover:bg-white/5 hover:text-cloud-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="rounded-lg bg-linear-to-r from-danger to-[#b3273f] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(242,97,122,0.7)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
