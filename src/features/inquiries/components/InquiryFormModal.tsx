import { useEffect } from "react";
import { Button, Form, Input, Modal, Select } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  PROJECT_BUDGET_OPTIONS,
  type CreateInquiryPayload,
  type InquiryStatus,
  type ProjectBudget,
} from "@/redux/features/inquiries/inquiries.types";
import { budgetLabelMap } from "../statusMaps";
import { InquiryStatusSelect } from "./InquiryStatusSelect";

interface FormValues {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectDescription: string;
  budget: ProjectBudget;
  status: InquiryStatus;
  note?: string;
}

export function InquiryFormModal({
  open,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateInquiryPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({ status: "NEW" });
  }, [open, form]);

  const handleFinish = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      company: values.company?.trim() || undefined,
      projectDescription: values.projectDescription.trim(),
      budget: values.budget,
      status: values.status,
      note: values.note?.trim() || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={640}
      centered
      destroyOnHidden
      title={
        <span className="font-display text-lg font-semibold text-cloud-100">
          Log inquiry on behalf of client
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
        Manually add a project lead — useful for phone calls, referrals, or offline conversations
        you want to track in the pipeline.
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item
            name="name"
            label={<span className="text-mist-300">Full name</span>}
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input prefix={<UserOutlined className="text-mist-600" />} placeholder="Client name" />
          </Form.Item>
          <Form.Item
            name="email"
            label={<span className="text-mist-300">Email</span>}
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined className="text-mist-600" />} placeholder="client@company.com" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item name="phone" label={<span className="text-mist-300">Phone</span>}>
            <Input prefix={<PhoneOutlined className="text-mist-600" />} placeholder="Optional" />
          </Form.Item>
          <Form.Item name="company" label={<span className="text-mist-300">Company</span>}>
            <Input prefix={<BankOutlined className="text-mist-600" />} placeholder="Optional" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item
            name="budget"
            label={<span className="text-mist-300">Project budget</span>}
            rules={[{ required: true, message: "Select a budget range" }]}
          >
            <Select
              placeholder="Select range"
              options={PROJECT_BUDGET_OPTIONS.map((budget) => ({
                value: budget,
                label: budgetLabelMap[budget],
              }))}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label={<span className="text-mist-300">Status</span>}
            rules={[{ required: true, message: "Select a status" }]}
          >
            <InquiryStatusSelect size="middle" />
          </Form.Item>
        </div>

        <Form.Item
          name="projectDescription"
          label={<span className="text-mist-300">Project description</span>}
          rules={[
            { required: true, message: "Project description is required" },
            { min: 10, message: "Description should be at least 10 characters" },
          ]}
        >
          <Input.TextArea
            rows={4}
            className="!resize-none"
            placeholder="What the client is looking to build…"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item name="note" label={<span className="text-mist-300">Internal note</span>}>
          <Input.TextArea
            rows={3}
            className="!resize-none"
            placeholder="How you received this lead, follow-up context, etc."
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
            icon={<FileTextOutlined />}
            className="btn-gradient border-0!"
          >
            Create inquiry
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
