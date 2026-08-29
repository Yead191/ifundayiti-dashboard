import { useEffect } from "react";
import { Modal, Form, InputNumber, Input, Button } from "antd";
import { EditOutlined, TrophyFilled } from "@ant-design/icons";
import { z } from "zod";
import { zodToFormErrors } from "@/features/core/schemas";
import type { APIApplication } from "@/redux/features/applications/applicationsApi";

interface WinnerStoryFormValues {
  awardedAmount?: number;
  successStory: string;
  quote?: string;
}

const customWinnerStorySchema = (maxAmount: number) =>
  z.object({
    awardedAmount: z
      .number({ error: "Awarded amount must be a valid number" })
      .positive("Must be greater than 0")
      .max(maxAmount, `Cannot exceed maximum period grant of $${maxAmount}`)
      .optional(),
    successStory: z
      .string()
      .trim()
      .min(10, "Please provide at least 10 characters for the success story"),
    quote: z.string().trim().optional().or(z.literal("")),
  });

/** Edit the public success story, quote, and awarded amount shown on the Winners page. */
export function WinnerStoryModal({
  application,
  maxAmount = 1000,
  open,
  onCancel,
  onConfirm,
}: {
  application: APIApplication | null;
  maxAmount?: number;
  open: boolean;
  onCancel: () => void;
  onConfirm: (values: {
    awardedAmount?: number;
    successStory: string;
    quote?: string;
  }) => void;
}) {
  const [form] = Form.useForm<WinnerStoryFormValues>();

  useEffect(() => {
    if (open && application) {
      form.setFieldsValue({
        awardedAmount:
          application.awardedAmount ||
          application.grant?.requestedAmount ||
          500,
        successStory: application.successStory ?? "",
        quote: application.quote ?? "",
      });
    }
  }, [open, application, form]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const parsed = customWinnerStorySchema(maxAmount).safeParse({
      awardedAmount: values.awardedAmount,
      successStory: values.successStory,
      quote: values.quote ?? "",
    });

    if (!parsed.success) {
      form.setFields(
        zodToFormErrors(parsed.error) as Parameters<typeof form.setFields>[0],
      );
      return;
    }

    onConfirm({
      awardedAmount: parsed.data.awardedAmount,
      successStory: parsed.data.successStory,
      quote: parsed.data.quote || undefined,
    });
  };

  if (!application) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      title={
        <span className="flex items-center gap-2 font-display text-base font-bold text-violet-600">
          <span className="text-[#f5b544]">
            <TrophyFilled />
          </span>
          Update Winner Information
        </span>
      }
      destroyOnHidden
    >
      <div className="mb-4 mt-2 rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
        <div className="text-sm font-semibold text-cloud-100">
          {application.personal?.name}
        </div>
        <div className="text-xs text-mist-500">
          {application.grant?.projectName}
        </div>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          label="Awarded Amount"
          name="awardedAmount"
          tooltip={`Capped by the cycle's maximum grant amount: $${maxAmount}.`}
        >
          <InputNumber
            className="w-full!"
            min={1}
            max={maxAmount}
            prefix="$"
            placeholder="Enter the awarded amount"
          />
        </Form.Item>

        <Form.Item label="Success Story" name="successStory" required>
          <Input.TextArea
            rows={4}
            placeholder="Explain why this project was selected and what impact it is expected to achieve."
          />
        </Form.Item>

        <Form.Item
          label="Featured Quote"
          name="quote"
          tooltip="An inspiring quote to show on the public winners board."
        >
          <Input.TextArea
            rows={2}
            placeholder="e.g. 'A small grant does not rewrite a whole economy. It can rewrite one week of work...'"
          />
        </Form.Item>
      </Form>

      <div className="mt-5 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          className="btn-linear border-0!"
          icon={<EditOutlined />}
          onClick={handleSubmit}
        >
          Save Winner Info
        </Button>
      </div>
    </Modal>
  );
}
