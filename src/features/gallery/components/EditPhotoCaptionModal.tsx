import { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { IGallery } from "@/redux/features/gallery/gallery.types";
import { getImageUrl } from "@/lib/getImageUrl";

interface EditPhotoCaptionModalProps {
  open: boolean;
  photo: IGallery | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (id: string, caption: string) => void;
}

export function EditPhotoCaptionModal({
  open,
  photo,
  loading = false,
  onCancel,
  onSubmit,
}: EditPhotoCaptionModalProps) {
  const [form] = Form.useForm<{ caption: string }>();

  useEffect(() => {
    if (open && photo) {
      form.setFieldsValue({ caption: photo.caption || "" });
    } else {
      form.resetFields();
    }
  }, [open, photo, form]);

  const handleFinish = (values: { caption: string }) => {
    if (!photo) return;
    onSubmit(photo._id, values.caption.trim());
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
      centered
      title={
        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 font-display text-base font-bold text-cloud-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
            <EditOutlined />
          </div>
          <span>Edit Photo Caption</span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-3 space-y-4"
      >
        {photo && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-200 shadow-2xs">
            <img
              src={getImageUrl(photo.image)}
              alt={photo.caption || "Photo preview"}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <Form.Item
          name="caption"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Photo Caption / Note
            </span>
          }
        >
          <Input.TextArea
            rows={3}
            placeholder="Add descriptive details or field notes for this photo..."
            className="rounded-xl text-sm"
            autoFocus
          />
        </Form.Item>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <Button onClick={onCancel} disabled={loading} className="rounded-xl h-9 px-4 font-medium">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="rounded-xl h-9 px-5 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold shadow-sm border-0"
          >
            Save Caption
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
