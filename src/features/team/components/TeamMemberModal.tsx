import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Switch,
  Tag,
  Avatar,
  message,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toFileUrl } from "@/config";
import type {
  TeamMember,
  TeamMemberCategory,
  TeamStatus,
} from "@/redux/features/team/team.types";

interface TeamMemberModalProps {
  open: boolean;
  member: TeamMember | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormValues {
  name: string;
  email: string;
  category: TeamMemberCategory;
  location: string;
  status: TeamStatus;
  bio: string;
  focusAreas: string[];
  phone?: string;
  linkedin?: string;
  twitter?: string;
  featured?: boolean;
}

const COMMON_FOCUS_AREAS = [
  "Strategic Vision",
  "Grant Governance",
  "Community Relations",
  "Field Auditing",
  "Local Vetting",
  "Kreyòl Translation",
  "Financial Management",
  "Technology & Platform",
  "Public Policy",
  "Micro-Grant Evaluation",
];

export function TeamMemberModal({
  open,
  member,
  loading = false,
  onCancel,
  onSubmit,
}: TeamMemberModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isEdit = !!member;

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
      setPreviewUrl(null);
      return;
    }

    if (member) {
      form.setFieldsValue({
        name: member.name,
        email: member.email,
        category: member.category,
        location: member.location,
        status: member.status,
        bio: member.bio,
        focusAreas: Array.isArray(member.focusAreas) ? member.focusAreas : [],
        phone: member.phone || "",
        linkedin: member.linkedin || "",
        twitter: member.twitter || "",
        featured: member.featured ?? false,
      });

      if (member.image) {
        const fullUrl = toFileUrl(member.image);
        setPreviewUrl(fullUrl || null);
        setFileList([
          {
            uid: "-1",
            name: member.image.split("/").pop() || "avatar.jpg",
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
        category: "member",
        status: "active",
        featured: false,
        focusAreas: ["Community Relations"],
      });
      setFileList([]);
      setPreviewUrl(null);
    }
  }, [open, member, form]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      formData.append("name", values.name.trim());
      formData.append("email", values.email.trim());
      formData.append("category", values.category);
      formData.append("location", values.location.trim());
      formData.append("status", values.status);
      formData.append("bio", values.bio?.trim() || "");

      if (values.phone) formData.append("phone", values.phone.trim());
      if (values.linkedin) formData.append("linkedin", values.linkedin.trim());
      if (values.twitter) formData.append("twitter", values.twitter.trim());
      formData.append("featured", String(Boolean(values.featured)));

      if (Array.isArray(values.focusAreas)) {
        values.focusAreas.forEach((area) => {
          if (area.trim()) {
            formData.append("focusAreas", area.trim());
          }
        });
      }

      const uploadFile = fileList[0]?.originFileObj;
      if (uploadFile) {
        formData.append("image", uploadFile);
      }

      onSubmit(formData);
    } catch {
      // Form validation handled by Antd
    }
  };

  const handleFileChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList.slice(-1));
    const file = newFileList[newFileList.length - 1]?.originFileObj;
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setFileList([]);
    setPreviewUrl(null);
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={680}
      centered
      destroyOnHidden
      title={
        <div className="flex items-center gap-2 font-display text-lg font-bold text-[#0B3D2E]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600">
            {isEdit ? <UserOutlined /> : <PlusOutlined />}
          </span>
          <span>
            {isEdit ? "Edit Team Member Profile" : "Add New Team Member"}
          </span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-4"
        requiredMark="optional"
      >
        {/* Top Avatar Upload & Identity Header */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy-700/40 bg-navy-800/5 p-4 sm:flex-row sm:items-start">
          <div className="relative">
            <Avatar
              src={previewUrl}
              icon={<UserOutlined />}
              size={84}
              className="border-2 border-violet-600/30 bg-white shadow-sm"
            />
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                title="Remove image"
              >
                <DeleteOutlined className="text-xs" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              Profile Photo
            </div>
            <p className="mt-0.5 text-xs text-mist-500">
              Upload a clear headshot or avatar (JPG, PNG, WebP up to 5MB).
            </p>
            <div className="mt-2.5">
              <Upload
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    message.error("Please upload an image file (JPG/PNG/WebP)");
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                fileList={fileList}
                onChange={handleFileChange}
                showUploadList={false}
                maxCount={1}
              >
                <Button
                  icon={<UploadOutlined />}
                  size="small"
                  className="rounded-xl border-navy-700/60 hover:border-violet-600 hover:text-violet-600"
                >
                  {previewUrl ? "Change Photo" : "Upload Photo"}
                </Button>
              </Upload>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="name"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                Full Name
              </span>
            }
            rules={[{ required: true, message: "Please input the full name" }]}
          >
            <Input
              placeholder="e.g. Jean-Baptiste Casimir"
              className="rounded-xl border-navy-700/60 py-2"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                Email Address
              </span>
            }
            rules={[
              { required: true, message: "Please input the email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-mist-400" />}
              placeholder="jb.casimir@ifundayiti.org"
              className="rounded-xl border-navy-700/60 py-2"
            />
          </Form.Item>
        </div>

        {/* Category, Location, and Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Form.Item
            name="category"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                Member Category
              </span>
            }
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              className="w-full rounded-xl"
              options={[
                { label: "Board Director", value: "director" },
                { label: "Core Member", value: "member" },
                { label: "Volunteer", value: "volunteer" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                Location
              </span>
            }
            rules={[{ required: true, message: "Please input location" }]}
          >
            <Input
              prefix={<EnvironmentOutlined className="text-mist-400" />}
              placeholder="Port-au-Prince, Haiti"
              className="rounded-xl border-navy-700/60 py-2"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                Status
              </span>
            }
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              className="w-full rounded-xl"
              options={[
                { label: "Active", value: "active" },
                { label: "Pending", value: "pending" },
                { label: "Rejected", value: "rejected" },
                { label: "Blocked", value: "blocked" },
              ]}
            />
          </Form.Item>
        </div>

        {/* Biography */}
        <Form.Item
          name="bio"
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
              Biography & Experience
            </span>
          }
          rules={[{ required: true, message: "Please provide a short bio" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Share key background, achievements, and responsibilities within the organization..."
            className="rounded-xl border-navy-700/60"
          />
        </Form.Item>

        {/* Focus Areas Multi-Tag Selector */}
        <Form.Item
          name="focusAreas"
          label={
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
              Focus Areas & Skills
            </span>
          }
          tooltip="Select from suggested topics or type custom tags and press Enter."
        >
          <Select
            mode="tags"
            className="w-full"
            placeholder="Select or type custom focus areas..."
            options={COMMON_FOCUS_AREAS.map((area) => ({
              label: area,
              value: area,
            }))}
          />
        </Form.Item>

        {/* Social and Contact Links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Form.Item
            name="phone"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                Phone Number
              </span>
            }
          >
            <Input
              prefix={<PhoneOutlined className="text-mist-400" />}
              placeholder="+509 0000 0000"
              className="rounded-xl border-navy-700/60 py-2"
            />
          </Form.Item>

          <Form.Item
            name="linkedin"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                LinkedIn Profile URL
              </span>
            }
          >
            <Input
              prefix={<LinkedinOutlined className="text-mist-400" />}
              placeholder="https://linkedin.com/in/username"
              className="rounded-xl border-navy-700/60 py-2"
            />
          </Form.Item>

          <Form.Item
            name="twitter"
            label={
              <span className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                Twitter / X URL
              </span>
            }
          >
            <Input
              prefix={<TwitterOutlined className="text-mist-400" />}
              placeholder="https://twitter.com/username"
              className="rounded-xl border-navy-700/60 py-2"
            />
          </Form.Item>
        </div>

        {/* Featured Switch */}
        <div className="flex items-center justify-between rounded-xl border border-navy-700/40 bg-navy-800/5 p-3.5">
          <div>
            <div className="text-xs font-semibold text-cloud-100">
              Featured Member Badge
            </div>
            <div className="text-[11px] text-mist-500">
              Pin or highlight this member prominently on public websites and
              reports.
            </div>
          </div>
          <Form.Item name="featured" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </div>
      </Form>

      {/* Footer Controls */}
      <div className="mt-6 flex justify-end gap-2.5 border-t border-navy-700/40 pt-4">
        <Button onClick={onCancel} disabled={loading} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handleFinish}
          className="btn-linear rounded-xl border-0"
        >
          {isEdit ? "Save Changes" : "Create Team Member"}
        </Button>
      </div>
    </Modal>
  );
}
