import { useEffect } from "react";
import { Modal, Form, InputNumber, DatePicker, Input, Button } from "antd";
import { TrophyFilled } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { winnerAwardSchema, zodToFormErrors } from "../schemas";
import type { Application, WinnerAward } from "../types";

interface WinnerFormValues {
  awardAmount: number;
  transferDate: Dayjs;
  adminNotes?: string;
}

/** Confirms a finalist as the period winner with award + transfer details. */
export function SelectWinnerModal({
  application,
  maxAmount,
  open,
  onCancel,
  onConfirm,
}: {
  application: Application | null;
  maxAmount: number;
  open: boolean;
  onCancel: () => void;
  onConfirm: (award: WinnerAward) => void;
}) {
  const [form] = Form.useForm<WinnerFormValues>();

  useEffect(() => {
    if (open && application) {
      form.setFieldsValue({
        awardAmount: application.grant.requestedAmount,
        transferDate: dayjs().add(7, "day"),
        adminNotes: "",
      });
    }
  }, [open, application, form]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const parsed = winnerAwardSchema(maxAmount).safeParse({
      awardAmount: values.awardAmount,
      transferDate: values.transferDate ? values.transferDate.toISOString() : "",
      adminNotes: values.adminNotes ?? "",
    });

    if (!parsed.success) {
      form.setFields(zodToFormErrors(parsed.error) as Parameters<typeof form.setFields>[0]);
      return;
    }

    onConfirm({
      awardAmount: parsed.data.awardAmount,
      transferDate: parsed.data.transferDate,
      adminNotes: parsed.data.adminNotes ?? "",
    });
  };

  if (!application) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      destroyOnHidden
      title={
        <span className="flex items-center gap-2">
          <span className="text-[#f5b544]">
            <TrophyFilled />
          </span>
          Select winner
        </span>
      }
    >
      <div className="mb-4 rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
        <div className="text-sm font-semibold text-cloud-100">{application.personal.name}</div>
        <div className="text-xs text-mist-400">{application.grant.projectName}</div>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          label="Award amount"
          name="awardAmount"
          tooltip={`The winner is funded manually outside the platform. Max $${maxAmount}.`}
        >
          <InputNumber
            className="!w-full"
            min={1}
            max={maxAmount}
            prefix="$"
            placeholder="Enter the awarded amount"
          />
        </Form.Item>

        <Form.Item label="Transfer date" name="transferDate">
          <DatePicker className="!w-full" format="MMM D, YYYY" />
        </Form.Item>

        <Form.Item label="Admin notes" name="adminNotes">
          <Input.TextArea rows={3} placeholder="Optional internal notes about the transfer." />
        </Form.Item>
      </Form>

      <div className="mt-1 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          icon={<TrophyFilled />}
          className="!border-0 !bg-gradient-to-r !from-[#f5b544] !to-[#c9800f] !text-navy-900 !shadow-[0_8px_20px_-8px_rgba(245,181,68,0.6)]"
          onClick={handleSubmit}
        >
          Confirm winner
        </Button>
      </div>
    </Modal>
  );
}
