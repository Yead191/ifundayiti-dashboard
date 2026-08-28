import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, Select, Segmented } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import type {
  ApiMembership,
  MembershipFormPayload,
  MembershipRecurring,
  MembershipType,
} from "@/redux/features/membership/membership.types";

interface FormValues {
  name: string;
  tagline: string;
  price: number;
  recurring: MembershipRecurring;
  interval_count: number;
  featured: boolean;
  highlight: string;
  features: string[];
  has_trial: boolean;
  trial_period_days: number;
  is_auto_renew: boolean;
}

export function MembershipFormModal({
  open,
  type,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  type: MembershipType;
  initial?: ApiMembership | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: MembershipFormPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue({
        name: initial.name,
        tagline: initial.tagline,
        price: initial.price,
        recurring: initial.recurring,
        interval_count: initial.interval ?? 1,
        featured: initial.featured,
        highlight: initial.highlight ?? "",
        features: initial.features?.length ? initial.features : [""],
        has_trial: !!initial.has_trial,
        trial_period_days: initial.trial_period_days ?? 0,
        is_auto_renew: initial.is_auto_renew !== false,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        recurring: "month",
        interval_count: 1,
        featured: false,
        highlight: "",
        features: [""],
        has_trial: false,
        trial_period_days: 0,
        is_auto_renew: true,
      });
    }
  }, [open, initial, form]);

  const hasTrial = Form.useWatch("has_trial", form);

  const handleFinish = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      tagline: values.tagline.trim(),
      price: values.price,
      recurring: values.recurring,
      interval_count: values.interval_count ?? 1,
      featured: values.featured,
      highlight: values.highlight?.trim() ?? "",
      type,
      features: values.features.map((f) => f.trim()).filter(Boolean),
      has_trial: !!values.has_trial,
      trial_period_days: values.has_trial ? values.trial_period_days ?? 0 : 0,
      is_auto_renew: values.is_auto_renew !== false,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={isEdit ? `Edit ${type} plan` : `New ${type} plan`}
      width={600}
      footer={null}
      destroyOnHidden
      maskClosable={!loading}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish} className="mt-2">
        <Form.Item label="Plan name" name="name" rules={[{ required: true, message: "Enter a plan name" }]}>
          <Input placeholder="ELITE" />
        </Form.Item>

        <Form.Item label="Tagline" name="tagline" rules={[{ required: true, message: "Add a tagline" }]}>
          <Input placeholder="For scaling business that want it all." />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Form.Item label="Price ($)" name="price" rules={[{ required: true, message: "Enter a price" }]}>
            <InputNumber min={0} className="w-full!" prefix="$" placeholder="99" />
          </Form.Item>
          <Form.Item label="Billing" name="recurring" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Weekly", value: "week" },
                { label: "Monthly", value: "month" },
                { label: "Yearly", value: "year" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Interval" name="interval_count" rules={[{ required: true, message: "Enter interval" }]}>
            <InputNumber min={1} className="w-full!" placeholder="1" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Form.Item label="Highlight badge (optional)" name="highlight">
            <Input placeholder="Most Popular" />
          </Form.Item>
          <Form.Item label="Featured" name="featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div className="mb-4 rounded-xl border border-navy-700/60 bg-navy-800/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-cloud-100">Auto renew</div>
              <p className="mt-0.5 text-xs text-mist-500">
                Automatically renew subscriptions when the billing period ends.
              </p>
            </div>
            <Form.Item name="is_auto_renew" valuePropName="checked" className="mb-0!">
              <Switch />
            </Form.Item>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-navy-700/60 bg-navy-800/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-cloud-100">Free trial</div>
              <p className="mt-0.5 text-xs text-mist-500">
                Let new subscribers try this plan before billing starts.
              </p>
            </div>
            <Form.Item name="has_trial" valuePropName="checked" className="mb-0!">
              <Switch
                onChange={(checked) => {
                  if (!checked) form.setFieldValue("trial_period_days", 0);
                }}
              />
            </Form.Item>
          </div>
          {hasTrial && (
            <Form.Item
              className="mb-0! mt-4!"
              label="Trial period (days)"
              name="trial_period_days"
              rules={[
                { required: true, message: "Enter trial days" },
                { type: "number", min: 1, message: "At least 1 day" },
              ]}
            >
              <InputNumber min={1} max={365} className="w-full!" placeholder="14" />
            </Form.Item>
          )}
        </div>

        <Form.List name="features">
          {(fields, { add, remove }) => (
            <div>
              <div className="mb-2 text-sm font-medium text-cloud-100">Included features</div>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <Form.Item
                      {...field}
                      className="mb-0! flex-1!"
                      rules={[{ required: true, message: "Feature can't be empty" }]}
                    >
                      <Input placeholder="Priority customer support" />
                    </Form.Item>
                    <button
                      type="button"
                      onClick={() => remove(field.name)}
                      className="text-mist-600 hover:text-danger"
                      aria-label="Remove feature"
                    >
                      <MinusCircleOutlined />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="dashed"
                onClick={() => add("")}
                icon={<PlusOutlined />}
                className="mt-2.5! border-navy-600! text-mist-400!"
                block
              >
                Add feature
              </Button>
            </div>
          )}
        </Form.List>

        <div className="mt-6 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Create plan"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

/** Compact billing toggle used on the catalog page. */
export function BillingSegmented({
  value,
  onChange,
}: {
  value: MembershipRecurring | "all";
  onChange: (value: MembershipRecurring | "all") => void;
}) {
  return (
    <Segmented
      value={value}
      onChange={(v) => onChange(v as MembershipRecurring | "all")}
      options={[
        { label: "All", value: "all" },
        { label: "Weekly", value: "week" },
        { label: "Monthly", value: "month" },
        { label: "Yearly", value: "year" },
      ]}
    />
  );
}
