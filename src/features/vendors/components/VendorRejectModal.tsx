import { useEffect, useState } from "react";
import { Modal, Input, Button } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import type { ApiVendor } from "@/redux/features/vendors/vendors.types";

/** Collects a rejection reason before changing a vendor's status to rejected. */
export function VendorRejectModal({
  vendor,
  open,
  loading,
  onCancel,
  onConfirm,
}: {
  vendor: ApiVendor | null;
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open, vendor?._id]);

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("Please provide at least 5 characters explaining the decision");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={460} title="Reject vendor" destroyOnHidden>
      <p className="text-sm text-mist-400">
        Let {vendor?.name ?? "the vendor"} know why their application was rejected. This reason is stored on their
        account.
      </p>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-cloud-100">Rejection reason</label>
        <Input.TextArea
          rows={4}
          value={reason}
          status={error ? "error" : undefined}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Explain the decision…"
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button danger type="primary" icon={<CloseCircleFilled />} loading={loading} onClick={handleConfirm}>
          Confirm rejection
        </Button>
      </div>
    </Modal>
  );
}
