import { useState } from "react";
import { Modal, Form, Input, Button, Upload, message } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
  InboxOutlined,
} from "@ant-design/icons";

interface UploadPhotosModalProps {
  open: boolean;
  folderId: string;
  folderName: string;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}

export function UploadPhotosModal({
  open,
  folderId,
  folderName,
  loading = false,
  onCancel,
  onSubmit,
}: UploadPhotosModalProps) {
  const [form] = Form.useForm();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleCustomUpload = ({ file, onSuccess }: any) => {
    const fileObj = file as File;

    if (selectedFiles.length >= 20) {
      message.warning("You can upload a maximum of 20 images in a single batch.");
      return;
    }

    setSelectedFiles((prev) => [...prev, fileObj]);
    const url = URL.createObjectURL(fileObj);
    setPreviewUrls((prev) => [...prev, url]);

    if (onSuccess) onSuccess("ok");
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    form.resetFields();
    onCancel();
  };

  const handleFinish = (values: { caption?: string }) => {
    if (selectedFiles.length === 0) {
      message.error("Please select at least one photo to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("folder", folderId);

    if (values.caption?.trim()) {
      formData.append("caption", values.caption.trim());
    }

    selectedFiles.forEach((file) => {
      formData.append("image", file);
    });

    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
      centered
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 font-display text-lg font-bold text-cloud-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B3D2E]/10 text-[#0B3D2E] text-xl">
            <UploadOutlined />
          </div>
          <div>
            <h3>Upload Photos to &quot;{folderName}&quot;</h3>
            <p className="text-xs font-normal text-mist-500">
              Select or drag-and-drop up to 20 images at once to add to this album.
            </p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-3 space-y-4 max-h-[75vh] overflow-y-auto pr-1"
      >
        {/* Upload Dragger Zone */}
        <div>
          <Upload.Dragger
            multiple
            customRequest={handleCustomUpload}
            showUploadList={false}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="rounded-2xl border-dashed border-gray-300 bg-gray-50/50 p-6 transition-colors hover:border-[#0B3D2E] hover:bg-emerald-50/20"
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B3D2E]/10 text-2xl text-[#0B3D2E]">
                <InboxOutlined />
              </div>
              <div>
                <p className="text-sm font-semibold text-cloud-100">
                  Click or drag photos to this area to upload
                </p>
                <p className="mt-1 text-xs text-mist-500">
                  Supports JPG, PNG, WEBP up to 15MB each. Multi-file selection supported (up to 20 images).
                </p>
              </div>
            </div>
          </Upload.Dragger>
        </div>

        {/* Selected Photos Preview Grid */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Selected Photos ({selectedFiles.length})
              </span>
              <Button
                type="link"
                danger
                size="small"
                onClick={() => {
                  previewUrls.forEach((url) => URL.revokeObjectURL(url));
                  setSelectedFiles([]);
                  setPreviewUrls([]);
                }}
                className="text-xs p-0"
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 max-h-56 overflow-y-auto p-1 border border-gray-100 rounded-2xl bg-gray-50/40">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs"
                >
                  <img
                    src={previewUrls[idx]}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
                    title="Remove file"
                  >
                    <DeleteOutlined className="text-[10px]" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Caption */}
        <Form.Item
          name="caption"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Optional Caption / Note for this Batch
            </span>
          }
        >
          <Input.TextArea
            rows={2}
            placeholder="e.g. Field visit day 1, classroom grant distribution..."
            className="rounded-xl text-sm"
          />
        </Form.Item>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button onClick={handleClose} disabled={loading} className="rounded-xl h-10 px-5 font-medium">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={selectedFiles.length === 0}
            className="rounded-xl h-10 px-6 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold shadow-sm border-0"
          >
            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Photos` : "Photos"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
