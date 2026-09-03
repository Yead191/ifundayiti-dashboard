import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  Switch,
  message,
  Tabs,
} from "antd";
import {
  FolderAddOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
  DollarOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toFileUrl } from "@/config";
import { useGetPeriodsQuery } from "@/redux/features/periods/periodsApi";
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "@/redux/features/projects/project.types";

interface ProjectModalProps {
  open: boolean;
  project: Project | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}

interface FormValues {
  name: string;
  category: ProjectCategory;
  location: string;
  founder?: string;
  year?: number;
  grantAmount?: number;
  applicationPeriod?: string;
  description: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  story?: string;
  status: ProjectStatus;
  featured?: boolean;
}

export function ProjectModal({
  open,
  project,
  loading = false,
  onCancel,
  onSubmit,
}: ProjectModalProps) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = Boolean(project);

  // Application Periods for cycle selection
  const { data: periodsRes, isLoading: isLoadingPeriods } = useGetPeriodsQuery({
    limit: 100,
  });
  const periodOptions = (periodsRes?.data ?? []).map((p) => ({
    value: p._id,
    label: `${p.title} (${p.status})`,
  }));

  // Cover image file list
  const [coverFileList, setCoverFileList] = useState<UploadFile[]>([]);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Gallery file list (up to 10 photos)
  const [galleryFileList, setGalleryFileList] = useState<UploadFile[]>([]);

  // Active form section tab
  const [activeTab, setActiveTab] = useState<string>("basic");

  useEffect(() => {
    if (!open) return;

    if (project) {
      const periodId =
        typeof project.applicationPeriod === "object" && project.applicationPeriod !== null
          ? project.applicationPeriod._id
          : typeof project.applicationPeriod === "string"
            ? project.applicationPeriod
            : undefined;

      form.setFieldsValue({
        name: project.name,
        category: project.category,
        location: project.location,
        founder: project.founder || "",
        year: project.year || new Date().getFullYear(),
        grantAmount: project.grantAmount,
        applicationPeriod: periodId,
        description: project.description,
        challenge: project.challenge || "",
        approach: project.approach || "",
        outcome: project.outcome || "",
        story: project.story || "",
        status: project.status,
        featured: project.featured ?? false,
      });

      if (project.image) {
        const fullUrl = toFileUrl(project.image);
        setCoverPreviewUrl(fullUrl || null);
        setCoverFileList([
          {
            uid: "-1",
            name: project.image.split("/").pop() || "cover.jpg",
            status: "done",
            url: fullUrl,
          },
        ]);
      } else {
        setCoverPreviewUrl(null);
        setCoverFileList([]);
      }

      if (Array.isArray(project.gallery) && project.gallery.length > 0) {
        setGalleryFileList(
          project.gallery.map((img, idx) => ({
            uid: `-${idx + 10}`,
            name: img.split("/").pop() || `gallery-${idx + 1}.jpg`,
            status: "done",
            url: toFileUrl(img),
          }))
        );
      } else {
        setGalleryFileList([]);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        category: "Community Development",
        status: "Draft",
        year: new Date().getFullYear(),
        featured: false,
      });
      setCoverPreviewUrl(null);
      setCoverFileList([]);
      setGalleryFileList([]);
      setActiveTab("basic");
    }
  }, [open, project, form]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      formData.append("name", values.name.trim());
      formData.append("category", values.category || project?.category || "Community Development");
      formData.append("location", values.location.trim());
      formData.append("description", values.description.trim());

      // Guarantee status is always a valid enum value and never undefined
      const finalStatus = values.status || project?.status || "Draft";
      formData.append("status", finalStatus);

      // Guarantee featured boolean is always defined
      const finalFeatured =
        values.featured !== undefined
          ? Boolean(values.featured)
          : Boolean(project?.featured ?? false);
      formData.append("featured", String(finalFeatured));

      if (values.founder) formData.append("founder", values.founder.trim());
      if (values.year !== undefined && values.year !== null) {
        formData.append("year", String(values.year));
      }
      if (values.grantAmount !== undefined && values.grantAmount !== null) {
        formData.append("grantAmount", String(values.grantAmount));
      }
      if (values.applicationPeriod) {
        formData.append("applicationPeriod", values.applicationPeriod);
      }

      if (values.challenge) formData.append("challenge", values.challenge.trim());
      if (values.approach) formData.append("approach", values.approach.trim());
      if (values.outcome) formData.append("outcome", values.outcome.trim());
      if (values.story) formData.append("story", values.story.trim());

      // Single cover image file upload
      const newCoverFile = coverFileList[0]?.originFileObj;
      if (newCoverFile) {
        formData.append("image", newCoverFile);
      }

      // Multi-image gallery uploads
      galleryFileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("gallery", file.originFileObj);
        }
      });

      onSubmit(formData);
    } catch {
      message.error("Please fill in all required fields before submitting.");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={780}
      centered
      destroyOnHidden
      title={
        <div className="flex items-center gap-2.5 font-display text-lg font-bold text-[#0B3D2E]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
            {isEdit ? <EditOutlined /> : <FolderAddOutlined />}
          </span>
          <span>{isEdit ? "Edit Project Details" : "Create New Community Project"}</span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        requiredMark="optional"
        preserve={true}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "basic",
              forceRender: true,
              label: (
                <span className="flex items-center gap-1.5 font-semibold">
                  <AppstoreOutlined />
                  <span>Overview & Funding</span>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  {/* Project Name */}
                  <Form.Item
                    name="name"
                    label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Project Name</span>}
                    rules={[{ required: true, message: "Project name is required" }]}
                  >
                    <Input
                      placeholder="e.g. Clean Water for Artibonite"
                      className="rounded-xl border-navy-700/60 py-2"
                    />
                  </Form.Item>

                  {/* Category, Location, Year */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Form.Item
                      name="category"
                      label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Category</span>}
                      rules={[{ required: true, message: "Category is required" }]}
                    >
                      <Select
                        className="w-full"
                        options={PROJECT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                      />
                    </Form.Item>

                    <Form.Item
                      name="location"
                      label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Location</span>}
                      rules={[{ required: true, message: "Location is required" }]}
                    >
                      <Input
                        placeholder="e.g. Saint-Marc, Artibonite"
                        className="rounded-xl border-navy-700/60 py-2"
                      />
                    </Form.Item>

                    <Form.Item
                      name="year"
                      label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Year Founded / Funded</span>}
                    >
                      <InputNumber
                        min={2000}
                        max={2100}
                        className="w-full rounded-xl border-navy-700/60 py-1"
                        placeholder="2026"
                      />
                    </Form.Item>
                  </div>

                  {/* Founder, Grant Amount, Grant Cycle */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Form.Item
                      name="founder"
                      label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Founder / Champion</span>}
                    >
                      <Input
                        placeholder="e.g. Jean-Pierre Baptiste"
                        className="rounded-xl border-navy-700/60 py-2"
                      />
                    </Form.Item>

                    <Form.Item
                      name="grantAmount"
                      label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Grant Amount ($ USD)</span>}
                    >
                      <InputNumber<number>
                        min={0}
                        step={100}
                        formatter={(value) => (value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "")}
                        parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0)}
                        className="w-full rounded-xl border-navy-700/60 py-1"
                        placeholder="$1,000"
                      />
                    </Form.Item>

                    <Form.Item
                      name="applicationPeriod"
                      label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Grant Cycle</span>}
                    >
                      <Select
                        placeholder="Select Associated Cycle"
                        allowClear
                        loading={isLoadingPeriods}
                        options={periodOptions}
                        className="w-full"
                      />
                    </Form.Item>
                  </div>

                  {/* Brief Description */}
                  <Form.Item
                    name="description"
                    label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Brief Summary</span>}
                    rules={[{ required: true, message: "Brief description is required" }]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Concise overview of what this project does and who it benefits..."
                      className="rounded-xl border-navy-700/60"
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "narrative",
              forceRender: true,
              label: (
                <span className="flex items-center gap-1.5 font-semibold">
                  <FileTextOutlined />
                  <span>Impact Narrative</span>
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <Form.Item
                    name="challenge"
                    label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">The Challenge (Problem Statement)</span>}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="What obstacle or community problem did this project address?"
                      className="rounded-xl border-navy-700/60"
                    />
                  </Form.Item>

                  <Form.Item
                    name="approach"
                    label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">The Approach (Solution & Technology)</span>}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="How was the solution implemented? What tools or methodologies were used?"
                      className="rounded-xl border-navy-700/60"
                    />
                  </Form.Item>

                  <Form.Item
                    name="outcome"
                    label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Outcome & Impact Metrics</span>}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Measurable results (e.g. Supplying 2,500 villagers with clean water daily...)"
                      className="rounded-xl border-navy-700/60"
                    />
                  </Form.Item>

                  <Form.Item
                    name="story"
                    label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Founder & Community Story</span>}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Personal quote, grassroots background, and inspirational journey of the founder..."
                      className="rounded-xl border-navy-700/60"
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "media",
              forceRender: true,
              label: (
                <span className="flex items-center gap-1.5 font-semibold">
                  <PictureOutlined />
                  <span>Media & Publishing</span>
                </span>
              ),
              children: (
                <div className="space-y-5 pt-2">
                  {/* Main Cover Image */}
                  <div className="rounded-2xl border border-navy-700/50 bg-navy-950/20 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                      Main Project Banner Photo
                    </div>
                    <p className="mt-0.5 text-xs text-mist-500">
                      High-resolution landscape photo for card covers and story header (JPG, PNG, WebP).
                    </p>

                    <div className="mt-3 flex flex-col sm:flex-row items-start gap-4">
                      {coverPreviewUrl ? (
                        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-navy-700/70 bg-black/5">
                          <img
                            src={coverPreviewUrl}
                            alt="Cover Preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCoverPreviewUrl(null);
                              setCoverFileList([]);
                            }}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600"
                            title="Remove image"
                          >
                            <DeleteOutlined className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-28 w-44 shrink-0 items-center justify-center rounded-xl border border-dashed border-navy-700/80 bg-white/60 text-mist-400">
                          <PictureOutlined className="text-3xl opacity-40" />
                        </div>
                      )}

                      <div className="flex-1">
                        <Upload
                          beforeUpload={(file) => {
                            if (!file.type.startsWith("image/")) {
                              message.error("Please select an image file");
                              return Upload.LIST_IGNORE;
                            }
                            setCoverPreviewUrl(URL.createObjectURL(file));
                            return false;
                          }}
                          fileList={coverFileList}
                          onChange={({ fileList }) => setCoverFileList(fileList.slice(-1))}
                          showUploadList={false}
                          maxCount={1}
                        >
                          <Button icon={<UploadOutlined />} className="rounded-xl">
                            {coverPreviewUrl ? "Replace Cover Image" : "Upload Cover Image"}
                          </Button>
                        </Upload>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Photo Gallery */}
                  <div className="rounded-2xl border border-navy-700/50 bg-navy-950/20 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-mist-600">
                      Project Photo Gallery (Up to 10 photos)
                    </div>
                    <p className="mt-0.5 text-xs text-mist-500">
                      Field implementation photos, beneficiaries, workshops, and milestones.
                    </p>

                    <div className="mt-3">
                      <Upload
                        listType="picture-card"
                        fileList={galleryFileList}
                        beforeUpload={(file) => {
                          if (!file.type.startsWith("image/")) {
                            message.error("Please upload image files only");
                            return Upload.LIST_IGNORE;
                          }
                          return false;
                        }}
                        onChange={({ fileList }) => setGalleryFileList(fileList.slice(0, 10))}
                        maxCount={10}
                      >
                        {galleryFileList.length < 10 && (
                          <div className="flex flex-col items-center gap-1 text-mist-500">
                            <UploadOutlined className="text-base" />
                            <span className="text-xs">Add Photo</span>
                          </div>
                        )}
                      </Upload>
                    </div>
                  </div>

                  {/* Publishing Status & Spotlight Switch */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Form.Item
                      name="status"
                      label={<span className="text-xs font-semibold uppercase tracking-wider text-mist-600">Publishing Status</span>}
                      rules={[{ required: true, message: "Status is required" }]}
                    >
                      <Select
                        className="w-full"
                        options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))}
                      />
                    </Form.Item>

                    <div className="flex items-center justify-between rounded-xl border border-navy-700/40 bg-white/60 p-3.5 mt-6">
                      <div>
                        <div className="text-xs font-semibold text-cloud-100">Featured Spotlight</div>
                        <div className="text-[11px] text-mist-500">Pin to public homepage and spotlight reels</div>
                      </div>
                      <Form.Item name="featured" valuePropName="checked" noStyle>
                        <Switch />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* Footer Controls */}
        <div className="mt-6 flex justify-end gap-2.5 border-t border-navy-700/40 pt-4">
          <Button onClick={onCancel} disabled={loading} className="rounded-xl">
            Cancel
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleFinish}
            className="btn-linear rounded-xl border-0 font-semibold"
          >
            {isEdit ? "Save Project Changes" : "Create Project"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
