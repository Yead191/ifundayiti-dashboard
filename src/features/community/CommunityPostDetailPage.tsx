import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Tag, Avatar, Spin, Tooltip, Image } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  LockOutlined,
  UnlockOutlined,
  HeartFilled,
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
  CheckOutlined,
  CopyOutlined,
  UserOutlined,
  SafetyCertificateFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useGetCommunityPostByIdQuery,
  useUpdateCommunityPostMutation,
  useDeleteCommunityPostMutation,
  useToggleCommunityPostLikeMutation,
} from "@/redux/features/community/communityApi";
import {
  COMMUNITY_STATUS_CONFIG,
  formatPostDateTime,
  getAuthorInfo,
} from "./communityHelpers";
import { CommunityDiscussionSection } from "./components/CommunityDiscussionSection";
import { DeleteCommunityPostModal } from "./components/DeleteCommunityPostModal";

export default function CommunityPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Query
  const {
    data: postRes,
    isLoading,
    isError,
    refetch,
  } = useGetCommunityPostByIdQuery(id || "", { skip: !id });

  // Mutations
  const [updatePost] = useUpdateCommunityPostMutation();
  const [deletePost, { isLoading: isDeleting }] =
    useDeleteCommunityPostMutation();
  const [toggleLike, { isLoading: isTogglingLike }] =
    useToggleCommunityPostLikeMutation();

  const post = postRes?.data;

  // Local optimistic like states
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <GlassCard className="p-12 text-center">
        <EmptyState
          title="Announcement Not Found"
          description="The announcement you are looking for does not exist or has been deleted."
          actionLabel="← Back to Community Forum"
          onAction={() => navigate("/community")}
        />
      </GlassCard>
    );
  }

  const effectiveLiked = isLiked !== null ? isLiked : Boolean(post.isLikedByMe);
  const effectiveLikesCount =
    likeCount !== null ? likeCount : post.totalLikes || 0;

  const author = getAuthorInfo(post.author);
  const statusCfg =
    COMMUNITY_STATUS_CONFIG[post.status] || COMMUNITY_STATUS_CONFIG.published;
  const isAdminAuthor =
    author.role === "SUPER_ADMIN" || author.role === "ADMIN";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleLike = async () => {
    if (isTogglingLike) return;
    const nextLiked = !effectiveLiked;
    setIsLiked(nextLiked);
    setLikeCount(
      nextLiked
        ? effectiveLikesCount + 1
        : Math.max(0, effectiveLikesCount - 1),
    );

    try {
      const res = await toggleLike(post._id).unwrap();
      if (res?.data) {
        setIsLiked(res.data.liked);
        setLikeCount(res.data.totalLikes);
      }
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount(
        !nextLiked
          ? effectiveLikesCount + 1
          : Math.max(0, effectiveLikesCount - 1),
      );
      toast.error("Failed to update like");
    }
  };

  const handleTogglePin = async () => {
    try {
      await updatePost({
        id: post._id,
        data: { isPinned: !post.isPinned },
      }).unwrap();
      toast.success(
        post.isPinned ? "Announcement unpinned" : "Announcement pinned to top",
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update pin status");
    }
  };

  const handleToggleLock = async () => {
    try {
      await updatePost({
        id: post._id,
        data: { isLocked: !post.isLocked },
      }).unwrap();
      toast.success(
        post.isLocked
          ? "Discussion unlocked"
          : "Discussion locked (comments closed)",
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update lock status");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePost(post._id).unwrap();
      toast.success("Announcement deleted successfully");
      navigate("/community");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/community")}
            className="h-10 w-10 rounded-xl text-gray-500 hover:text-gray-900"
          />
          <div>
            <div className="flex items-center gap-2 text-xs text-mist-600">
              <Link
                to="/community"
                className="hover:text-[#0B3D2E] transition-colors"
              >
                Community Forum
              </Link>
              <span>/</span>
              <span className="text-gray-400">Discussion</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-cloud-100 mt-0.5">
              {post.title || "Announcement Details"}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip title={post.isPinned ? "Unpin from top" : "Pin to feed top"}>
            <Button
              icon={
                post.isPinned ? (
                  <StarFilled className="text-amber-500" />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={handleTogglePin}
              className="h-10 rounded-xl px-3 font-medium"
            >
              {post.isPinned ? "Pinned" : "Pin"}
            </Button>
          </Tooltip>

          <Tooltip
            title={
              post.isLocked
                ? "Unlock discussion (open comments)"
                : "Lock discussion (close comments)"
            }
          >
            <Button
              icon={
                post.isLocked ? (
                  <LockOutlined className="text-amber-600" />
                ) : (
                  <UnlockOutlined />
                )
              }
              onClick={handleToggleLock}
              className="h-10 rounded-xl px-3 font-medium"
            >
              {post.isLocked ? "Locked" : "Lock"}
            </Button>
          </Tooltip>

          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/community/edit/${post._id}`)}
            className="h-10 rounded-xl px-4 font-medium"
          >
            Edit
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalOpen(true)}
            className="h-10 rounded-xl px-4 font-medium hover:bg-rose-50"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Post Card */}
      <GlassCard className="p-6 sm:p-8 border border-gray-200/80 bg-white space-y-6">
        {/* Post Metadata Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <Avatar
              src={author.image ? getImageUrl(author.image) : undefined}
              icon={<UserOutlined />}
              size={48}
              className="bg-emerald-100 text-[#0B3D2E] border border-emerald-300 ring-2 ring-emerald-50 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-gray-900">
                  {author.name}
                </span>
                {isAdminAuthor && (
                  <Tag
                    bordered={false}
                    className="rounded-full text-[10px] font-bold px-2 py-0 m-0 bg-emerald-50 text-[#0B3D2E] border border-emerald-200/80 flex items-center gap-1"
                  >
                    <SafetyCertificateFilled className="text-[10px]" />
                    <span>Official Admin</span>
                  </Tag>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <CalendarOutlined />
                <span>{formatPostDateTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.isPinned && (
              <Tag
                bordered={false}
                className="rounded-full text-xs font-bold px-2.5 py-0.5 m-0 bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1"
              >
                <StarFilled className="text-amber-500" />
                <span>PINNED</span>
              </Tag>
            )}

            {post.isLocked && (
              <Tag
                bordered={false}
                className="rounded-full text-xs font-bold px-2.5 py-0.5 m-0 bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
              >
                <LockOutlined />
                <span>LOCKED</span>
              </Tag>
            )}

            <Tag
              bordered={false}
              className={`rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 border ${statusCfg.badgeBg} ${statusCfg.textColor} ${statusCfg.borderColor}`}
            >
              {statusCfg.label}
            </Tag>
          </div>
        </div>

        {/* Post Title */}
        {post.title && (
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
            {post.title}
          </h2>
        )}

        {/* Post Rich Content */}
        <div
          className="prose prose-emerald max-w-none text-gray-700 text-sm sm:text-base leading-relaxed wrap-break-word"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Attached Images Grid / Lightbox */}
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Attached Media ({post.images.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Image.PreviewGroup>
                {post.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative h-48 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs group"
                  >
                    <Image
                      src={getImageUrl(imgUrl)}
                      alt={`Attachment ${idx + 1}`}
                      className="h-full w-full object-cover"
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </Image.PreviewGroup>
            </div>
          </div>
        )}

        {/* Engagement Interaction Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                effectiveLiked
                  ? "bg-rose-50 text-rose-600 border-rose-200 shadow-2xs"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:text-rose-600 hover:bg-rose-50/50"
              }`}
            >
              {effectiveLiked ? (
                <HeartFilled className="text-rose-500 text-base animate-in zoom-in-75" />
              ) : (
                <HeartOutlined className="text-base" />
              )}
              <span>{effectiveLikesCount}</span>
              <span className="font-normal text-xs text-gray-400">
                {effectiveLikesCount === 1 ? "like" : "likes"}
              </span>
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700 border border-gray-200">
              <MessageOutlined className="text-base text-indigo-600" />
              <span>{post.totalComments || 0}</span>
              <span className="font-normal text-xs text-gray-400">
                {(post.totalComments || 0) === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip
              title={copiedLink ? "Link copied" : "Share announcement link"}
            >
              <Button
                icon={
                  copiedLink ? (
                    <CheckOutlined className="text-emerald-600" />
                  ) : (
                    <CopyOutlined />
                  )
                }
                onClick={handleCopyLink}
                className="h-10 rounded-xl px-4 font-medium"
              >
                {copiedLink ? "Copied" : "Copy Link"}
              </Button>
            </Tooltip>
          </div>
        </div>
      </GlassCard>

      {/* Discussion & Nested Replies Moderation Section */}
      <CommunityDiscussionSection
        postId={post._id}
        isLocked={post.isLocked}
        totalComments={post.totalComments}
      />

      {/* Danger Deletion Modal */}
      <DeleteCommunityPostModal
        open={deleteModalOpen}
        post={post}
        loading={isDeleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
