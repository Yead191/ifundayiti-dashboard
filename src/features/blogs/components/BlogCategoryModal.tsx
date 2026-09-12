import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { FolderAddOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import {
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
} from "@/redux/features/blogs/blogsApi";
import type { IBlogCategory } from "@/redux/features/blogs/blogs.types";

interface BlogCategoryModalProps {
  open: boolean;
  category?: IBlogCategory | null;
  onCancel: () => void;
  onSuccess?: (createdCategory?: IBlogCategory) => void;
}

export function BlogCategoryModal({
  open,
  category,
  onCancel,
  onSuccess,
}: BlogCategoryModalProps) {
  const [form] = Form.useForm();
  const [createCategory, { isLoading: isCreating }] =
    useCreateBlogCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateBlogCategoryMutation();

  const isEditing = Boolean(category);
  const loading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue({
          name: category.name,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, category, form]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      if (isEditing && category) {
        await updateCategory({
          id: category._id,
          name: values.name.trim(),
        }).unwrap();
        toast.success("Blog category updated successfully");
        onCancel();
        onSuccess?.();
      } else {
        const res = await createCategory({
          name: values.name.trim(),
        }).unwrap();
        toast.success("Blog category created successfully");
        form.resetFields();
        onCancel();
        onSuccess?.(res.data);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save blog category");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <div className="flex items-center gap-2.5 pb-2 text-cloud-100 font-display">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B3D2E]">
            <FolderAddOutlined className="text-base" />
          </div>
          <div>
            <h3 className="text-base font-bold">
              {isEditing ? "Edit Blog Category" : "New Blog Category"}
            </h3>
            <p className="text-xs text-mist-500 font-normal">
              {isEditing
                ? "Rename category and update references"
                : "Add a category to organize articles and public story filters"}
            </p>
          </div>
        </div>
      }
      width={460}
      destroyOnClose
      centered
      className="rounded-3xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-2 space-y-4"
      >
        <Form.Item
          name="name"
          label={
            <span className="text-xs font-semibold text-gray-700">
              Category Name <span className="text-rose-500">*</span>
            </span>
          }
          rules={[
            { required: true, message: "Category name is required" },
            { min: 2, message: "Must be at least 2 characters" },
          ]}
        >
          <Input
            placeholder="e.g. Healthcare, Community Impact, Education"
            className="h-10 rounded-xl"
            autoFocus
          />
        </Form.Item>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl h-10 px-4 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold h-10 px-5 border-0 shadow-sm"
          >
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
