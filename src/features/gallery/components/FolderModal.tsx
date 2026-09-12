import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Upload,
  Segmented,
} from "antd";
import {
  FolderOutlined,
  FolderAddOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  StarFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  GALLERY_CATEGORIES,
  type IFolder,
  type GalleryStatus,
} from "@/redux/features/gallery/gallery.types";
import { getImageUrl } from "@/lib/getImageUrl";

interface FolderModalProps {
  open: boolean;
  folder: IFolder | null; // If provided, edit mode; otherwise create mode
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormValues {
  name: string;
  category?: string;
  location?: string;
  date?: dayjs.Dayjs | null;
  status: GalleryStatus;
  featured: boolean;
  description?: string;
}

export function FolderModal({
  open,
  folder,
  loading = false,
  onCancel,
  onSubmit,
}: FolderModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isEdit = Boolean(folder);

  useEffect(() => {
    if (open) {
      if (folder) {
        form.setFieldsValue({
          name: folder.name,
          category: folder.category || undefined,
          location: folder.location || "",
          date: folder.date ? dayjs(folder.date) : null,
          status: folder.status || "Published",
          featured: Boolean(folder.featured),
          description: folder.description || "",
        });
        if (folder.image) {
          setPreviewUrl(getImageUrl(folder.image));
        } else {
          setPreviewUrl(null);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: "Published",
          featured: false,
          category: GALLERY_CATEGORIES[0],
        });
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

  const handleFinish = (values: FormValues) => {
    const formData = new FormData();
    formData.append("name", values.name.trim());

    if (values.category) {
      formData.append("category", values.category);
    }
    if (values.location?.trim()) {
      formData.append("location", values.location.trim());
    }
    if (values.date) {
      formData.append("date", values.date.toISOString());
    }
    formData.append("status", values.status);
    formData.append("featured", String(Boolean(values.featured)));

    if (values.description?.trim()) {
      formData.append("description", values.description.trim());
    } else {
      formData.append("description", "");
    }

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
      width={680}
      destroyOnClose
      centered
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 font-display text-lg font-bold text-cloud-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B3D2E]/10 text-[#0B3D2E] text-xl">
            {isEdit ? <EditOutlined /> : <FolderAddOutlined />}
          </div>
          <div>
            <h3>{isEdit ? "Edit Album Details" : "Create New Photo Album"}</h3>
            <p className="text-xs font-normal text-mist-500">
              {isEdit
                ? "Update story information, cover photo, category, and public visibility."
                : "Create a photo album with cover image, location, and storytelling metadata."}
            </p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="pt-3 space-y-4 max-h-[72vh] overflow-y-auto pr-1"
      >
        {/* Album Name */}
        <Form.Item
          name="name"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Album / Folder Name <span className="text-rose-500">*</span>
            </span>
          }
          rules={[
            { required: true, message: "Please enter an album name" },
            { min: 2, message: "Album name must be at least 2 characters" },
          ]}
        >
          <Input
            prefix={<FolderOutlined className="text-mist-400" />}
            placeholder="e.g. Summer Grant Outreach 2026"
            className="rounded-xl h-10"
            autoFocus
          />
        </Form.Item>

        {/* Category & Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="category"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Category
              </span>
            }
          >
            <Select
              placeholder="Select category"
              className="h-10 w-full"
              options={GALLERY_CATEGORIES.map((cat) => ({
                label: cat,
                value: cat,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Location
              </span>
            }
          >
            <Input
              prefix={<EnvironmentOutlined className="text-mist-400" />}
              placeholder="e.g. Cap-Haïtien, Haiti"
              className="rounded-xl h-10"
            />
          </Form.Item>
        </div>

        {/* Date & Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="date"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Event / Capture Date
              </span>
            }
          >
            <DatePicker
              className="w-full rounded-xl h-10"
              placeholder="Select date"
              prefix={<CalendarOutlined className="text-mist-400 mr-1" />}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Visibility Status
              </span>
            }
          >
            <Segmented
              block
              className="p-1 rounded-xl bg-gray-100 font-medium"
              options={[
                { label: "Published", value: "Published" },
                { label: "Draft", value: "Draft" },
                { label: "Archived", value: "Archived" },
              ]}
            />
          </Form.Item>
        </div>

        {/* Featured in Spotlight */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-sm text-cloud-100">
              <StarFilled className="text-amber-500 text-sm" />
              <span>Feature in Spotlight</span>
            </div>
            <p className="text-xs text-mist-500">
              Spotlighted albums are pinned to the top of the gallery directory
              and public storefront carousels.
            </p>
          </div>
          <Form.Item name="featured" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </div>

        {/* Description / Field Narrative */}
        <Form.Item
          name="description"
          label={
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Album Description / Field Note
            </span>
          }
        >
          <Input.TextArea
            rows={3}
            placeholder="Share the story and grassroots context behind this album..."
            className="rounded-xl text-sm"
          />
        </Form.Item>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Album Cover Image
          </label>

          {previewUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50">
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={previewUrl}
                  alt="Album cover preview"
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
                      Change Cover
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
                    Supports JPG, PNG, WEBP up to 15MB. 16:9 landscape
                    recommended.
                  </p>
                </div>
              </div>
            </Upload.Dragger>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl h-10 px-5 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="rounded-xl h-10 px-6 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold shadow-sm border-0"
          >
            {isEdit ? "Save Changes" : "Create Album"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
