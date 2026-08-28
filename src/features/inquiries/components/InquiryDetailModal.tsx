import { useEffect } from "react";
import { Button, Form, Input, Modal, Select } from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatDate } from "@/lib/utils";
import {
  PROJECT_BUDGET_OPTIONS,
  type ApiInquiry,
  type InquiryStatus,
  type ProjectBudget,
  type UpdateInquiryPayload,
} from "@/redux/features/inquiries/inquiries.types";
import {
  budgetLabelMap,
  inquiryStatusLabelMap,
  inquiryStatusToneMap,
} from "../statusMaps";
import { InquiryStatusSelect } from "./InquiryStatusSelect";

interface FormValues {
  phone?: string;
  company?: string;
  projectDescription: string;
  budget: ProjectBudget;
  status: InquiryStatus;
  note?: string;
}

export function InquiryDetailModal({
  inquiry,
  open,
  loading,
  onClose,
  onSave,
  onDelete,
}: {
  inquiry: ApiInquiry | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSave: (id: string, body: UpdateInquiryPayload) => void;
  onDelete: (inquiry: ApiInquiry) => void;
}) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (!open || !inquiry) return;
    form.setFieldsValue({
      phone: inquiry.phone ?? "",
      company: inquiry.company ?? "",
      projectDescription: inquiry.projectDescription,
      budget: inquiry.budget,
      status: inquiry.status,
      note: inquiry.note ?? "",
    });
  }, [open, inquiry, form]);

  if (!inquiry) return null;

  const handleFinish = (values: FormValues) => {
    onSave(inquiry._id, {
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
      onCancel={loading ? undefined : onClose}
      footer={null}
      width={760}
      centered
      destroyOnHidden
      closeIcon={<CloseOutlined className="text-mist-400" />}
      styles={{
        body: { padding: 0 },
        container: {
          overflow: "hidden",
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
        },
      }}
    >
      <div className="relative overflow-hidden px-6 pb-5 pt-7 md:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-violet-600/25 blur-[80px]" />
          <div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-info/10 blur-[70px]" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone={inquiryStatusToneMap[inquiry.status]}>
                {inquiryStatusLabelMap[inquiry.status]}
              </StatusTag>
              <StatusTag tone="gold" icon={<DollarOutlined />}>
                {budgetLabelMap[inquiry.budget]}
              </StatusTag>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-cloud-100">
              {inquiry.name}
            </h2>
            <p className="mt-1 text-sm text-mist-400">
              {inquiry.company || "No company listed"}
              {inquiry.createdAt ? ` · Submitted ${formatDate(inquiry.createdAt)}` : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-info/25 bg-info/10 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-mist-500">Contact</div>
            <a
              href={`mailto:${inquiry.email}`}
              className="mt-1 flex items-center gap-1.5 text-sm font-medium text-cloud-100 transition hover:text-violet-glow"
            >
              <MailOutlined className="text-info" />
              {inquiry.email}
            </a>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleFinish}
        className="border-t border-navy-700/60 px-6 py-5 md:px-8"
      >
        <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-mist-600">
          <EditOutlined className="text-violet-glow/80" />
          Editable fields
        </div>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="phone"
            label={<span className="text-mist-300">Phone</span>}
          >
            <Input prefix={<PhoneOutlined className="text-mist-600" />} placeholder="Contact number" />
          </Form.Item>
          <Form.Item
            name="company"
            label={<span className="text-mist-300">Company</span>}
          >
            <Input prefix={<BankOutlined className="text-mist-600" />} placeholder="Company name" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="budget"
            label={<span className="text-mist-300">Project budget</span>}
            rules={[{ required: true, message: "Select a budget range" }]}
          >
            <Select
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
          />
        </Form.Item>

        <Form.Item
          name="note"
          label={<span className="text-mist-300">Internal note</span>}
        >
          <Input.TextArea
            rows={3}
            className="!resize-none"
            placeholder="Private notes for your team — not shown on the website"
          />
        </Form.Item>

        {inquiry.updatedAt && (
          <p className="mb-4 flex items-center gap-1.5 text-xs text-mist-600">
            <CalendarOutlined />
            Last updated {formatDate(inquiry.updatedAt)}
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-navy-700/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(inquiry)} disabled={loading}>
            Delete inquiry
          </Button>
          <div className="flex gap-2 sm:justify-end">
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<FileTextOutlined />}
              className="btn-gradient border-0!"
            >
              Save changes
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
