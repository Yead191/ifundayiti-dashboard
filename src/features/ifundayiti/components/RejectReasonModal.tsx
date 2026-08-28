import { useEffect, useState } from "react";
import { Modal, Input, Button } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { rejectionReasonSchema } from "../schemas";

/** Captures a required rejection reason before rejecting an application. */
export function RejectReasonModal({
  open,
  applicantName,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  applicantName?: string;
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
  }, [open]);

  const handleConfirm = () => {
    const result = rejectionReasonSchema.safeParse({ reason });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid reason");
      return;
    }
    onConfirm(result.data.reason);
  };

  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={460} title="Reject application" destroyOnHidden>
      <p className="text-sm text-mist-400">
        Let {applicantName ?? "the applicant"} know why the application wasn't successful. Rejected applicants never
        appear on the public website.
      </p>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-cloud-100">Reason for rejection</label>
        <Input.TextArea
          rows={4}
          value={reason}
          status={error ? "error" : undefined}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Explain the decision — this is stored with the application record."
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button danger type="primary" icon={<CloseCircleFilled />} onClick={handleConfirm}>
          Confirm rejection
        </Button>
      </div>
    </Modal>
  );
}
