import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { FolderOutlined, FolderAddOutlined, EditOutlined } from "@ant-design/icons";
import type { IFolder } from "@/redux/features/gallery/gallery.types";

interface FolderModalProps {
  open: boolean;
  folder: IFolder | null; // If provided, edit mode; otherwise create mode
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}

export function FolderModal({
  open,
  folder,
  loading = false,
  onCancel,
  onSubmit,
}: FolderModalProps) {
  const [form] = Form.useForm<{ name: string }>();
  const isEdit = Boolean(folder);

  useEffect(() => {
    if (open) {
      if (folder) {
        form.setFieldsValue({ name: folder.name });
      } else {
        form.resetFields();
      }
    }
  }, [open, folder, form]);

  const handleFinish = (values: { name: string }) => {
    onSubmit(values.name.trim());
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      destroyOnClose
      centered
      title={
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 font-display text-base font-bold text-cloud-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            {isEdit ? <EditOutlined /> : <FolderAddOutlined />}
          </div>
          <span>{isEdit ? "Rename Album Folder" : "Create New Gallery Folder"}</span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-3 space-y-4"
      >
        <Form.Item
          name="name"
          label={<span className="text-xs font-semibold text-mist-700">Folder / Album Name</span>}
          rules={[
            { required: true, message: "Please enter a folder name" },
            { min: 2, message: "Folder name must be at least 2 characters" },
          ]}
        >
          <Input
            prefix={<FolderOutlined className="text-mist-400" />}
            placeholder="e.g. Summer Grant Outreach 2026"
            className="rounded-xl h-10"
            autoFocus
          />
        </Form.Item>

        <p className="text-xs text-mist-500 leading-relaxed">
          {isEdit
            ? "Updating this folder name will update the display album for all assigned photos."
            : "Folders organize community photos, field projects, and grant programs into tidy public albums."}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <Button onClick={onCancel} disabled={loading} className="rounded-xl h-9">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="rounded-xl h-9 px-5 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm"
          >
            {isEdit ? "Save Changes" : "Create Folder"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
