import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import type { TeamMember } from "@/redux/features/team/team.types";

interface RejectVolunteerModalProps {
  open: boolean;
  member: TeamMember | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectVolunteerModal({
  open,
  member,
  loading = false,
  onCancel,
  onConfirm,
}: RejectVolunteerModalProps) {
  const [form] = Form.useForm<{ reason: string }>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values.reason.trim());
    } catch {
      // Form validation error handled by Antd Form
    }
  };

  if (!member) return null;

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={480}
      centered
      destroyOnHidden
      title={
        <span className="flex items-center gap-2 font-display text-base font-bold text-rose-600">
          <CloseCircleOutlined />
          Reject Volunteer Application
        </span>
      }
    >
      <div className="mb-4 mt-2 rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5">
        <div className="text-sm font-semibold text-cloud-100">
          Applicant: <span className="font-bold text-rose-700">{member.name}</span>
        </div>
        <div className="mt-0.5 text-xs text-mist-500">
          {member.email} • {member.location}
        </div>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="reason"
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
              Rejection Reason
            </span>
          }
          rules={[
            { required: true, message: "Please provide a reason for the applicant." },
            { min: 5, message: "Reason must be at least 5 characters." },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="e.g. Focus areas do not align with our current field auditing requirements. Thank you for your interest."
            className="rounded-xl border-navy-700/60"
          />
        </Form.Item>
      </Form>

      <div className="mt-5 flex justify-end gap-2.5 border-t border-navy-700/40 pt-4">
        <Button onClick={onCancel} disabled={loading} className="rounded-xl">
          Cancel
        </Button>
        <Button
          danger
          type="primary"
          loading={loading}
          icon={<CloseCircleOutlined />}
          onClick={handleSubmit}
          className="rounded-xl"
        >
          Reject Application
        </Button>
      </div>
    </Modal>
  );
}
