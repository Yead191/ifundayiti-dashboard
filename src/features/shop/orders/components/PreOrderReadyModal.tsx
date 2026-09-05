import { Modal, Alert, Button } from "antd";
import { CheckCircleOutlined, ThunderboltOutlined } from "@ant-design/icons";
import type { IOrderItem } from "@/redux/features/orders/orders.types";

interface PreOrderReadyModalProps {
  open: boolean;
  orderId?: string;
  itemIndex?: number;
  item?: IOrderItem | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PreOrderReadyModal({
  open,
  item,
  loading = false,
  onCancel,
  onConfirm,
}: PreOrderReadyModalProps) {
  if (!item) return null;

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={520}
      centered
      destroyOnHidden
      title={
        <div className="flex items-center gap-2 font-display text-base font-bold text-[#0B3D2E]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
            <ThunderboltOutlined />
          </span>
          <span>Mark Pre-Order Item as Ready</span>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        <p className="text-xs text-mist-600">
          You are about to allocate ready batch inventory to this confirmed pre-order item:
        </p>

        {/* Item Summary Card */}
        <div className="rounded-xl border border-navy-700/60 bg-navy-950/20 p-3.5">
          <div className="font-display text-sm font-bold text-cloud-100">
            {item.name}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-mist-600">
            <span className="rounded-md bg-white/80 px-2 py-0.5 font-medium border border-navy-700/40">
              Size: {item.size}
            </span>
            <span className="rounded-md bg-white/80 px-2 py-0.5 font-medium border border-navy-700/40">
              Color: {item.color}
            </span>
            <span className="rounded-md bg-white/80 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-500/30">
              Qty: {item.quantity}
            </span>
          </div>
        </div>

        {/* FIFO Fairness & Inventory Alert */}
        <Alert
          type="info"
          showIcon
          message="Automated FIFO Inventory Allocation"
          description="The system will verify FIFO fairness (ensuring earlier pre-orders for this variant were served first), atomically decrement variant stock by this quantity, and send an arrival notification email to the customer."
          className="rounded-xl text-xs"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-navy-700/40">
          <Button onClick={onCancel} disabled={loading} className="rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            loading={loading}
            icon={<CheckCircleOutlined />}
            onClick={onConfirm}
            className="btn-linear rounded-xl border-0 font-semibold"
          >
            Confirm & Allocate Stock
          </Button>
        </div>
      </div>
    </Modal>
  );
}
