import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { useUpdateFaqMutation } from "@/redux/features/faq/faqApi";
import type { IFAQ } from "@/redux/features/faq/faq.types";
import { getErrorMessage } from "../faqHelpers";

interface FaqItemModalProps {
  open: boolean;
  category: IFAQ | null;
  itemIndex?: number | null;
  onClose: () => void;
}

export function FaqItemModal({
  open,
  category,
  itemIndex,
  onClose,
}: FaqItemModalProps) {
  const [form] = Form.useForm();
  const [updateFaq, { isLoading }] = useUpdateFaqMutation();

  const isEdit = typeof itemIndex === "number" && itemIndex >= 0;

  useEffect(() => {
    if (open && category) {
      if (isEdit && category.items?.[itemIndex]) {
        const item = category.items[itemIndex];
        form.setFieldsValue({
          question: item.question,
          answer: item.answer,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, category, itemIndex, isEdit, form]);

  const handleSubmit = async () => {
    if (!category) return;
    try {
      const values = await form.validateFields();
      const currentItems = [...(category.items || [])];

      const newItem = {
        question: values.question.trim(),
        answer: values.answer.trim(),
      };

      if (isEdit) {
        currentItems[itemIndex] = newItem;
      } else {
        currentItems.push(newItem);
      }

      await updateFaq({
        id: category._id,
        body: {
          items: currentItems,
        },
      }).unwrap();

      toast.success(
        isEdit
          ? "Question updated successfully"
          : "Question added to " + category.title,
      );
      onClose();
    } catch (error: any) {
      if (error?.errorFields) return;
      toast.error(isEdit ? "Failed to update question" : "Failed to add question", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <Modal
      open={open}
      title={
        <div className="border-b border-gray-100 pb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B3D2E]/10 text-[#0B3D2E] text-lg">
            <QuestionCircleOutlined />
          </div>
          <div>
            <h3 className="text-base font-bold text-cloud-100 font-display">
              {isEdit ? "Edit Question" : "Add Question to " + (category?.title || "Category")}
            </h3>
            <p className="mt-0.5 text-xs text-mist-600">
              {isEdit
                ? "Update the question title and answer text."
                : "Append a new question and answer to this category."}
            </p>
          </div>
        </div>
      }
      onCancel={onClose}
      destroyOnClose
      footer={
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-5 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            className="rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold px-6 shadow-sm border-0 h-10"
          >
            {isEdit ? "Save Changes" : "Add Question"}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <Form.Item
          name="question"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Question <span className="text-rose-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter the question" }]}
        >
          <Input
            placeholder="e.g., How do I submit an application for funding?"
            className="h-10 rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="answer"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Answer <span className="text-rose-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter the answer" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Provide a clear, helpful response..."
            className="rounded-xl text-sm"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
