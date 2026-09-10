import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button } from "antd";
import { PlusOutlined, DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import {
  useCreateFaqMutation,
  useUpdateFaqMutation,
} from "@/redux/features/faq/faqApi";
import type { IFAQ } from "@/redux/features/faq/faq.types";
import { getErrorMessage } from "../faqHelpers";

interface FaqCategoryModalProps {
  open: boolean;
  category?: IFAQ | null;
  onClose: () => void;
}

export function FaqCategoryModal({
  open,
  category,
  onClose,
}: FaqCategoryModalProps) {
  const [form] = Form.useForm();
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();

  const isEdit = Boolean(category);
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue({
          title: category.title,
          order: category.order ?? 0,
          isActive: category.isActive ?? true,
          items:
            category.items && category.items.length > 0 ? category.items : [],
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          order: 0,
          isActive: true,
          items: [{ question: "", answer: "" }],
        });
      }
    }
  }, [open, category, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Clean up empty questions if any
      const cleanedItems = (values.items || [])
        .map((item: any) => ({
          question: item?.question?.trim() || "",
          answer: item?.answer?.trim() || "",
        }))
        .filter((item: any) => item.question && item.answer);

      const payload = {
        title: values.title.trim(),
        order: values.order ?? 0,
        isActive: values.isActive ?? true,
        items: cleanedItems,
      };

      if (isEdit && category?._id) {
        await updateFaq({
          id: category._id,
          body: payload,
        }).unwrap();
        toast.success("FAQ category updated successfully");
      } else {
        await createFaq(payload).unwrap();
        toast.success("FAQ category created successfully");
      }

      onClose();
    } catch (error: any) {
      if (error?.errorFields) return; // Form validation errors
      toast.error(
        isEdit ? "Failed to update category" : "Failed to create category",
        {
          description: getErrorMessage(error),
        },
      );
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
            <h3 className="text-lg font-bold text-cloud-100 font-display">
              {isEdit ? "Edit FAQ Category" : "Create New FAQ Category"}
            </h3>
            <p className="text-xs text-mist-600">
              {isEdit
                ? "Update category title, display order, status, and Q&A entries."
                : "Create a new categorized FAQ section to display on the storefront."}
            </p>
          </div>
        </div>
      }
      onCancel={onClose}
      width={720}
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
            {isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-4 max-h-[68vh] overflow-y-auto pr-1"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          {/* Category Title */}
          <div className="sm:col-span-8">
            <Form.Item
              name="title"
              label={
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Category Title
                </span>
              }
              rules={[
                { required: true, message: "Please enter category title" },
                { min: 2, message: "Title must be at least 2 characters" },
              ]}
            >
              <Input
                placeholder="e.g., Application & Grants, General Inquiries"
                className="h-10 rounded-xl"
              />
            </Form.Item>
          </div>

          {/* Display Order */}
          <div className="sm:col-span-4">
            <Form.Item
              name="order"
              label={
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Display Order
                </span>
              }
              tooltip="Lower numbers appear first on the public website (e.g., 0, 1, 2...)"
            >
              <InputNumber
                min={0}
                className="w-full h-10 rounded-xl flex items-center"
              />
            </Form.Item>
          </div>
        </div>

        {/* Active Status Switch */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <div>
            <p className="text-sm font-bold text-cloud-100">
              Publish Category
            </p>
            <p className="text-xs text-mist-600">
              When enabled, this category and its questions are live and visible to the public.
            </p>
          </div>
          <Form.Item name="isActive" valuePropName="checked" noStyle>
            <Switch className="bg-emerald-600!" />
          </Form.Item>
        </div>

        {/* Dynamic Q&A Items List */}
        <div className="pt-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Questions & Answers
              </h4>
              <p className="text-xs text-mist-600">
                Add question and answer pairs belonging to this category.
              </p>
            </div>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-3.5">
                {fields.map(({ key, name, ...restField }, index) => (
                  <div
                    key={key}
                    className="relative rounded-2xl border border-gray-200/90 bg-gray-50/50 p-4 transition-all hover:border-[#0B3D2E]/30"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B3D2E]/10 px-2.5 py-0.5 text-xs font-bold text-[#0B3D2E] border border-[#0B3D2E]/20">
                        Q&A #{index + 1}
                      </span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                      >
                        Remove
                      </Button>
                    </div>

                    <Form.Item
                      {...restField}
                      name={[name, "question"]}
                      label={
                        <span className="text-xs font-semibold text-gray-700">
                          Question
                        </span>
                      }
                      rules={[
                        { required: true, message: "Question is required" },
                      ]}
                      className="mb-3"
                    >
                      <Input
                        placeholder="e.g., How do I submit an application for funding?"
                        className="rounded-xl h-10"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "answer"]}
                      label={
                        <span className="text-xs font-semibold text-gray-700">
                          Answer
                        </span>
                      }
                      rules={[
                        { required: true, message: "Answer is required" },
                      ]}
                      className="mb-0"
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Provide a clear, detailed response..."
                        className="rounded-xl text-sm"
                      />
                    </Form.Item>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({ question: "", answer: "" })}
                  block
                  icon={<PlusOutlined />}
                  className="h-11 rounded-2xl border-gray-300 text-gray-600 hover:border-[#0B3D2E] hover:text-[#0B3D2E] bg-white font-medium"
                >
                  Add Another Question
                </Button>
              </div>
            )}
          </Form.List>
        </div>
      </Form>
    </Modal>
  );
}
