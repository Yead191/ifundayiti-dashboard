import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, Upload } from "antd";
import { PlusOutlined, MinusCircleOutlined, InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toFileUrl } from "@/config";
import type { ApiService, ServiceFormPayload } from "@/redux/features/services/services.types";

interface ServiceFormValues {
  title: string;
  tagline: string;
  amount: number;
  frequency: string;
  featured: boolean;
  longDescription: string;
  features: string[];
}

export function ServiceFormModal({
  open,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  initial?: ApiService | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: ServiceFormPayload) => void;
}) {
  const [form] = Form.useForm<ServiceFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    setImageError(null);

    if (initial) {
      form.setFieldsValue({
        title: initial.title,
        tagline: initial.tagline,
        amount: initial.price.amount,
        frequency: initial.price.frequency,
        featured: initial.featured,
        longDescription: initial.longDescription,
        features: initial.features?.length ? initial.features : [""],
      });
      setFileList(
        initial.image
          ? [
              {
                uid: "-1",
                name: "current-image",
                status: "done",
                url: toFileUrl(initial.image),
              },
            ]
          : []
      );
    } else {
      form.resetFields();
      form.setFieldsValue({ frequency: "per session", featured: false, features: [""] });
      setFileList([]);
    }
  }, [open, initial, form]);

  const handleFinish = (values: ServiceFormValues) => {
    const imageFile = fileList[0]?.originFileObj as File | undefined;

    if (!isEdit && !imageFile) {
      setImageError("Upload a cover image for this service");
      return;
    }

    onSubmit({
      title: values.title.trim(),
      tagline: values.tagline.trim(),
      amount: values.amount,
      frequency: values.frequency.trim(),
      featured: values.featured,
      longDescription: values.longDescription.trim(),
      features: values.features.map((f) => f.trim()).filter(Boolean),
      imageFile: imageFile ?? null,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={isEdit ? "Edit service" : "New service package"}
      width={640}
      footer={null}
      destroyOnHidden
      maskClosable={!loading}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish} className="mt-2">
        <Form.Item label="Title" name="title" rules={[{ required: true, message: "Give the service a title" }]}>
          <Input placeholder="EIN" />
        </Form.Item>

          <Form.Item label="Tagline" name="tagline" rules={[{ required: true, message: "Add a short tagline" }]}>
            <Input.TextArea placeholder="Obtain your Employer Identification Number quickly…" rows={4} />
          </Form.Item>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item label="Amount" name="amount" rules={[{ required: true, message: "Enter a price" }]}>
            <InputNumber min={0} className="w-full!" prefix="$" placeholder="29" />
          </Form.Item>
          <Form.Item
            label="Billed as"
            name="frequency"
            rules={[{ required: true, message: "e.g. per session" }]}
          >
            <Input placeholder="per session" />
          </Form.Item>
        </div>

        <Form.Item label="Featured on services page" name="featured" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-cloud-100">
            Cover image {isEdit ? <span className="font-normal text-mist-600">(optional to replace)</span> : null}
          </div>
          <Upload.Dragger
            accept="image/jpeg,image/png,image/webp,image/jpg"
            maxCount={1}
            listType="picture"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: next }) => {
              setFileList(next.slice(-1));
              setImageError(null);
            }}
            className="bg-navy-800/40!"
          >
            <p className="ant-upload-drag-icon mb-2!">
              <InboxOutlined className="text-violet-glow!" />
            </p>
            <p className="text-sm text-cloud-100">Click or drag an image here</p>
            <p className="text-xs text-mist-600">JPG, PNG or WebP</p>
          </Upload.Dragger>
          {imageError && <p className="mt-1.5 text-xs text-danger">{imageError}</p>}
        </div>

        <Form.Item
          label="Long description"
          name="longDescription"
          rules={[{ required: true, message: "Describe the service in detail" }]}
        >
          <Input.TextArea rows={4} placeholder="What's included, who it's for, how it works…" />
        </Form.Item>

        <Form.List name="features">
          {(fields, { add, remove }) => (
            <div>
              <div className="mb-2 text-sm font-medium text-cloud-100">Key features</div>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <Form.Item
                      {...field}
                      className="mb-0! flex-1!"
                      rules={[{ required: true, message: "Feature can't be empty" }]}
                    >
                      <Input placeholder="Fast IRS filing" />
                    </Form.Item>
                    <button
                      type="button"
                      onClick={() => remove(field.name)}
                      className="text-mist-600 hover:text-danger"
                      aria-label="Remove feature"
                    >
                      <MinusCircleOutlined />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="dashed"
                onClick={() => add("")}
                icon={<PlusOutlined />}
                className="mt-2.5! border-navy-600! text-mist-400!"
                block
              >
                Add feature
              </Button>
            </div>
          )}
        </Form.List>

        <div className="mt-6 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Create service"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
