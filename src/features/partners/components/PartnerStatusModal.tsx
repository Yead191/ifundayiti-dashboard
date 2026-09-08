import { useState, useEffect } from "react";
import { Modal, Radio, Input, Alert, Button } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  MailOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useChangePartnerStatusMutation } from "@/redux/features/partners/partnersApi";
import type { ApiPartner, PartnerStatus } from "@/redux/features/partners/partners.types";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";
import { getErrorMessage } from "../partnerHelpers";

const { TextArea } = Input;

interface PartnerStatusModalProps {
  open: boolean;
  partner: ApiPartner | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PartnerStatusModal({
  open,
  partner,
  onClose,
  onSuccess,
}: PartnerStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<PartnerStatus>(
    PARTNER_STATUS.APPROVED
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [changeStatus, { isLoading }] = useChangePartnerStatusMutation();

  useEffect(() => {
    if (partner) {
      const current = (partner.status as PartnerStatus) || PARTNER_STATUS.PENDING;
      setSelectedStatus(
        current === PARTNER_STATUS.PENDING ? PARTNER_STATUS.APPROVED : current
      );
      setRejectionReason(partner.rejectionReason || "");
    }
  }, [partner, open]);

  if (!partner) return null;

  const handleSubmit = async () => {
    if (selectedStatus === PARTNER_STATUS.REJECTED && !rejectionReason.trim()) {
      toast.error("Feedback required", {
        description: "Please provide a brief reason for rejection to inform the applicant.",
      });
      return;
    }

    try {
      await changeStatus({
        id: partner._id,
        status: selectedStatus,
        rejectionReason:
          selectedStatus === PARTNER_STATUS.REJECTED ? rejectionReason.trim() : undefined,
      }).unwrap();

      toast.success("Partner status updated", {
        description: `${partner.name} is now marked as ${selectedStatus}.`,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to change status", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      title={
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            <CheckCircleFilled className="text-lg" />
          </div>
          <div>
            <h3 className="text-base font-bold text-cloud-100">Review Partner Application</h3>
            <p className="text-xs text-mist-500 font-normal">
              Managing status for: <span className="font-semibold text-cloud-100">{partner.name}</span>
            </p>
          </div>
        </div>
      }
    >
      <div className="py-3 space-y-4">
        {/* Status Selection Cards */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-mist-600 block mb-2">
            Target Status Decision
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {/* Approved Option */}
            <div
              onClick={() => setSelectedStatus(PARTNER_STATUS.APPROVED)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                selectedStatus === PARTNER_STATUS.APPROVED
                  ? "border-[#0B3D2E] bg-emerald-50/50 ring-1 ring-[#0B3D2E]"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <Radio checked={selectedStatus === PARTNER_STATUS.APPROVED} className="mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#0B3D2E] flex items-center gap-1.5">
                    <CheckCircleFilled className="text-emerald-700" />
                    Approve Partner
                  </span>
                </div>
                <p className="text-xs text-mist-600 mt-0.5">
                  Publish organization to public partner directory and authorize for storefront carousels.
                </p>
              </div>
            </div>

            {/* Pending Option */}
            <div
              onClick={() => setSelectedStatus(PARTNER_STATUS.PENDING)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                selectedStatus === PARTNER_STATUS.PENDING
                  ? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <Radio checked={selectedStatus === PARTNER_STATUS.PENDING} className="mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-amber-700 flex items-center gap-1.5">
                    <ClockCircleFilled className="text-amber-600" />
                    Keep Under Review (Pending)
                  </span>
                </div>
                <p className="text-xs text-mist-600 mt-0.5">
                  Partner remains in internal evaluation; hidden from public visitors.
                </p>
              </div>
            </div>

            {/* Rejected Option */}
            <div
              onClick={() => setSelectedStatus(PARTNER_STATUS.REJECTED)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 ${
                selectedStatus === PARTNER_STATUS.REJECTED
                  ? "border-rose-500 bg-rose-50/50 ring-1 ring-rose-500"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <Radio checked={selectedStatus === PARTNER_STATUS.REJECTED} className="mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-rose-700 flex items-center gap-1.5">
                    <CloseCircleFilled className="text-rose-600" />
                    Reject Application
                  </span>
                </div>
                <p className="text-xs text-mist-600 mt-0.5">
                  Decline this submission. Constructive feedback will be emailed to applicant.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Feedback field */}
        {selectedStatus === PARTNER_STATUS.REJECTED && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                Feedback for Applicant <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-rose-700">Included in status email</span>
            </div>
            <TextArea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Thank you for your application. Currently we require active 501(c)(3) or verified NGO registration in Haiti to proceed with partnership..."
              className="rounded-lg text-xs"
            />
          </div>
        )}

        {/* Automated Notifications Info */}
        <div className="flex items-center gap-2 text-xs text-mist-500 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          <MailOutlined className="text-emerald-700 text-sm shrink-0" />
          <span>
            Automated IFundAyiti email and in-app notification will be dispatched immediately upon decision.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <Button onClick={onClose} disabled={isLoading} className="rounded-xl h-9">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            className="rounded-xl h-9 px-5 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm"
          >
            Confirm Decision
          </Button>
        </div>
      </div>
    </Modal>
  );
}
