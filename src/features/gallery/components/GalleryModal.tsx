import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Switch,
  DatePicker,
  Radio,
  message,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  StarFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
import dayjs, { type Dayjs } from "dayjs";
import { toFileUrl } from "@/config";
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  type GalleryItem,
  type GalleryStatus,
} from "@/redux/features/gallery/gallery.types";

interface GalleryModalProps {
  open: boolean;
  item: GalleryItem | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormValues {
  title: string;
  description?: string;
  category: GalleryCategory;
  location?: string;
  date?: Dayjs;
  status: GalleryStatus;
  featured?: boolean;
}

export function GalleryModal({
  open,
  item,
  loading = false,
  onCancel,
  onSubmit,
}: GalleryModalProps) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = Boolean(item);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (item) {
      form.setFieldsValue({
        title: item.title,
        description: item.description || "",
        category: item.category,
        location: item.location || "",
        date: item.date ? dayjs(item.date) : dayjs(),
        status: item.status,
        featured: item.featured ?? false,
      });

      if (item.image) {
        const fullUrl = toFileUrl(item.image);
        setPreviewUrl(fullUrl || null);
        setFileList([
          {
            uid: "-1",
            name: "Current Image",
            status: "done",
            url: fullUrl,
          },
        ]);
      } else {
        setPreviewUrl(null);
        setFileList([]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        category: GALLERY_CATEGORIES[0],
        date: dayjs(),
        status: "Draft",
        featured: false,
      });
      setPreviewUrl(null);
      setFileList([]);
    }
  }, [open, item, form]);

  const handleCustomUpload = ({ file, onSuccess }: any) => {
    const rcFile = file as RcFile;
    const url = URL.createObjectURL(rcFile);
    setPreviewUrl(url);
    setFileList([
      {
        uid: rcFile.uid || "-1",
        name: rcFile.name,
        status: "done",
        originFileObj: rcFile,
      },
    ]);
    if (onSuccess) onSuccess("ok");
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setFileList([]);
  };

  const handleFinish = (values: FormValues) => {
    // For new gallery photo, image file is required
    if (!isEdit && fileList.length === 0) {
      message.error("Please upload an image for this gallery item.");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("category", values.category);

    if (values.description?.trim()) {
      formData.append("description", values.description.trim());
    } else {
      formData.append("description", "");
    }

    if (values.location?.trim()) {
      formData.append("location", values.location.trim());
    } else {
      formData.append("location", "");
    }

    if (values.date) {
      formData.append("date", values.date.toISOString());
    }

    formData.append("status", values.status);
    formData.append("featured", String(Boolean(values.featured)));

    // New uploaded photo
    const newFile = fileList[0]?.originFileObj;
    if (newFile) {
      formData.append("image", newFile);
    }

    onSubmit(formData);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
      centered
      className="custom-modal"
      title={
        <div className="flex items-center gap-2.5 pb-2 border-b border-navy-700/40 font-display text-lg font-bold text-cloud-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <PictureOutlined className="text-base" />
          </div>
          <span>{isEdit ? "Edit Gallery Photo" : "Upload New Photo"}</span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4 space-y-4"
        requiredMark="optional"
      >
        {/* Photo Upload Zone */}
        <Form.Item
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-cloud-100">
              High-Resolution Photo {!isEdit && <span className="text-rose-500">*</span>}
            </span>
          }
          required={!isEdit}
        >
          {previewUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-navy-700/80 bg-navy-900/40">
              <div className="relative aspect-16/9 w-full overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Gallery preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between border-t border-navy-700/60 bg-white p-3 shadow-xs">
                <span className="text-xs text-cloud-100 font-medium truncate max-w-sm">
                  {fileList[0]?.name || "Selected photo"}
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
                      className="rounded-lg border-navy-700/80 text-xs font-medium text-cloud-100"
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
              className="rounded-2xl border-dashed border-navy-700/80 bg-white/70 p-6 transition-colors hover:border-emerald-600 hover:bg-emerald-500/5"
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl text-emerald-600">
                  <UploadOutlined />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-cloud-100">
                    Click or drag image to this area to upload
                  </p>
                  <p className="mt-1 text-xs text-mist-600">
                    Supports JPG, PNG, WEBP up to 15MB. High-resolution landscape
                    photos recommended.
                  </p>
                </div>
              </div>
            </Upload.Dragger>
          )}
        </Form.Item>

        {/* Title */}
        <Form.Item
          name="title"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-cloud-100">
              Photo Title / Subject <span className="text-rose-500">*</span>
            </span>
          }
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input
            placeholder="e.g. Solar Installation at Saint-Marc Cooperative"
            className="rounded-xl border-navy-700/80 py-2 text-sm text-cloud-100 font-medium"
          />
        </Form.Item>

        {/* Category & Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="category"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-cloud-100">
                Category <span className="text-rose-500">*</span>
              </span>
            }
            rules={[{ required: true, message: "Category is required" }]}
          >
            <Select
              placeholder="Select category"
              options={GALLERY_CATEGORIES.map((c) => ({
                value: c,
                label: c,
              }))}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="location"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-cloud-100">
                Location
              </span>
            }
          >
            <Input
              prefix={<EnvironmentOutlined className="text-mist-500" />}
              placeholder="e.g. Saint-Marc, Artibonite"
              className="rounded-xl border-navy-700/80 py-1.5 text-sm text-cloud-100"
            />
          </Form.Item>
        </div>

        {/* Capture Date & Publishing Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="date"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-cloud-100">
                Capture Date
              </span>
            }
          >
            <DatePicker
              format="MMM D, YYYY"
              className="w-full rounded-xl border-navy-700/80 py-1.5 text-sm"
              prefix={<CalendarOutlined className="text-mist-500" />}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-cloud-100">
                Publishing Status
              </span>
            }
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Radio.Group className="flex w-full gap-2">
              <Radio.Button
                value="Published"
                className="flex-1 text-center rounded-lg font-semibold text-xs !h-9 !leading-9"
              >
                Published
              </Radio.Button>
              <Radio.Button
                value="Draft"
                className="flex-1 text-center rounded-lg font-semibold text-xs !h-9 !leading-9"
              >
                Draft
              </Radio.Button>
              <Radio.Button
                value="Archived"
                className="flex-1 text-center rounded-lg font-semibold text-xs !h-9 !leading-9"
              >
                Archived
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        {/* Description / Story */}
        <Form.Item
          name="description"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-cloud-100">
              Story / Context Behind The Photo
            </span>
          }
        >
          <Input.TextArea
            rows={3}
            placeholder="Describe what is happening in this photo, who is involved, and its community significance..."
            className="rounded-xl border-navy-700/80 py-2 text-sm text-cloud-100"
          />
        </Form.Item>

        {/* Featured in Spotlight Toggle */}
        <div className="rounded-2xl border border-amber-400/30 bg-amber-50/50 p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-display text-sm font-bold text-amber-900">
                <StarFilled className="text-amber-500" />
                <span>Feature in Spotlight</span>
              </div>
              <p className="text-xs text-amber-700/80">
                Spotlighted photos are prominently highlighted on the public homepage and top of the media gallery.
              </p>
            </div>
            <Form.Item name="featured" valuePropName="checked" noStyle>
              <Switch className="!bg-amber-500" />
            </Form.Item>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-navy-700/40 pt-4">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border-navy-700/60 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="btn-gradient rounded-xl px-5 font-semibold shadow-xs"
          >
            {isEdit ? "Save Changes" : "Upload Photo"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
