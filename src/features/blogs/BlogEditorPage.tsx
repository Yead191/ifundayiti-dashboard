import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Input,
  Select,
  Button,
  Switch,
  Segmented,
  Tooltip,
  Modal,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  StarFilled,
  PlusOutlined,
  CodeOutlined,
  EyeOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  InboxOutlined,
  FileTextOutlined,
  FolderAddOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { toFileUrl } from "@/config";
import {
  useGetBlogByIdOrSlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGetBlogCategoriesQuery,
} from "@/redux/features/blogs/blogsApi";
import { BLOG_STATUS } from "@/redux/features/blogs/blogs.types";
import { getCategoryId } from "./blogHelpers";
import { BlogCategoryModal } from "./components/BlogCategoryModal";

export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  // Queries
  const { data: categoriesRes } = useGetBlogCategoriesQuery();
  const {
    data: existingBlogRes,
    isLoading: isLoadingExisting,
  } = useGetBlogByIdOrSlugQuery(id || "", {
    skip: !isEditing,
  });

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const isSubmitting = isCreating || isUpdating;

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<string>(BLOG_STATUS.PUBLISHED);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Cover image states
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category creation mini modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Raw HTML Source Code Modal state
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [rawHtmlDraft, setRawHtmlDraft] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (isEditing && existingBlogRes?.data) {
      const blog = existingBlogRes.data;
      setTitle(blog.title || "");
      setContent(blog.content || "");
      setCategoryId(getCategoryId(blog.category));
      setStatus(blog.status || BLOG_STATUS.PUBLISHED);
      setIsFeatured(Boolean(blog.isFeatured));
      setTags(blog.tags || []);
      if (blog.image) {
        setCoverPreview(toFileUrl(blog.image) || null);
      }
    }
  }, [isEditing, existingBlogRes]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const categories = categoriesRes?.data || [];

  // File Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be under 15MB");
      return;
    }

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      toast.warning("Tag already added");
      return;
    }
    setTags([...tags, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Submit Handler
  const handleSave = async (submitStatus?: string) => {
    if (!title.trim()) {
      toast.error("Please provide an article title");
      return;
    }

    if (!content.trim() || content === "<p></p>") {
      toast.error("Please write the story content");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    const effectiveStatus = submitStatus || status;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content);
    formData.append("category", categoryId);
    formData.append("status", effectiveStatus);
    formData.append("isFeatured", String(isFeatured));

    if (tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }

    if (coverFile) {
      formData.append("image", coverFile);
    }

    try {
      if (isEditing && id) {
        await updateBlog({ id, body: formData }).unwrap();
        toast.success("Article updated successfully");
        navigate(`/blogs/${id}`);
      } else {
        const res = await createBlog(formData).unwrap();
        toast.success("Article published successfully");
        if (res.data?._id) {
          navigate(`/blogs/${res.data._id}`);
        } else {
          navigate("/blogs");
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save article");
    }
  };

  if (isEditing && isLoadingExisting) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/blogs"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-800 hover:border-emerald-600 transition-colors shadow-2xs"
          >
            <ArrowLeftOutlined className="text-sm" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-cloud-100">
              {isEditing ? "Edit Article" : "Write New Article"}
            </h1>
            <p className="text-xs text-mist-500">
              {isEditing
                ? "Update story content, cover photo, and publication status"
                : "Create an editorial piece with rich formatted content, images, and category"}
            </p>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate("/blogs")}
            disabled={isSubmitting}
            className="h-10 rounded-xl px-4 font-medium"
          >
            Cancel
          </Button>

          <Button
            onClick={() => handleSave(BLOG_STATUS.DRAFT)}
            loading={isSubmitting}
            className="h-10 rounded-xl px-4 font-medium border-gray-200 hover:border-amber-400 text-gray-700"
          >
            Save as Draft
          </Button>

          <Button
            type="primary"
            onClick={() => handleSave(BLOG_STATUS.PUBLISHED)}
            loading={isSubmitting}
            className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold px-5 border-0 shadow-sm"
          >
            {isEditing ? "Save & Publish" : "Publish Article"}
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Editorial Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title Card */}
          <GlassCard className="p-5 sm:p-7">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-mist-500">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging, descriptive headline..."
                className="w-full font-display text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 placeholder:text-gray-300 border-0 focus:outline-hidden bg-transparent pt-1"
                autoFocus={!isEditing}
              />
            </div>
          </GlassCard>

          {/* Rich Content Editor Card */}
          <GlassCard className="p-5 sm:p-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-mist-500">
                  Story Content <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-mist-400">
                  Format headings, insert high-res images, bullet points, blockquotes, and links.
                </p>
              </div>

              {/* Edit Raw HTML Source Action */}
              <Tooltip title="View or Paste Raw HTML markup directly">
                <Button
                  size="small"
                  icon={<CodeOutlined />}
                  onClick={() => {
                    setRawHtmlDraft(content);
                    setHtmlModalOpen(true);
                  }}
                  className="rounded-lg text-xs font-semibold border-gray-200 text-emerald-800 hover:border-emerald-600"
                >
                  HTML Source
                </Button>
              </Tooltip>
            </div>

            {/* Tiptap Rich Editor */}
            <div className="pt-1">
              <TiptapEditor
                value={content}
                onChange={setContent}
                placeholder="Begin writing the story narrative, interview, or field dispatch here..."
                minHeight={420}
              />
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Publishing Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Cover Image Upload Card */}
          <GlassCard className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-mist-500">
                Cover Photo
              </label>
              {coverPreview && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="text-xs font-medium text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>

            {coverPreview ? (
              <div className="space-y-2.5">
                <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-gray-200 shadow-xs">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl text-xs font-medium h-9"
                >
                  Change Cover Image
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-6 text-center transition-all hover:border-[#0B3D2E] hover:bg-emerald-50/20 cursor-pointer"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-xs text-gray-400 group-hover:text-[#0B3D2E] transition-colors mb-2">
                  <UploadOutlined className="text-lg" />
                </div>
                <p className="text-xs font-bold text-gray-700 group-hover:text-[#0B3D2E] transition-colors">
                  Upload Cover Photo
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  JPG, PNG, WEBP up to 15MB. 16:9 ratio recommended.
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </GlassCard>

          {/* Publishing Settings Card */}
          <GlassCard className="p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gray-400">
              Publishing Settings
            </h3>

            {/* Category Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <PlusOutlined className="text-[10px]" />
                  <span>New Category</span>
                </button>
              </div>

              <Select
                value={categoryId || undefined}
                onChange={setCategoryId}
                placeholder="Select blog category..."
                className="w-full h-10"
                options={categories.map((c) => ({
                  value: c._id,
                  label: c.name,
                }))}
              />
            </div>

            {/* Publishing Status Field */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700">
                Publication Status
              </label>
              <Segmented
                value={status}
                onChange={(val) => setStatus(val as string)}
                block
                className="w-full p-1 rounded-xl bg-gray-100 font-medium [&_.ant-segmented-item]:flex-1 [&_.ant-segmented-item-label]:flex [&_.ant-segmented-item-label]:items-center [&_.ant-segmented-item-label]:justify-center [&_.ant-segmented-item-label]:gap-1.5 [&_.ant-segmented-item-label]:w-full [&_.ant-segmented-item-label]:text-center"
                options={[
                  {
                    value: BLOG_STATUS.DRAFT,
                    icon: <ClockCircleFilled className="text-amber-500 text-xs" />,
                    label: <span className="text-xs font-medium text-gray-700">Draft</span>,
                  },
                  {
                    value: BLOG_STATUS.PUBLISHED,
                    icon: <CheckCircleFilled className="text-emerald-600 text-xs" />,
                    label: <span className="text-xs font-semibold text-emerald-800">Published</span>,
                  },
                  {
                    value: BLOG_STATUS.ARCHIVED,
                    icon: <InboxOutlined className="text-slate-500 text-xs" />,
                    label: <span className="text-xs font-medium text-slate-600">Archived</span>,
                  },
                ]}
              />
            </div>

            {/* Spotlight Toggle */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-xs text-gray-800">
                  <StarFilled className="text-amber-500 text-xs" />
                  <span>Feature in Spotlight</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Pin article on public homepage and hero magazine spotlight.
                </p>
              </div>
              <Switch
                checked={isFeatured}
                onChange={setIsFeatured}
              />
            </div>

            {/* Tags Field */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700">
                Article Tags
              </label>

              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="Type tag (e.g. Healthcare)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    handleAddTag();
                  }}
                  className="h-9 rounded-xl text-xs"
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  className="h-9 rounded-xl text-xs px-3 font-semibold"
                >
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-xs font-medium"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Bottom Sticky Action Card */}
          <GlassCard className="p-5 sm:p-6 space-y-2.5">
            <Button
              type="primary"
              onClick={() => handleSave(status)}
              loading={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold text-sm border-0 shadow-sm"
            >
              {isEditing ? "Save Changes" : "Publish Article"}
            </Button>

            <Button
              onClick={() => handleSave(BLOG_STATUS.DRAFT)}
              loading={isSubmitting}
              className="w-full h-10 rounded-xl font-medium border-gray-200"
            >
              Save as Draft
            </Button>
          </GlassCard>
        </div>
      </div>

      {/* Mini Modal: Create Category */}
      <BlogCategoryModal
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        onSuccess={(newCat) => {
          if (newCat?._id) {
            setCategoryId(newCat._id);
          }
        }}
      />

      {/* Raw HTML Source Code Editor Modal */}
      <Modal
        open={htmlModalOpen}
        onCancel={() => setHtmlModalOpen(false)}
        onOk={() => {
          setContent(rawHtmlDraft);
          setHtmlModalOpen(false);
          toast.success("Content updated from HTML source");
        }}
        okText="Apply HTML Changes"
        cancelText="Cancel"
        okButtonProps={{ className: "bg-[#0B3D2E]! font-medium" }}
        title="Direct HTML Source Code Editor"
        width={760}
        destroyOnClose
        centered
        className="rounded-3xl"
      >
        <div className="space-y-3 py-2">
          <p className="text-xs text-gray-500">
            You can inspect, paste, or tweak raw HTML markup. Changes will sync immediately with the rich editor canvas.
          </p>
          <textarea
            value={rawHtmlDraft}
            onChange={(e) => setRawHtmlDraft(e.target.value)}
            rows={14}
            className="w-full font-mono text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]"
            placeholder="<p>Paste or write HTML markup here...</p>"
          />
        </div>
      </Modal>
    </div>
  );
}
