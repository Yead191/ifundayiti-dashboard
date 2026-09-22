import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Input,
  Button,
  Switch,
  Segmented,
  Tooltip,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  StarFilled,
  LockOutlined,
  CheckCircleFilled,
  SoundOutlined,
  InboxOutlined,
  PictureOutlined,
  SaveOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useGetCommunityPostByIdQuery,
  useCreateCommunityPostMutation,
  useUpdateCommunityPostMutation,
} from "@/redux/features/community/communityApi";
import {
  COMMUNITY_STATUS,
  type CommunityStatus,
} from "@/redux/features/community/community.types";

interface ImageItem {
  id: string;
  url?: string;
  file?: File;
  isExisting?: boolean;
}

export default function CommunityPostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: existingPostRes, isLoading: isLoadingPost } =
    useGetCommunityPostByIdQuery(id || "", { skip: !isEditing });

  const [createPost, { isLoading: isCreating }] = useCreateCommunityPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateCommunityPostMutation();
  const isSubmitting = isCreating || isUpdating;

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<CommunityStatus>(COMMUNITY_STATUS.PUBLISHED);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Images state
  const [imagesList, setImagesList] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prepopulate form in edit mode
  useEffect(() => {
    if (isEditing && existingPostRes?.data) {
      const post = existingPostRes.data;
      setTitle(post.title || "");
      setContent(post.content || "");
      setStatus(post.status || COMMUNITY_STATUS.PUBLISHED);
      setIsPinned(Boolean(post.isPinned));
      setIsLocked(Boolean(post.isLocked));

      if (Array.isArray(post.images) && post.images.length > 0) {
        setImagesList(
          post.images.map((imgUrl, index) => ({
            id: `existing-${index}-${imgUrl}`,
            url: imgUrl,
            isExisting: true,
          }))
        );
      }
    }
  }, [isEditing, existingPostRes]);

  // Handle image files selection
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImagesList((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (idToRemove: string) => {
    setImagesList((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  // Submit Handler
  const handleSubmit = async (targetStatus?: CommunityStatus) => {
    const finalStatus = targetStatus || status;

    if (!content.trim() || content === "<p></p>") {
      toast.error("Announcement content is required");
      return;
    }

    try {
      const newFiles = imagesList.filter((item) => item.file).map((item) => item.file!);
      const existingUrls = imagesList.filter((item) => item.isExisting && item.url).map((item) => item.url!);

      if (newFiles.length > 0) {
        // Use Multipart FormData
        const formData = new FormData();
        const metaData = {
          title: title.trim() || undefined,
          content: content.trim(),
          images: existingUrls,
          isPinned,
          isLocked,
          status: finalStatus,
        };

        formData.append("data", JSON.stringify(metaData));
        newFiles.forEach((file) => {
          formData.append("images", file);
        });

        if (isEditing && id) {
          await updatePost({ id, data: formData }).unwrap();
          toast.success("Announcement updated successfully");
        } else {
          const res = await createPost(formData).unwrap();
          toast.success("Announcement broadcasted successfully");
          navigate(`/community/${res.data._id}`);
          return;
        }
      } else {
        // Use standard JSON payload
        const payload = {
          title: title.trim() || undefined,
          content: content.trim(),
          images: existingUrls,
          isPinned,
          isLocked,
          status: finalStatus,
        };

        if (isEditing && id) {
          await updatePost({ id, data: payload }).unwrap();
          toast.success("Announcement updated successfully");
        } else {
          const res = await createPost(payload).unwrap();
          toast.success("Announcement published successfully");
          navigate(`/community/${res.data._id}`);
          return;
        }
      }

      navigate(`/community/${id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save announcement");
    }
  };

  if (isEditing && isLoadingPost) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(isEditing ? `/community/${id}` : "/community")}
            className="h-10 w-10 rounded-xl text-gray-500 hover:text-gray-900"
          />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-cloud-100">
              {isEditing ? "Edit Community Announcement" : "Create Community Announcement"}
            </h1>
            <p className="text-xs sm:text-sm text-mist-600 mt-0.5">
              Draft official messages, attach images, and broadcast updates to verified members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate("/community")}
            className="h-10 rounded-xl px-4 font-medium"
          >
            Cancel
          </Button>

          <Button
            onClick={() => handleSubmit(COMMUNITY_STATUS.DRAFT)}
            loading={isSubmitting}
            icon={<SaveOutlined />}
            className="h-10 rounded-xl px-4 font-medium"
          >
            Save Draft
          </Button>

          <Button
            type="primary"
            loading={isSubmitting}
            onClick={() => handleSubmit(COMMUNITY_STATUS.PUBLISHED)}
            icon={<SendOutlined />}
            className="h-10 rounded-xl px-5 font-semibold bg-[#0B3D2E]! hover:bg-[#082e23]! border-0 shadow-sm"
          >
            {isEditing ? "Update & Save" : "Publish & Broadcast"}
          </Button>
        </div>
      </div>

      {/* Two-Column Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Title, Editor, and Images */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title Input */}
          <GlassCard className="p-4 sm:p-6 border border-gray-200/80 bg-white space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Headline / Title <span className="text-gray-400 font-normal">(Optional but recommended)</span>
            </label>
            <Input
              size="large"
              placeholder="e.g., Welcome to the Official iFundAyiti Community Discussion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl font-display font-semibold text-base sm:text-lg"
            />
          </GlassCard>

          {/* Content Editor */}
          <GlassCard className="p-4 sm:p-6 border border-gray-200/80 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Announcement Content <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-gray-400">Rich text & formatted HTML supported</span>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <TiptapEditor
                value={content}
                onChange={setContent}
                placeholder="Share instructions, progress updates, guidelines, or announcements with community members..."
                minHeight="340px"
              />
            </div>
          </GlassCard>

          {/* Multi-Image Attachments */}
          <GlassCard className="p-4 sm:p-6 border border-gray-200/80 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Attached Media & Images
                </label>
                <p className="text-xs text-gray-400 m-0">
                  Upload multiple photos to display in an interactive grid or lightbox gallery.
                </p>
              </div>

              <Button
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl text-xs font-medium"
              >
                Attach Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelect}
                className="hidden"
              />
            </div>

            {imagesList.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-[#0B3D2E] hover:bg-emerald-50/20 transition-all"
              >
                <PictureOutlined className="text-3xl text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-700 m-0">
                  Drag and drop images here, or click to browse
                </p>
                <span className="text-[11px] text-gray-400">
                  Supports PNG, JPG, WEBP formats
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {imagesList.map((item) => {
                  const displaySrc = item.url
                    ? item.isExisting
                      ? getImageUrl(item.url)
                      : item.url
                    : "";

                  return (
                    <div
                      key={item.id}
                      className="group relative h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs"
                    >
                      <img
                        src={displaySrc}
                        alt="Attachment"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Tooltip title="Remove photo">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(item.id)}
                            className="h-8 w-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-sm"
                          >
                            <DeleteOutlined className="text-xs" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Sidebar: Settings, Broadcast Notice, & Actions */}
        <div className="space-y-5">
          {/* Publication Status Card */}
          <GlassCard className="p-4 sm:p-5 border border-gray-200/80 bg-white space-y-4">
            <h3 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wider">
              Publication Settings
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Publish Status</label>
              <Segmented
                block
                value={status}
                onChange={(val) => setStatus(val as CommunityStatus)}
                className="p-1 rounded-xl bg-gray-100 font-medium"
                options={[
                  { value: COMMUNITY_STATUS.PUBLISHED, label: "Published" },
                  { value: COMMUNITY_STATUS.DRAFT, label: "Draft" },
                  { value: COMMUNITY_STATUS.ARCHIVED, label: "Archived" },
                ]}
              />
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-4">
              {/* Pin to feed switch */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <StarFilled className="text-amber-500" />
                    <span>Pin Announcement</span>
                  </div>
                  <p className="text-[11px] text-gray-400 m-0">
                    Pins this thread to the very top of the community feed.
                  </p>
                </div>
                <Switch
                  checked={isPinned}
                  onChange={setIsPinned}
                  className="bg-gray-200"
                />
              </div>

              {/* Lock discussion switch */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <LockOutlined className="text-amber-600" />
                    <span>Lock Discussion</span>
                  </div>
                  <p className="text-[11px] text-gray-400 m-0">
                    Members can read and react, but cannot post comments.
                  </p>
                </div>
                <Switch
                  checked={isLocked}
                  onChange={setIsLocked}
                  className="bg-gray-200"
                />
              </div>
            </div>
          </GlassCard>

          {/* Broadcast Dispatch Notice Card */}
          <div className="rounded-2xl border border-emerald-200/90 bg-linear-to-b from-emerald-50/90 to-teal-50/50 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
              <SoundOutlined className="text-base text-[#0B3D2E]" />
              <span>Broadcast Preview</span>
            </div>

            <p className="text-xs text-emerald-950/80 leading-relaxed m-0">
              When saved as <strong>Published</strong>, this announcement will trigger:
            </p>

            <div className="space-y-2 text-xs text-emerald-900">
              <div className="flex items-center gap-2 rounded-xl bg-white/70 p-2 border border-emerald-200/50">
                <ThunderboltOutlined className="text-emerald-700 text-sm shrink-0" />
                <span>Real-time in-app socket push notifications to all users.</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/70 p-2 border border-emerald-200/50">
                <CheckCircleFilled className="text-emerald-700 text-sm shrink-0" />
                <span>Branded email notification delivered to verified members.</span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <GlassCard className="p-4 sm:p-5 border border-gray-200/80 bg-white space-y-2.5">
            <Button
              block
              size="large"
              type="primary"
              loading={isSubmitting}
              onClick={() => handleSubmit(COMMUNITY_STATUS.PUBLISHED)}
              icon={<SendOutlined />}
              className="h-11 rounded-xl font-semibold bg-[#0B3D2E]! hover:bg-[#082e23]! border-0 shadow-sm"
            >
              {isEditing ? "Save & Update Post" : "Publish & Broadcast Now"}
            </Button>

            <Button
              block
              size="large"
              loading={isSubmitting}
              onClick={() => handleSubmit(COMMUNITY_STATUS.DRAFT)}
              icon={<SaveOutlined />}
              className="h-11 rounded-xl font-medium border-gray-200"
            >
              Save as Draft
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
