import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import type { ApiFaq, FaqAudience, FaqPayload } from "@/redux/features/faq/faq.types";

interface FormValues {
  question: string;
  answer: string;
}

export function FaqFormModal({
  open,
  audience,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  audience: FaqAudience;
  initial?: ApiFaq | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: FaqPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue({
        question: initial.question,
        answer: initial.answer,
      });
    } else {
      form.resetFields();
    }
  }, [open, initial, form]);

  const handleFinish = (values: FormValues) => {
    onSubmit({
      question: values.question.trim(),
      answer: values.answer.trim(),
      audience,
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
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-cloud-100">
          <QuestionCircleOutlined className="text-violet-glow" />
          {isEdit ? "Edit FAQ" : "New FAQ"}
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
        {audience === "USER"
          ? "Add a question members will see on the user membership page."
          : "Add a question vendors will see on the vendor membership page."}
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          name="question"
          label={<span className="text-mist-300">Question</span>}
          rules={[
            { required: true, message: "Question is required" },
            { min: 8, message: "Question should be at least 8 characters" },
          ]}
        >
          <Input placeholder="What does my membership unlock?" />
        </Form.Item>

        <Form.Item
          name="answer"
          label={<span className="text-mist-300">Answer</span>}
          rules={[
            { required: true, message: "Answer is required" },
            { min: 16, message: "Answer should be at least 16 characters" },
          ]}
        >
          <Input.TextArea
            rows={5}
            className="resize-none!"
            placeholder="Write a clear, helpful answer…"
            maxLength={1200}
            showCount
          />
        </Form.Item>

        <div className="flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Add FAQ"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
