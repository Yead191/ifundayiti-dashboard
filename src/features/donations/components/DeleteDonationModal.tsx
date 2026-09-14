import { Modal, Button } from "antd";
import { WarningOutlined, DeleteOutlined } from "@ant-design/icons";
import type { IDonation } from "@/redux/features/donations/donations.types";
import { formatCurrency } from "@/lib/utils";

interface DeleteDonationModalProps {
  open: boolean;
  donation?: IDonation | null;
  batchCount?: number;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDonationModal({
  open,
  donation,
  batchCount = 0,
  loading,
  onCancel,
  onConfirm,
}: DeleteDonationModalProps) {
  const isBatch = batchCount > 1;

  if (!open) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={460}
      centered
      destroyOnClose
      className="rounded-3xl"
    >
      <div className="text-center pt-3 pb-2 space-y-3.5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <WarningOutlined className="text-2xl" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 font-display">
            {isBatch
              ? `Delete ${batchCount} Transaction Records?`
              : "Delete Transaction Record?"}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            {isBatch ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {batchCount} selected transactions
                </span>
                ? This will permanently purge the records and synchronize the fund balance.
              </>
            ) : donation ? (
              <>
                Are you sure you want to delete the transaction of{" "}
                <span className="font-semibold text-gray-800">
                  {formatCurrency(donation.amount)}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-gray-800">
                  {donation.name || "Donor"}
                </span>
                ? This action will permanently remove the record and adjust the program fund balance.
              </>
            ) : (
              "Are you sure you want to delete this record?"
            )}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50/80 border border-amber-200/60 p-3 text-left">
          <p className="text-[11px] text-amber-800 leading-snug">
            <strong>Notice:</strong> This action cannot be undone. Financial audit trails and live liquidity figures will be recalculated automatically.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="h-10 rounded-xl px-5 font-medium"
          >
            Cancel
          </Button>
          <Button
            danger
            type="primary"
            loading={loading}
            onClick={onConfirm}
            icon={<DeleteOutlined />}
            className="h-10 rounded-xl px-5 font-semibold bg-rose-600! hover:bg-rose-700! border-0 shadow-sm"
          >
            {isBatch ? `Delete ${batchCount} Records` : "Delete Record"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
