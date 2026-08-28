import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toFileUrl } from "@/config";
import type {
  ApiTestimonial,
  TestimonialFormPayload,
} from "@/redux/features/testimonials/testimonials.types";

interface FormValues {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export function TestimonialFormModal({
  open,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  initial?: ApiTestimonial | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: TestimonialFormPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    setImageError(null);

    if (initial) {
      form.setFieldsValue({
        quote: initial.quote,
        name: initial.name,
        role: initial.role,
        company: initial.company,
      });
      setImageList(
        initial.image
          ? [{ uid: "-1", name: "current-image", status: "done", url: toFileUrl(initial.image) }]
          : []
      );
    } else {
      form.resetFields();
      setImageList([]);
    }
  }, [open, initial, form]);

  const handleFinish = (values: FormValues) => {
    const imageFile = imageList[0]?.originFileObj as File | undefined;

    if (!isEdit && !imageFile) {
      setImageError("Upload a portrait photo");
      return;
    }

    onSubmit({
      quote: values.quote,
      name: values.name,
      role: values.role,
      company: values.company,
      imageFile: imageFile ?? null,
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
        <span className="font-display text-lg font-semibold text-cloud-100">
          {isEdit ? "Edit testimonial" : "New testimonial"}
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
        {isEdit
          ? "Update the quote, attribution, or portrait shown on the website."
          : "Add a client story that builds trust on the Hubology marketing site."}
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          name="quote"
          label={<span className="text-mist-300">Quote</span>}
          rules={[
            { required: true, message: "Add the testimonial quote" },
            { min: 20, message: "Quote should be at least 20 characters" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Every expert I spoke to was actually vetted…"
            className="resize-none!"
            maxLength={600}
            showCount
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item
            name="name"
            label={<span className="text-mist-300">Name</span>}
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Tobias Reyer" />
          </Form.Item>
          <Form.Item
            name="role"
            label={<span className="text-mist-300">Role</span>}
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Input placeholder="CEO" />
          </Form.Item>
        </div>

        <Form.Item
          name="company"
          label={<span className="text-mist-300">Company</span>}
          rules={[{ required: true, message: "Company is required" }]}
        >
          <Input placeholder="Cadence Labs" />
        </Form.Item>

        <div className="mb-6">
          <div className="mb-2 text-sm text-mist-300">
            Portrait photo {isEdit && <span className="text-mist-600">(optional — leave blank to keep current)</span>}
          </div>
          <Upload.Dragger
            accept="image/*"
            maxCount={1}
            listType="picture"
            fileList={imageList}
            beforeUpload={() => false}
            onChange={({ fileList }) => {
              setImageList(fileList.slice(-1));
              setImageError(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-violet-glow!" />
            </p>
            <p className="text-sm text-cloud-100">Drop a portrait, or click to browse</p>
            <p className="mt-1 text-xs text-mist-500">Square or portrait JPG/PNG works best</p>
          </Upload.Dragger>
          {imageError && <p className="mt-1.5 text-xs text-danger">{imageError}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Publish testimonial"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
