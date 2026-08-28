import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { applicationPeriodSchema, zodToFormErrors } from "../schemas";
import { periodStatusLabelMap } from "../statusMaps";
import {
  MAX_GRANT_AMOUNT,
  PERIOD_STATUS_OPTIONS,
  type ApplicationPeriod,
  type ApplicationPeriodInput,
} from "../types";

const { RangePicker } = DatePicker;

interface PeriodFormValues {
  title: string;
  description?: string;
  dateRange: [Dayjs, Dayjs];
  maximumGrantAmount: number;
  status: ApplicationPeriod["status"];
}

export function PeriodFormModal({
  period,
  open,
  onCancel,
  onSubmit,
}: {
  period: ApplicationPeriod | null;
  open: boolean;
  onCancel: () => void;
  onSubmit: (input: ApplicationPeriodInput) => void;
}) {
  const [form] = Form.useForm<PeriodFormValues>();
  const isEditing = !!period;

  useEffect(() => {
    if (!open) return;
    if (period) {
      form.setFieldsValue({
        title: period.title,
        description: period.description,
        dateRange: [dayjs(period.startDate), dayjs(period.endDate)],
        maximumGrantAmount: period.maximumGrantAmount,
        status: period.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "Upcoming", maximumGrantAmount: MAX_GRANT_AMOUNT });
    }
  }, [open, period, form]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const [start, end] = values.dateRange ?? [];
    const parsed = applicationPeriodSchema.safeParse({
      title: values.title ?? "",
      description: values.description ?? "",
      startDate: start ? start.toISOString() : "",
      endDate: end ? end.toISOString() : "",
      maximumGrantAmount: values.maximumGrantAmount,
      status: values.status,
    });

    if (!parsed.success) {
      const fields = zodToFormErrors(parsed.error).map((f) =>
        // map startDate/endDate schema errors back onto the RangePicker field
        f.name[0] === "startDate" || f.name[0] === "endDate" ? { ...f, name: ["dateRange"] } : f
      );
      form.setFields(fields as Parameters<typeof form.setFields>[0]);
      return;
    }

    onSubmit({
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      maximumGrantAmount: parsed.data.maximumGrantAmount,
      status: parsed.data.status as ApplicationPeriod["status"],
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnHidden
      title={isEditing ? "Edit application period" : "New application period"}
    >
      <Form form={form} layout="vertical" requiredMark="optional" className="mt-2">
        <Form.Item label="Period name" name="title">
          <Input placeholder="e.g. Summer 2027 Grant Cycle" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={2} placeholder="Short summary of this grant cycle's focus." />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item label="Start & end date" name="dateRange" className="sm:col-span-2">
            <RangePicker className="!w-full" format="MMM D, YYYY" />
          </Form.Item>

          <Form.Item label="Maximum grant amount" name="maximumGrantAmount">
            <InputNumber className="!w-full" min={1} max={MAX_GRANT_AMOUNT} prefix="$" />
          </Form.Item>

          <Form.Item label="Status" name="status">
            <Select
              options={PERIOD_STATUS_OPTIONS.map((s) => ({ label: periodStatusLabelMap[s], value: s }))}
            />
          </Form.Item>
        </div>
      </Form>

      <div className="mt-1 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" className="btn-gradient !border-0" onClick={handleSubmit}>
          {isEditing ? "Save changes" : "Create period"}
        </Button>
      </div>
    </Modal>
  );
}
