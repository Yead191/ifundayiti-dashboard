import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Divider,
  Alert,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { periodStatusLabelMap } from "@/features/core/statusMaps";
import { MAX_GRANT_AMOUNT } from "@/features/core/types";
import type {
  CreatePeriodPayload,
  UpdatePeriodPayload,
  APIPeriod,
  TApplicationPeriodStatus,
} from "@/redux/features/periods/periodsApi";
import {
  CalendarOutlined,
  DollarOutlined,
  TagOutlined,
  FormOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

const STATUS_OPTIONS: TApplicationPeriodStatus[] = [
  "Upcoming",
  "Open",
  "Review",
  "WinnerSelection",
  "Closed",
];

const STATUS_COLORS: Record<TApplicationPeriodStatus, string> = {
  Upcoming: "#0284c7",
  Open: "#0d8a5f",
  Review: "#d97706",
  WinnerSelection: "#9d5cf5",
  Closed: "#6b7299",
};

interface PeriodFormValues {
  title: string;
  dateRange: [Dayjs, Dayjs];
  maximumGrantAmount: number;
  status?: TApplicationPeriodStatus;
}

interface PeriodFormModalProps {
  period: APIPeriod | null;
  open: boolean;
  onCancel: () => void;
  onSubmit: (
    payload: CreatePeriodPayload | UpdatePeriodPayload,
    id?: string,
  ) => Promise<void>;
  loading?: boolean;
}

export function PeriodFormModal({
  period,
  open,
  onCancel,
  onSubmit,
  loading = false,
}: PeriodFormModalProps) {
  const [form] = Form.useForm<PeriodFormValues>();
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!period;

  // Reset error and populate form when modal opens/closes
  useEffect(() => {
    setApiError(null);
    if (!open) return;
    if (period) {
      form.setFieldsValue({
        title: period.title,
        dateRange: [dayjs(period.startDate), dayjs(period.endDate)],
        maximumGrantAmount: period.maximumGrantAmount,
        status: period.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ maximumGrantAmount: MAX_GRANT_AMOUNT });
    }
  }, [open, period, form]);

  const handleSubmit = async () => {
    setApiError(null);
    try {
      const values = await form.validateFields();
      const [start, end] = values.dateRange ?? [];

      const basePayload: CreatePeriodPayload = {
        title: values.title,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        maximumGrantAmount: values.maximumGrantAmount,
      };

      if (isEditing) {
        const updatePayload: UpdatePeriodPayload = {
          ...basePayload,
          ...(values.status ? { status: values.status } : {}),
        };
        await onSubmit(updatePayload, period!._id);
      } else {
        await onSubmit(basePayload);
      }
    } catch (err: unknown) {
      // Only show API errors — AntD validation errors are handled by the form itself
      if (err && typeof err === "object" && "errorFields" in err) return;

      // Extract message from RTK Query SerializedError or API response shape
      const msg =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ??
        (err as { message?: string })?.message ??
        "Something went wrong. Please try again.";

      setApiError(msg);
    }
  };

  const handleCancel = () => {
    setApiError(null);
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
      destroyOnHidden
      styles={{
        body: { padding: 0, borderRadius: 16, overflow: "hidden" },
        header: { display: "none" },
        mask: { backdropFilter: "blur(4px)" },
      }}
    >
      {/* Modal Header */}
      <div className="border-b border-navy-700 bg-linear-to-r from-[#0B3D2E]/8 to-[#E6D5B8]/20 px-6 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3D2E]/10 text-[#0B3D2E]">
            <FormOutlined className="text-lg" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#0B3D2E]">
              {isEditing ? "Edit Grant Cycle" : "New Grant Cycle"}
            </h3>
            <p className="text-xs text-mist-400">
              {isEditing
                ? "Update the details of this application period."
                : "Configure a new application window for grant seekers."}
            </p>
          </div>
        </div>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="px-6 pt-4">
          <Alert
            type="error"
            showIcon
            icon={<WarningOutlined />}
            message={<span className="text-sm font-medium">Action failed</span>}
            description={
              <span className="text-xs leading-relaxed">{apiError}</span>
            }
            closable
            onClose={() => setApiError(null)}
            className="rounded-xl"
          />
        </div>
      )}

      {/* Form Body */}
      <div className="px-6 py-5">
        <Form form={form} layout="vertical" requiredMark={false}>
          {/* Title */}
          <Form.Item
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                Cycle Name
              </span>
            }
            name="title"
            rules={[{ required: true, message: "Please enter a cycle name" }]}
          >
            <Input
              prefix={<TagOutlined className="text-mist-400" />}
              placeholder="e.g. Summer 2027 Grant Cycle"
              size="large"
              className="rounded-xl"
            />
          </Form.Item>

          {/* Date Range */}
          <Form.Item
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                Application Window
              </span>
            }
            name="dateRange"
            rules={[{ required: true, message: "Please select a date range" }]}
          >
            <RangePicker
              className="w-full! rounded-xl"
              size="large"
              format="MMM D, YYYY"
              suffixIcon={<CalendarOutlined className="text-mist-400" />}
            />
          </Form.Item>

          <div
            className={`grid gap-4 ${isEditing ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {/* Max Grant */}
            <Form.Item
              label={
                <span className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                  Max Grant (USD)
                </span>
              }
              name="maximumGrantAmount"
              rules={[
                { required: true, message: "Required" },
                {
                  type: "number",
                  min: 1,
                  max: MAX_GRANT_AMOUNT,
                  message: `Must be between $1 and $${MAX_GRANT_AMOUNT.toLocaleString()}`,
                },
              ]}
            >
              <InputNumber<number>
                className="w-full! rounded-xl"
                size="large"
                min={1}
                max={MAX_GRANT_AMOUNT}
                prefix={<DollarOutlined className="text-mist-400" />}
                formatter={(v) =>
                  `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(v) => Number((v ?? "").replace(/[^0-9]/g, ""))}
              />
            </Form.Item>

            {/* Status — only shown when editing */}
            {isEditing && (
              <Form.Item
                label={
                  <span className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                    Status
                  </span>
                }
                name="status"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select size="large" className="rounded-xl">
                  {STATUS_OPTIONS.map((s) => (
                    <Select.Option key={s} value={s}>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full shrink-0"
                          style={{ background: STATUS_COLORS[s] }}
                        />
                        {periodStatusLabelMap[s]}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>
        </Form>
      </div>

      {/* Footer */}
      <Divider className="my-0" />
      <div className="flex items-center justify-end gap-3 px-6 py-4">
        <Button size="large" onClick={handleCancel} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={handleSubmit}
          className="btn-gradient border-0! rounded-xl min-w-30"
        >
          {isEditing ? "Save Changes" : "Create Cycle"}
        </Button>
      </div>
    </Modal>
  );
}
