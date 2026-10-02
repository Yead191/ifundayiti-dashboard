import { Modal, Button } from "antd";
import { ExclamationCircleOutlined, DeleteOutlined, SyncOutlined } from "@ant-design/icons";
import { formatCurrency } from "@/lib/utils";
import type { IExpense } from "@/redux/features/expenses/expenses.types";

interface DeleteExpenseModalProps {
  open: boolean;
  expense?: IExpense | null;
  batchCount?: number;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteExpenseModal({
  open,
  expense,
  batchCount,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteExpenseModalProps) {
  const isBatch = Boolean(batchCount && batchCount > 0);
  const isPaid = expense?.payment_status === "paid";

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={460}
      centered
      className="rounded-3xl"
    >
      <div className="pt-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <ExclamationCircleOutlined className="text-2xl" />
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-gray-900">
          {isBatch ? `Delete ${batchCount} Expense Records?` : "Delete Expense Record?"}
        </h3>

        <div className="mt-2 space-y-2 text-xs text-gray-500 leading-relaxed px-2">
          {isBatch ? (
            <p>
              Are you sure you want to delete these <strong className="text-gray-900">{batchCount}</strong> expense vouchers?
            </p>
          ) : (
            <p>
              Are you sure you want to delete{" "}
              <strong className="text-gray-900">"{expense?.title}"</strong> ({formatCurrency(expense?.amount ?? 0)})?
            </p>
          )}

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-amber-900 text-left space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
              <SyncOutlined className="text-amber-700" />
              <span>Automatic Fund Restoration</span>
            </div>
            <p className="text-[11px] text-amber-800">
              {isBatch
                ? "Any deleted expenses that were marked as 'Paid' will have their amounts immediately restored into the Program Fund balance."
                : isPaid
                ? `Since this expense was settled as Paid, deleting it will automatically restore ${formatCurrency(expense?.amount ?? 0)} back to the Program Fund balance.`
                : "This pending expense record will be permanently purged from transaction history."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 border-t border-gray-100 pt-4">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="h-10 px-5 rounded-xl font-medium border-gray-200 hover:border-gray-300"
          >
            Cancel
          </Button>

          <Button
            danger
            type="primary"
            loading={loading}
            icon={<DeleteOutlined />}
            onClick={onConfirm}
            className="h-10 px-5 rounded-xl bg-rose-600! hover:bg-rose-700! font-semibold border-0 shadow-sm"
          >
            {isBatch ? `Delete ${batchCount} Expenses` : "Delete Expense"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
