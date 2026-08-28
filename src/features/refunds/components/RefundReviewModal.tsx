import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Segmented, Button } from "antd";
import { CheckOutlined, StopOutlined } from "@ant-design/icons";
import type { ApiRefund, RefundType, ReviewRefundPayload } from "@/redux/features/refunds/refunds.types";
import { formatCurrency } from "@/lib/utils";
import { normalizeRefundType, refundTypeLabelMap } from "../statusMaps";

interface FormValues {
  refundType: RefundType;
  refundAmount: number;
  adminNote: string;
}

export function RefundReviewModal({
  refund,
  action,
  open,
  loading,
  onCancel,
  onSubmit,
}: {
  refund: ApiRefund | null;
  action: "refunded" | "rejected" | null;
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: ReviewRefundPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const isReject = action === "rejected";
  const orderTotal = refund?.order?.price_breakdown?.total_price ?? 0;
  const refundType = Form.useWatch("refundType", form) ?? "full";

  useEffect(() => {
    if (!open || !refund) return;
    form.setFieldsValue({
      refundType: normalizeRefundType(refund.refundType),
      refundAmount: refund.refundAmount || orderTotal,
      adminNote: refund.adminNote ?? "",
    });
  }, [open, refund, form, orderTotal]);

  const handleFinish = (values: FormValues) => {
    if (!action) return;
    onSubmit({
      status: action,
      refundType: values.refundType,
      refundAmount:
        action === "rejected"
          ? 0
          : values.refundType === "partial"
            ? values.refundAmount
            : orderTotal,
      adminNote: values.adminNote?.trim() ?? "",
    });
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={520}
      centered
      destroyOnHidden
      title={
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-cloud-100">
          {isReject ? (
            <StopOutlined className="text-danger" />
          ) : (
            <CheckOutlined className="text-success" />
          )}
          {isReject ? "Reject refund" : "Approve refund"}
        </span>
      }
      styles={{
        container: {
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
        },
      }}
    >
      <p className="mb-5 text-sm text-mist-400">
        {isReject
          ? "This request will be declined. Add a note so the customer understands why."
          : `Issue a refund against ${refund?.order?.order_id ?? "this order"}. Order total is ${formatCurrency(orderTotal)}.`}
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        {!isReject && (
          <>
            <Form.Item
              name="refundType"
              label={<span className="text-mist-400">Refund type</span>}
              rules={[{ required: true, message: "Select a refund type" }]}
            >
              <Segmented
                block
                options={[
                  { label: refundTypeLabelMap.full, value: "full" },
                  { label: refundTypeLabelMap.partial, value: "partial" },
                ]}
              />
            </Form.Item>

            {refundType === "partial" && (
              <Form.Item
                name="refundAmount"
                label={<span className="text-mist-400">Refund amount ($)</span>}
                rules={[
                  { required: true, message: "Enter a refund amount" },
                  {
                    type: "number",
                    min: 0.01,
                    max: orderTotal || undefined,
                    message: `Enter an amount between $0.01 and ${formatCurrency(orderTotal)}`,
                  },
                ]}
              >
                <InputNumber className="w-full!" min={0.01} max={orderTotal || undefined} placeholder="50" />
              </Form.Item>
            )}
          </>
        )}

        {isReject && (
          <Form.Item name="refundType" hidden>
            <Input />
          </Form.Item>
        )}

        <Form.Item
          name="adminNote"
          label={<span className="text-mist-400">Admin note</span>}
          rules={
            isReject
              ? [{ required: true, message: "Add a note explaining the rejection" }]
              : []
          }
        >
          <Input.TextArea
            rows={4}
            className="resize-none!"
            placeholder={
              isReject
                ? "Explain why this refund is being declined…"
                : "Optional internal note for this refund…"
            }
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            danger={isReject}
            className={isReject ? "" : "btn-gradient border-0!"}
          >
            {isReject ? "Reject request" : "Approve refund"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
