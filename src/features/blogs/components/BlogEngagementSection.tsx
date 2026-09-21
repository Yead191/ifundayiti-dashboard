import { useState, useMemo } from "react";
import { Button, Input, Avatar, Tag, Popconfirm, Spin, Tooltip } from "antd";
import {
  HeartFilled,
  HeartOutlined,
  MessageOutlined,
  SendOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { toFileUrl } from "@/config";
import {
  useGetBlogCommentsQuery,
  useCreateBlogCommentMutation,
  useDeleteBlogCommentMutation,
  useGetBlogLikesQuery,
  useToggleBlogLikeMutation,
} from "@/redux/features/blogs/blogsApi";
import type {
  IBlogComment,
  IBlogLikeUser,
  IBlogLike,
} from "@/redux/features/blogs/blogs.types";
import { formatBlogDateTime, formatRelativeTime } from "../blogHelpers";

interface BlogEngagementSectionProps {
  blogId: string;
  blogSlug?: string;
  totalLikes?: number;
  totalComments?: number;
  isLikedByMe?: boolean;
  initialTab?: "comments" | "likes";
  embedded?: boolean;
}

export function BlogEngagementSection({
  blogId,
  blogSlug,
  totalLikes: initialLikes = 0,
  totalComments: initialComments = 0,
  isLikedByMe: initialIsLikedByMe = false,
  initialTab = "comments",
  embedded = false,
}: BlogEngagementSectionProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "likes">(initialTab);
  const [commentText, setCommentText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  // Queries
  const {
    data: commentsRes,
    isLoading: isLoadingComments,
    isFetching: isFetchingComments,
    refetch: refetchComments,
  } = useGetBlogCommentsQuery({ blogIdOrSlug: blogId }, { skip: !blogId });

  const {
    data: likesRes,
    isLoading: isLoadingLikes,
    isFetching: isFetchingLikes,
    refetch: refetchLikes,
  } = useGetBlogLikesQuery({ blogIdOrSlug: blogId }, { skip: !blogId });

  // Mutations
  const [createComment, { isLoading: isSubmittingComment }] =
    useCreateBlogCommentMutation();
  const [deleteComment] = useDeleteBlogCommentMutation();
  const [toggleLike, { isLoading: isTogglingLike }] =
    useToggleBlogLikeMutation();

  // Local optimistic like states
  const [hasLiked, setHasLiked] = useState<boolean>(initialIsLikedByMe);
  const [likeCount, setLikeCount] = useState<number>(initialLikes);

  // Parse comments safely from varied backend response wrappers
  const comments: IBlogComment[] = useMemo(() => {
    const raw = commentsRes?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      const anyObj = raw as any;
      if (Array.isArray(anyObj.comments)) return anyObj.comments;
      if (Array.isArray(anyObj.data)) return anyObj.data;
    }
    return [];
  }, [commentsRes]);

  // Parse likes safely
  const likesList: { user: IBlogLikeUser; createdAt?: string }[] =
    useMemo(() => {
      const raw = likesRes?.data;
      const array = Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object" && Array.isArray((raw as any).data)
          ? (raw as any).data
          : [];

      return array.map((item: any) => {
        // Could be { user: { ... }, createdAt } or directly user object { _id, name, ... }
        if (item && item.user && typeof item.user === "object") {
          return {
            user: item.user,
            createdAt: item.createdAt,
          };
        }
        return {
          user: item,
          createdAt: item?.createdAt,
        };
      });
    }, [likesRes]);

  const commentsCount = commentsRes?.pagination?.total ?? comments.length;
  const currentLikeCount =
    likesRes?.pagination?.total ?? likesList.length ?? likeCount;

  // Handle Add Comment
  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text) {
      toast.error("Please enter comment text before submitting");
      return;
    }

    try {
      await createComment({
        blogIdOrSlug: blogId || blogSlug || "",
        text,
      }).unwrap();
      setCommentText("");
      toast.success("Comment posted successfully!");
      refetchComments();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to post comment",
      );
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment({
        commentId,
        blogIdOrSlug: blogId,
      }).unwrap();
      toast.success("Comment deleted successfully");
      refetchComments();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to delete comment",
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Handle Toggle Like
  const handleToggleLike = async () => {
    try {
      const res = await toggleLike({
        blogIdOrSlug: blogId || blogSlug || "",
      }).unwrap();
      const liked = res?.data?.liked ?? !hasLiked;
      const total =
        res?.data?.totalLikes ??
        (liked ? likeCount + 1 : Math.max(0, likeCount - 1));
      setHasLiked(liked);
      setLikeCount(total);
      refetchLikes();
      if (liked) {
        toast.success("Liked article!");
      } else {
        toast.info("Removed like");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle like");
    }
  };

  const getRoleBadge = (role?: string) => {
    const upper = (role || "").toUpperCase();
    if (upper === "SUPER_ADMIN" || upper === "ADMIN") {
      return (
        <span className="rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
          Admin
        </span>
      );
    }
    if (upper === "VENDOR") {
      return (
        <span className="rounded-md bg-purple-100/80 px-1.5 py-0.5 text-[9px] font-bold text-purple-800 uppercase tracking-wider">
          Vendor
        </span>
      );
    }
    return (
      <span className="rounded-md bg-gray-200/70 px-1.5 py-0.5 text-[9px] font-semibold text-gray-600 uppercase tracking-wider">
        Community
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Engagement Bar & Tab Switcher */}
      <div className="flex items-center justify-between gap-2">
        {/* Tab Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100/80">
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "comments"
                ? "bg-white text-[#0B3D2E] shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <MessageOutlined className="text-xs" />
            <span className="hidden 2xl:flex">Comments</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeTab === "comments"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-200/70 text-gray-600"
              }`}
            >
              {commentsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("likes")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "likes"
                ? "bg-white text-rose-600 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <HeartFilled className="text-rose-500 text-xs" />
            <span className="hidden 2xl:flex">Likes</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeTab === "likes"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-gray-200/70 text-gray-600"
              }`}
            >
              {currentLikeCount}
            </span>
          </button>
        </div>

        {/* Quick Like Action Button */}
        <Tooltip title={hasLiked ? "Unlike article" : "Like this article"}>
          <Button
            onClick={handleToggleLike}
            loading={isTogglingLike}
            size="small"
            className={`h-7.5 rounded-lg font-semibold text-xs transition-all border-0 ${
              hasLiked
                ? "bg-rose-50! text-rose-600! hover:bg-rose-100!"
                : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600"
            }`}
            icon={
              hasLiked ? (
                <HeartFilled className="text-rose-500 text-xs" />
              ) : (
                <HeartOutlined className="text-xs" />
              )
            }
          >
            {/* {hasLiked ? "Liked" : "Like"} */}
          </Button>
        </Tooltip>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMMENTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          {/* Add Comment Box */}
          <div className="rounded-2xl bg-gray-50/80 p-3.5 space-y-2 transition-all focus-within:bg-white focus-within:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">
                Post comment / note
              </span>
              <span className="text-[10px] text-gray-400">
                Visible to readers
              </span>
            </div>

            <Input.TextArea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              rows={2}
              placeholder="Write an editorial reply or comment..."
              maxLength={1000}
              variant="borderless"
              className="bg-transparent text-xs p-0 focus:bg-transparent"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-400">
                Press{" "}
                <kbd className="rounded bg-gray-200/60 px-1 py-0.5 text-[9px] text-gray-600">
                  Ctrl+Enter
                </kbd>
              </span>

              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                loading={isSubmittingComment}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="h-7.5 rounded-lg bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold px-3 text-xs border-0 shadow-xs"
              >
                Post
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-gray-400 px-0.5">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Comments ({commentsCount})
              </span>
              {isFetchingComments && (
                <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                  <Spin size="small" />
                </span>
              )}
            </div>

            {isLoadingComments ? (
              <div className="flex h-28 items-center justify-center">
                <Spin tip="Loading comments..." />
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-2xl bg-gray-50/60 p-6 text-center space-y-1.5">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <MessageOutlined className="text-sm" />
                </div>
                <h4 className="font-display text-xs font-bold text-gray-700">
                  No comments yet
                </h4>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Be the first to share your thoughts or post a comment.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {comments.map((comment) => {
                  const author = comment.author || ({} as any);
                  const authorName = author.name || "Community Member";
                  const authorAvatar = author.image
                    ? toFileUrl(author.image)
                    : null;
                  const isDeletingThis = deletingCommentId === comment._id;

                  return (
                    <div
                      key={comment._id}
                      className="group relative rounded-2xl bg-gray-50/80 hover:bg-gray-100/70 p-3 transition-all space-y-1.5"
                    >
                      {/* Comment Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            src={authorAvatar || undefined}
                            icon={!authorAvatar && <UserOutlined />}
                            size={28}
                            className="shrink-0 bg-emerald-100 text-emerald-800 text-xs font-bold border-0"
                          >
                            {!authorAvatar &&
                              authorName.charAt(0).toUpperCase()}
                          </Avatar>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-gray-900 truncate">
                                {authorName}
                              </span>
                              {getRoleBadge(author.role)}
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                              <Tooltip
                                title={formatBlogDateTime(comment.createdAt)}
                              >
                                <span className="hover:text-gray-600">
                                  {formatRelativeTime(comment.createdAt)}
                                </span>
                              </Tooltip>
                            </div>
                          </div>
                        </div>

                        {/* Delete Comment Button */}
                        <Popconfirm
                          title="Delete Comment"
                          description="Are you sure you want to delete this comment?"
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{
                            danger: true,
                            loading: isDeletingThis,
                          }}
                          icon={
                            <ExclamationCircleOutlined className="text-rose-500" />
                          }
                          onConfirm={() => handleDeleteComment(comment._id)}
                        >
                          <Button
                            danger
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            loading={isDeletingThis}
                            className="h-6 w-6 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete comment"
                          />
                        </Popconfirm>
                      </div>

                      {/* Comment Body */}
                      <div className="text-xs text-gray-700 leading-relaxed pl-9 whitespace-pre-line break-words">
                        {comment.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIKES INSPECTION */}
      {/* ========================================================================= */}
      {activeTab === "likes" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 px-0.5">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Liked By ({currentLikeCount})
            </span>
            {isFetchingLikes && (
              <span className="text-[11px] text-rose-600 flex items-center gap-1">
                <Spin size="small" />
              </span>
            )}
          </div>

          {isLoadingLikes ? (
            <div className="flex h-28 items-center justify-center">
              <Spin tip="Loading likes..." />
            </div>
          ) : likesList.length === 0 ? (
            <div className="rounded-2xl bg-gray-50/60 p-6 text-center space-y-1.5">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-400">
                <HeartOutlined className="text-sm" />
              </div>
              <h4 className="font-display text-xs font-bold text-gray-700">
                No likes yet
              </h4>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                No readers have liked this article yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {likesList.map((item, idx) => {
                const user = item.user || ({} as any);
                const userName = user.name || "Community Supporter";
                const userAvatar = user.image ? toFileUrl(user.image) : null;

                return (
                  <div
                    key={user._id || idx}
                    className="flex items-center justify-between gap-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/70 p-2.5 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        src={userAvatar || undefined}
                        icon={!userAvatar && <UserOutlined />}
                        size={28}
                        className="shrink-0 bg-rose-100 text-rose-700 text-xs font-bold border-0"
                      >
                        {!userAvatar && userName.charAt(0).toUpperCase()}
                      </Avatar>

                      <div className="min-w-0">
                        <span className="font-bold text-xs text-gray-900 block truncate">
                          {userName}
                        </span>
                        {user.email && (
                          <span className="text-[10px] text-gray-400 block truncate">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {getRoleBadge(user.role)}
                      {item.createdAt && (
                        <span className="text-[9px] text-gray-400 block mt-0.5">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
