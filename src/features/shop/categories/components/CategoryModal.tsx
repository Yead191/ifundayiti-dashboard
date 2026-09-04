import { useEffect } from "react";
import { Form, Input, Modal, Select } from "antd";
import { AppstoreAddOutlined, EditOutlined } from "@ant-design/icons";
import type {
  ProductCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/redux/features/shop/product.types";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateCategoryPayload | UpdateCategoryPayload) => Promise<void>;
  editingCategory: ProductCategory | null;
  isLoading: boolean;
}

export function CategoryModal({
  open,
  onClose,
  onSubmit,
  editingCategory,
  isLoading,
}: CategoryModalProps) {
  const [form] = Form.useForm();
  const isEditing = Boolean(editingCategory);

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
          status: editingCategory.status,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: "active",
        });
      }
    }
  }, [open, editingCategory, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch {
      // Form validation error
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={isLoading}
      okText={isEditing ? "Save Changes" : "Create Category"}
      cancelText="Cancel"
      width={480}
      destroyOnClose
      okButtonProps={{
        className: "bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm",
      }}
      title={
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 text-cloud-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            {isEditing ? <EditOutlined /> : <AppstoreAddOutlined />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-cloud-100">
              {isEditing ? "Edit Product Category" : "Add Product Category"}
            </h3>
            <p className="text-xs text-mist-500">
              {isEditing
                ? "Update category details and availability."
                : "Create a new clothing or merchandise category."}
            </p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        requiredMark="optional"
      >
        <Form.Item
          name="name"
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Category Name
            </span>
          }
          rules={[
            { required: true, message: "Please enter category name" },
            { min: 2, message: "Category name must be at least 2 characters" },
          ]}
        >
          <Input
            placeholder="e.g. Hoodies & Sweatshirts, Graphic Tees, Caps & Headwear"
            className="h-10 rounded-xl text-cloud-100"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Status
            </span>
          }
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select
            className="h-10 rounded-xl"
            options={[
              { label: "Active (Visible in Store)", value: "active" },
              { label: "Inactive (Hidden)", value: "inactive" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
