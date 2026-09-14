import { Modal, Button } from "antd";
import { WarningOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ITransaction } from "@/redux/features/transactions/transactions.types";
import { formatCurrency } from "@/lib/utils";

interface DeleteTransactionModalProps {
  open: boolean;
  transaction?: ITransaction | null;
  batchCount?: number;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteTransactionModal({
  open,
  transaction,
  batchCount = 0,
  loading,
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) {
  const isBatch = batchCount > 1;

  if (!open) return null;

  const user = typeof transaction?.user === "object" ? transaction?.user : null;
  const displayAmount = formatCurrency(transaction?.total_price || transaction?.amount || 0);
  const displayRef = transaction?.transaction_id || transaction?._id?.slice(0, 10);

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
                ? This will permanently purge the records from transaction history.
              </>
            ) : transaction ? (
              <>
                Are you sure you want to delete the transaction record{" "}
                <span className="font-mono font-semibold text-gray-800">
                  {displayRef}
                </span>{" "}
                ({displayAmount}{user?.name ? ` • ${user.name}` : ""})? This action will remove it from transaction history.
              </>
            ) : (
              "Are you sure you want to delete this transaction record?"
            )}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50/80 border border-amber-200/60 p-3 text-left">
          <p className="text-[11px] text-amber-800 leading-snug">
            <strong>Warning:</strong> Deleting transaction records is permanent and cannot be undone. Ledger statistics and revenue metrics will be updated accordingly.
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
