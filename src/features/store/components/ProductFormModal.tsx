import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, Upload, ColorPicker, Select } from "antd";
import { InboxOutlined, FilePdfOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toFileUrl } from "@/config";
import {
  isDigitalDetails,
  type ApiBook,
  type BookFormPayload,
  type BookStockStatus,
  type BookType,
} from "@/redux/features/store/store.types";
import { normalizeStockStatus } from "../statusMaps";

interface FormValues {
  title: string;
  subtitle: string;
  price: number;
  description: string;
  accentFrom: string;
  accentTo: string;
  stockStatus: BookStockStatus;
  publisher?: string;
  firstPublish?: string;
  edition?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
}

export function ProductFormModal({
  open,
  type,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  type: BookType;
  initial?: ApiBook | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: BookFormPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const isEdit = !!initial;
  const isDigital = type === "digital";

  useEffect(() => {
    if (!open) return;
    setImageError(null);
    setFileError(null);

    if (initial) {
      const stock = normalizeStockStatus(initial.details.status, initial.details.inStock);
      const accent = initial.accent ?? ["#8131f0", "#4a1c8a"];

      form.setFieldsValue({
        title: initial.title,
        subtitle: initial.subtitle,
        price: initial.price,
        description: initial.description,
        accentFrom: accent[0] ?? "#8131f0",
        accentTo: accent[1] ?? "#4a1c8a",
        stockStatus: stock,
        ...(isDigitalDetails(initial.details)
          ? {
              publisher: initial.details.publisher,
              firstPublish: initial.details.firstPublish,
              edition: initial.details.edition,
            }
          : {
              material: initial.details.material,
              dimensions: initial.details.dimensions,
              weight: initial.details.weight,
            }),
      });

      setImageList(
        initial.image
          ? [{ uid: "-1", name: "current-image", status: "done", url: toFileUrl(initial.image) }]
          : []
      );
      setFileList(
        initial.file
          ? [{ uid: "-2", name: initial.file.split("/").pop() ?? "current-file", status: "done", url: toFileUrl(initial.file) }]
          : []
      );
    } else {
      form.resetFields();
      form.setFieldsValue({
        accentFrom: "#8131f0",
        accentTo: "#4a1c8a",
        stockStatus: "in-stock",
      });
      setImageList([]);
      setFileList([]);
    }
  }, [open, initial, form]);

  const handleFinish = (values: FormValues) => {
    const imageFile = imageList[0]?.originFileObj as File | undefined;
    const fileUpload = fileList[0]?.originFileObj as File | undefined;

    if (!isEdit && !imageFile) {
      setImageError("Upload a product image");
      return;
    }
    if (isDigital && !isEdit && !fileUpload) {
      setFileError("Upload the digital file (PDF or document)");
      return;
    }

    const inStock = values.stockStatus === "in-stock";

    const payload: BookFormPayload = {
      type,
      title: values.title.trim(),
      subtitle: values.subtitle.trim(),
      description: values.description.trim(),
      price: values.price,
      imageFile: imageFile ?? null,
      fileUpload: fileUpload ?? null,
      accent: isDigital ? [values.accentFrom, values.accentTo] : undefined,
      details: isDigital
        ? {
            publisher: (values.publisher ?? "").trim(),
            firstPublish: (values.firstPublish ?? "").trim(),
            edition: (values.edition ?? "").trim(),
            status: values.stockStatus,
            inStock,
          }
        : {
            material: (values.material ?? "").trim(),
            dimensions: (values.dimensions ?? "").trim(),
            weight: (values.weight ?? "").trim(),
            status: values.stockStatus,
            inStock,
          },
    };

    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={isEdit ? `Edit ${isDigital ? "digital" : "office"} product` : `New ${isDigital ? "digital" : "office"} product`}
      width={640}
      footer={null}
      destroyOnHidden
      maskClosable={!loading}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish} className="mt-2">
        <Form.Item label="Title" name="title" rules={[{ required: true, message: "Enter a title" }]}>
          <Input placeholder={isDigital ? "The Business Plan" : "Premium Leather Binder"} />
        </Form.Item>

        <Form.Item label="Subtitle" name="subtitle" rules={[{ required: true, message: "Add a subtitle" }]}>
          <Input placeholder={isDigital ? "The Founder's Psychology Guide" : "Organize your startup documents in style"} />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item label="Price ($)" name="price" rules={[{ required: true, message: "Enter a price" }]}>
            <InputNumber min={0} className="w-full!" prefix="$" placeholder={isDigital ? "200" : "45"} />
          </Form.Item>
          <Form.Item label="Stock status" name="stockStatus" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "In stock", value: "in-stock" },
                { label: "Out of stock", value: "out-stock" },
              ]}
            />
          </Form.Item>
        </div>

        {isDigital && (
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item label="Accent — from" name="accentFrom" rules={[{ required: true }]}>
              <ColorPicker
                format="hex"
                showText
                onChangeComplete={(c) => form.setFieldsValue({ accentFrom: c.toHexString() })}
              />
            </Form.Item>
            <Form.Item label="Accent — to" name="accentTo" rules={[{ required: true }]}>
              <ColorPicker
                format="hex"
                showText
                onChangeComplete={(c) => form.setFieldsValue({ accentTo: c.toHexString() })}
              />
            </Form.Item>
          </div>
        )}

        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-cloud-100">
            Product image {isEdit ? <span className="font-normal text-mist-600">(optional to replace)</span> : null}
          </div>
          <Upload.Dragger
            accept="image/jpeg,image/png,image/webp,image/jpg"
            maxCount={1}
            listType="picture"
            fileList={imageList}
            beforeUpload={() => false}
            onChange={({ fileList: next }) => {
              setImageList(next.slice(-1));
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

        {isDigital && (
          <div className="mb-4">
            <div className="mb-2 text-sm font-medium text-cloud-100">
              Digital file {isEdit ? <span className="font-normal text-mist-600">(optional to replace)</span> : null}
            </div>
            <Upload.Dragger
              accept=".pdf,.doc,.docx,.epub,.zip"
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: next }) => {
                setFileList(next.slice(-1));
                setFileError(null);
              }}
              className="bg-navy-800/40!"
            >
              <p className="ant-upload-drag-icon mb-2!">
                <FilePdfOutlined className="text-violet-glow!" />
              </p>
              <p className="text-sm text-cloud-100">Click or drag the product file here</p>
              <p className="text-xs text-mist-600">PDF, DOC, EPUB or ZIP</p>
            </Upload.Dragger>
            {fileError && <p className="mt-1.5 text-xs text-danger">{fileError}</p>}
          </div>
        )}

        <Form.Item label="Description" name="description" rules={[{ required: true, message: "Add a description" }]}>
          <Input.TextArea rows={4} placeholder="Full product description shown on the detail page…" />
        </Form.Item>

        {isDigital ? (
          <>
            <div className="mb-2 text-sm font-medium text-cloud-100">Publication details</div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Form.Item label="Publisher / author" name="publisher" rules={[{ required: true, message: "Enter a publisher" }]}>
                <Input placeholder="Yead" />
              </Form.Item>
              <Form.Item label="First published" name="firstPublish" rules={[{ required: true, message: "e.g. December 30, 2026" }]}>
                <Input placeholder="December 30, 2026" />
              </Form.Item>
              <Form.Item label="Edition" name="edition" rules={[{ required: true, message: "e.g. 2024" }]} className="sm:col-span-2">
                <Input placeholder="2024" />
              </Form.Item>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 text-sm font-medium text-cloud-100">Product details</div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
              <Form.Item label="Material" name="material" rules={[{ required: true, message: "Enter a material" }]}>
                <Input placeholder="Full-grain Leather" />
              </Form.Item>
              <Form.Item label="Dimensions" name="dimensions" rules={[{ required: true, message: "Enter dimensions" }]}>
                <Input placeholder="10 x 12 inches" />
              </Form.Item>
              <Form.Item label="Weight" name="weight" rules={[{ required: true, message: "Enter a weight" }]}>
                <Input placeholder="1.2 lbs" />
              </Form.Item>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
