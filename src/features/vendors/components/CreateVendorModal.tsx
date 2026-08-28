import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Upload,
  Segmented,
  Tooltip,
} from "antd";
import { InboxOutlined, QuestionCircleOutlined, TeamOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { EXPERT_CATEGORIES } from "@/lib/constants";
import {
  VENDOR_AVAILABILITY_OPTIONS,
  VENDOR_CONSULTATION_TYPES,
  VENDOR_STATUS_OPTIONS,
  type CreateVendorPayload,
  type VendorAccountStatus,
} from "@/redux/features/vendors/vendors.types";

interface FormValues {
  name: string;
  email: string;
  password: string;
  company: string;
  interest: string;
  status: VendorAccountStatus;
  verified: boolean;
  jobTitle: string;
  contactNo: string;
  bio: string;
  expertise: string[];
  yearsExperience: string;
  degree: string;
  linkedin: string;
  hourlyRate: number;
  availability: string;
  consultationTypes: string[];
  isProfileVisible: boolean;
}

export function CreateVendorModal({
  open,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateVendorPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      status: "active",
      verified: true,
      expertise: [],
      consultationTypes: ["Online"],
      availability: "Project Based",
      isProfileVisible: false,
    });
    setImageList([]);
    setImageError(null);
  }, [open, form]);

  const handleFinish = (values: FormValues) => {
    const imageFile = imageList[0]?.originFileObj as File | undefined;
    if (!imageFile) {
      setImageError("Upload a profile photo");
      return;
    }

    onSubmit({
      name: values.name,
      email: values.email,
      password: values.password,
      company: values.company,
      interest: values.interest,
      status: values.status,
      verified: !!values.verified,
      imageFile,
      vendorProfile: {
        jobTitle: values.jobTitle.trim(),
        contactNo: values.contactNo.trim(),
        bio: values.bio.trim(),
        expertise: values.expertise ?? [],
        yearsExperience: String(values.yearsExperience).trim(),
        degree: values.degree.trim(),
        linkedin: values.linkedin?.trim() ?? "",
        hourlyRate: values.hourlyRate,
        availability: values.availability,
        consultationTypes: values.consultationTypes ?? [],
        isProfileVisible: !!values.isProfileVisible,
      },
    });
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={760}
      centered
      destroyOnHidden
      title={
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-cloud-100">
          <TeamOutlined className="text-violet-glow" />
          Create vendor
        </span>
      }
      styles={{
        container: {
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          maxHeight: "90vh",
          overflowY: "auto",
        },
      }}
    >
      <p className="mb-5 text-sm text-mist-400">
        Add a vendor account directly from admin. They can sign in with the email and password you
        set.
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <SectionTitle>Account</SectionTitle>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="name"
            label={<span className="text-mist-400">Full name</span>}
            rules={[{ required: true, message: "Enter the vendor name" }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item
            name="email"
            label={<span className="text-mist-400">Email</span>}
            rules={[
              { required: true, message: "Enter an email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="vendor@company.com" autoComplete="off" />
          </Form.Item>
        </div>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="password"
            label={<span className="text-mist-400">Password</span>}
            rules={[
              { required: true, message: "Enter a password" },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Input.Password placeholder="••••••••" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="company"
            label={<span className="text-mist-400">Company</span>}
            rules={[{ required: true, message: "Enter a company" }]}
          >
            <Input placeholder="Spark Tech" />
          </Form.Item>
        </div>

        <Form.Item
          name="interest"
          label={<span className="text-mist-400">Interest</span>}
          rules={[{ required: true, message: "Enter an interest" }]}
        >
          <Input placeholder="coding" />
        </Form.Item>

        <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <Form.Item
            name="status"
            label={<span className="text-mist-400">Account status</span>}
            rules={[{ required: true, message: "Select a status" }]}
            className="mb-0!"
          >
            <Segmented
              block
              options={VENDOR_STATUS_OPTIONS.map((status) => ({
                label:
                  status === "pending"
                    ? "Pending"
                    : status.charAt(0).toUpperCase() + status.slice(1),
                value: status,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="verified"
            label={<span className="text-mist-400">Verified</span>}
            valuePropName="checked"
            className="mb-0!"
          >
            <Switch />
          </Form.Item>
        </div>

        <div className="mb-5">
          <div className="mb-2 text-sm text-mist-400">Profile photo</div>
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
            <p className="text-sm text-cloud-100">Drop a photo, or click to browse</p>
            <p className="mt-1 text-xs text-mist-500">JPG or PNG recommended</p>
          </Upload.Dragger>
          {imageError && <p className="mt-1.5 text-xs text-danger">{imageError}</p>}
        </div>

        <SectionTitle>Professional profile</SectionTitle>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="jobTitle"
            label={<span className="text-mist-400">Job title</span>}
            rules={[{ required: true, message: "Enter a job title" }]}
          >
            <Input placeholder="Full Stack Developer" />
          </Form.Item>
          <Form.Item
            name="contactNo"
            label={<span className="text-mist-400">Contact number</span>}
            rules={[{ required: true, message: "Enter a contact number" }]}
          >
            <Input placeholder="+8801712345678" />
          </Form.Item>
        </div>

        <Form.Item
          name="bio"
          label={<span className="text-mist-400">Bio</span>}
          rules={[{ required: true, message: "Enter a short bio" }]}
        >
          <Input.TextArea
            rows={3}
            className="resize-none!"
            placeholder="Experienced MERN Stack Developer"
            maxLength={600}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="expertise"
          label={<span className="text-mist-400">Expertise</span>}
          rules={[{ required: true, message: "Add at least one expertise" }]}
        >
          <Select
            mode="tags"
            placeholder="Select or type expertise"
            options={EXPERT_CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
        </Form.Item>

        <div className="grid gap-x-4 sm:grid-cols-3">
          <Form.Item
            name="yearsExperience"
            label={<span className="text-mist-400">Years experience</span>}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="5" />
          </Form.Item>
          <Form.Item
            name="degree"
            label={<span className="text-mist-400">Degree</span>}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="BSc in CSE" />
          </Form.Item>
          <Form.Item
            name="hourlyRate"
            label={<span className="text-mist-400">Hourly rate ($)</span>}
            rules={[{ required: true, message: "Required" }]}
          >
            <InputNumber min={0} className="w-full!" placeholder="100" />
          </Form.Item>
        </div>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="availability"
            label={<span className="text-mist-400">Availability</span>}
            rules={[{ required: true, message: "Select availability" }]}
          >
            <Select
              options={VENDOR_AVAILABILITY_OPTIONS.map((a) => ({ label: a, value: a }))}
            />
          </Form.Item>
          <Form.Item
            name="consultationTypes"
            label={<span className="text-mist-400">Consultation types</span>}
            rules={[{ required: true, message: "Select at least one" }]}
          >
            <Select
              mode="multiple"
              options={VENDOR_CONSULTATION_TYPES.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
        </div>

        <Form.Item name="linkedin" label={<span className="text-mist-400">LinkedIn (optional)</span>}>
          <Input placeholder="https://linkedin.com/in/johndoe" />
        </Form.Item>

        <div className="mb-5 rounded-xl border border-navy-700/60 bg-navy-800/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-cloud-100">
                Show on vendor directory
                <Tooltip title="Enable this to make the profile visible on the public vendor page even if they don't have an active subscription.">
                  <QuestionCircleOutlined className="text-mist-500" />
                </Tooltip>
              </div>
              <p className="mt-0.5 text-xs text-mist-500">
                Enabling this will make this profile visible on the vendor page even if they don't
                have a subscription.
              </p>
            </div>
            <Form.Item name="isProfileVisible" valuePropName="checked" className="mb-0!">
              <Switch />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            Create vendor
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-1 border-b border-navy-700/50 pb-2 text-xs font-semibold uppercase tracking-wide text-mist-500">
      {children}
    </div>
  );
}
