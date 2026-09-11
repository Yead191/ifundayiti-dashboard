import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Upload } from "antd";
import {
  FolderOutlined,
  FolderAddOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import type { IFolder } from "@/redux/features/gallery/gallery.types";
import { getImageUrl } from "@/lib/getImageUrl";

interface FolderModalProps {
  open: boolean;
  folder: IFolder | null; // If provided, edit mode; otherwise create mode
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}

export function FolderModal({
  open,
  folder,
  loading = false,
  onCancel,
  onSubmit,
}: FolderModalProps) {
  const [form] = Form.useForm<{ name: string }>();
  const [fileList, setFileList] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isEdit = Boolean(folder);

  useEffect(() => {
    if (open) {
      if (folder) {
        form.setFieldsValue({ name: folder.name });
        if (folder.image) {
          setPreviewUrl(getImageUrl(folder.image));
        } else {
          setPreviewUrl(null);
        }
      } else {
        form.resetFields();
        setPreviewUrl(null);
      }
      setFileList([]);
    }
  }, [open, folder, form]);

  const handleCustomUpload = ({ file, onSuccess }: any) => {
    const fileObj = file as File;
    setFileList([fileObj]);
    const url = URL.createObjectURL(fileObj);
    setPreviewUrl(url);
    if (onSuccess) onSuccess("ok");
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setFileList([]);
  };

  const handleFinish = (values: { name: string }) => {
    const formData = new FormData();
    formData.append("name", values.name.trim());

    if (fileList.length > 0) {
      formData.append("image", fileList[0]);
    }

    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnClose
      centered
      title={
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 font-display text-base font-bold text-cloud-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            {isEdit ? <EditOutlined /> : <FolderAddOutlined />}
          </div>
          <span>{isEdit ? "Edit Album Folder" : "Create New Gallery Folder"}</span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-3 space-y-4"
      >
        {/* Folder Name */}
        <Form.Item
          name="name"
          label={
            <span className="text-xs font-semibold text-mist-700">
              Folder / Album Name <span className="text-rose-500">*</span>
            </span>
          }
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

        {/* Cover Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-mist-700 mb-1.5">
            Folder Cover Image
          </label>

          {previewUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50">
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={previewUrl}
                  alt="Folder cover preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 bg-white p-3 shadow-2xs">
                <span className="text-xs text-cloud-100 font-medium truncate max-w-xs flex items-center gap-1.5">
                  <PictureOutlined className="text-emerald-700" />
                  {fileList[0]?.name || "Current album cover"}
                </span>
                <div className="flex items-center gap-2">
                  <Upload
                    customRequest={handleCustomUpload}
                    showUploadList={false}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                  >
                    <Button
                      size="small"
                      icon={<UploadOutlined />}
                      className="rounded-lg text-xs font-medium text-cloud-100"
                    >
                      Change
                    </Button>
                  </Upload>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveImage}
                    className="rounded-lg text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Upload.Dragger
              customRequest={handleCustomUpload}
              showUploadList={false}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="rounded-2xl border-dashed border-gray-200 bg-gray-50/50 p-5 transition-colors hover:border-[#0B3D2E] hover:bg-emerald-50/20"
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center py-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B3D2E]/10 text-xl text-[#0B3D2E]">
                  <UploadOutlined />
                </div>
                <div>
                  <p className="text-xs font-semibold text-cloud-100">
                    Click or drag cover image to this area
                  </p>
                  <p className="mt-0.5 text-[11px] text-mist-500">
                    Supports JPG, PNG, WEBP up to 10MB. 16:9 landscape recommended.
                  </p>
                </div>
              </div>
            </Upload.Dragger>
          )}
        </div>

        <p className="text-xs text-mist-500 leading-relaxed pt-1">
          {isEdit
            ? "Updating this folder will synchronize its name and cover image across the dashboard and public storefront."
            : "Folders organize community photos, field projects, and grant programs into tidy public albums."}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button onClick={onCancel} disabled={loading} className="rounded-xl h-9">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="rounded-xl h-9 px-5 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold shadow-sm border-0"
          >
            {isEdit ? "Save Changes" : "Create Folder"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
