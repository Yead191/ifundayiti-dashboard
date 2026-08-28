import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Button, Segmented } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { TagOutlined } from "@ant-design/icons";
import type { ApiCoupon, CouponPayload, CouponStatus, CouponType } from "@/redux/features/coupons/coupons.types";
import { getCouponStatus, normalizeCouponType } from "../couponUtils";

const { RangePicker } = DatePicker;

const STATUS_OPTIONS: { label: string; value: CouponStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Expired", value: "expired" },
];

interface FormValues {
  coupon_code: string;
  name: string;
  type: CouponType;
  amount: number;
  max_use: number;
  dateRange: [Dayjs, Dayjs];
  status?: CouponStatus;
}

export function CouponFormModal({
  open,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  initial?: ApiCoupon | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: CouponPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue({
        coupon_code: initial.coupon_code,
        name: initial.name,
        type: normalizeCouponType(initial.type),
        amount: initial.amount,
        max_use: initial.max_use,
        dateRange: [dayjs(initial.start_date), dayjs(initial.end_date)],
        status: getCouponStatus(initial),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: "percentage",
        max_use: 100,
        dateRange: [dayjs().startOf("day"), dayjs().add(30, "day").endOf("day")],
      });
    }
  }, [open, initial, form]);

  const handleFinish = (values: FormValues) => {
    const [start, end] = values.dateRange;
    onSubmit({
      coupon_code: values.coupon_code.trim().toUpperCase(),
      name: values.name.trim(),
      type: values.type,
      amount: values.amount,
      max_use: values.max_use,
      start_date: start.startOf("day").toISOString(),
      end_date: end.endOf("day").toISOString(),
      ...(isEdit && values.status ? { status: values.status } : {}),
    });
  };

  const discountType = Form.useWatch("type", form) ?? "percentage";

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={640}
      centered
      destroyOnHidden
      title={
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-cloud-100">
          <TagOutlined className="text-violet-glow" />
          {isEdit ? "Edit coupon" : "New coupon"}
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
        {isEdit ? "Update the code, discount, usage limits, status, or active dates." : "Create a discount code customers can apply at checkout."}
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
          <Form.Item
            label={<span className="text-mist-400">Coupon code</span>}
            name="coupon_code"
            rules={[
              { required: true, message: "Enter a coupon code" },
              { min: 3, message: "At least 3 characters" },
            ]}
          >
            <Input placeholder="SUMMER26" className="uppercase" />
          </Form.Item>

          <Form.Item
            label={<span className="text-mist-400">Campaign name</span>}
            name="name"
            rules={[{ required: true, message: "Enter a campaign name" }]}
          >
            <Input placeholder="Summer Sale" />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="text-mist-400">Discount type</span>}
          name="type"
          rules={[{ required: true, message: "Select a discount type" }]}
        >
          <Segmented
            block
            options={[
              { label: "Percentage", value: "percentage" },
              { label: "Fixed amount", value: "fixed" },
            ]}
          />
        </Form.Item>

        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
          <Form.Item
            label={
              <span className="text-mist-400">
                {discountType === "fixed" ? "Discount amount ($)" : "Discount (%)"}
              </span>
            }
            name="amount"
            rules={[
              { required: true, message: "Enter the discount amount" },
              {
                type: "number",
                min: discountType === "percentage" ? 1 : 0.01,
                max: discountType === "percentage" ? 100 : undefined,
                message:
                  discountType === "percentage"
                    ? "Enter a value between 1 and 100"
                    : "Enter a positive amount",
              },
            ]}
          >
            <InputNumber className="w-full!" min={0} placeholder={discountType === "fixed" ? "25" : "50"} />
          </Form.Item>

          <Form.Item
            label={<span className="text-mist-400">Max uses</span>}
            name="max_use"
            rules={[
              { required: true, message: "Enter max uses" },
              { type: "number", min: 1, message: "At least 1 use" },
            ]}
          >
            <InputNumber className="w-full!" min={1} placeholder="100" />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="text-mist-400">Active period</span>}
          name="dateRange"
          rules={[{ required: true, message: "Select start and end dates" }]}
        >
          <RangePicker className="w-full!" showTime format="MMM D, YYYY h:mm A" />
        </Form.Item>

        {isEdit && (
          <Form.Item
            label={<span className="text-mist-400">Status</span>}
            name="status"
            rules={[{ required: true, message: "Select a status" }]}
          >
            <Segmented block options={STATUS_OPTIONS} />
          </Form.Item>
        )}

        <div className="flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Create coupon"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
