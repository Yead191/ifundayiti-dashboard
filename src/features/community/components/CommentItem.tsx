import { useState } from "react";
import { Avatar, Button, Input, Popconfirm, Tag, Tooltip, Spin } from "antd";
import {
  HeartFilled,
  HeartOutlined,
  MessageOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatRelativeTime } from "../communityHelpers";
import type { ICommunityComment } from "@/redux/features/community/community.types";
import {
  useToggleCommunityCommentLikeMutation,
  useReplyCommunityCommentMutation,
  useGetCommunityCommentRepliesQuery,
  useUpdateCommunityCommentMutation,
  useDeleteCommunityCommentMutation,
} from "@/redux/features/community/communityApi";

interface CommentItemProps {
  comment: ICommunityComment;
  postId: string;
  isPostLocked?: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  isChild?: boolean;
  parentCommentId?: string;
  onDeleted?: () => void;
}

export function CommentItem({
  comment,
  postId,
  isPostLocked = false,
  currentUserId,
  isAdmin = true,
  isChild = false,
  parentCommentId,
  onDeleted,
}: CommentItemProps) {
  // Optimistic like state
  const [isLiked, setIsLiked] = useState<boolean>(Boolean(comment.isLikedByMe));
  const [likeCount, setLikeCount] = useState<number>(comment.totalLikes || 0);

  // Reply states
  const [showReplyInput, setShowReplyInput] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [showReplies, setShowReplies] = useState<boolean>(false);

  // Edit states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(
    comment.text || comment.comment || "",
  );

  // Mutations & Queries
  const [toggleCommentLike, { isLoading: isTogglingLike }] =
    useToggleCommunityCommentLikeMutation();
  const [replyComment, { isLoading: isSubmittingReply }] =
    useReplyCommunityCommentMutation();
  const [updateComment, { isLoading: isUpdatingComment }] =
    useUpdateCommunityCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] =
    useDeleteCommunityCommentMutation();

  // Load nested replies dynamically when expanded
  const {
    data: repliesRes,
    isLoading: isLoadingReplies,
    isFetching: isFetchingReplies,
    refetch: refetchReplies,
  } = useGetCommunityCommentRepliesQuery(
    { commentId: comment._id },
    { skip: isChild || !showReplies },
  );

  const nestedReplies: ICommunityComment[] = repliesRes?.data || [];

  const handleLike = async () => {
    if (isTogglingLike) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await toggleCommentLike(comment._id).unwrap();
      if (res?.data) {
        setIsLiked(res.data.liked);
        setLikeCount(res.data.totalLikes);
      }
    } catch {
      // Revert optimistic state
      setIsLiked(!nextLiked);
      setLikeCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Failed to like comment");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await replyComment({
        postId,
        parentCommentId: comment._id,
        comment: replyText.trim(),
      }).unwrap();

      toast.success("Reply posted successfully");
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
      refetchReplies();
      onDeleted?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to post reply");
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await updateComment({
        commentId: comment._id,
        comment: editText.trim(),
        postId,
      }).unwrap();

      toast.success("Comment updated");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update comment");
    }
  };

  const handleDelete = async () => {
    try {
      const parentId =
        parentCommentId ||
        (typeof comment.parentComment === "string"
          ? comment.parentComment
          : (comment.parentComment as any)?._id);

      await deleteComment({
        commentId: comment._id,
        postId,
        parentCommentId: parentId,
      }).unwrap();
      toast.success("Comment removed");
      onDeleted?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete comment");
    }
  };

  const isAuthor = Boolean(
    currentUserId && comment.author?._id === currentUserId,
  );
  const canDelete = isAdmin || isAuthor;
  const userRole = (comment.author?.role || "").toUpperCase();
  const isAdminUser = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  return (
    <div
      className={`group relative transition-all ${
        isChild
          ? "mt-3 pl-4 sm:pl-6 border-l-2 border-emerald-600/20"
          : "py-3.5 border-b border-gray-100/90 last:border-b-0"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar
          src={
            comment.author?.image
              ? getImageUrl(comment.author.image)
              : undefined
          }
          icon={<UserOutlined />}
          size={isChild ? 30 : 36}
          className={`${
            isAdminUser
              ? "bg-emerald-100 text-[#0B3D2E] border border-emerald-300 ring-2 ring-emerald-50"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          } shrink-0 mt-0.5`}
        />

        <div className="flex-1 min-w-0 space-y-1">
          {/* Author Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm text-gray-900">
                {comment.author?.name || "Member"}
              </span>

              {isAdminUser && (
                <Tag
                  bordered={false}
                  className="rounded-full text-[10px] font-bold px-1.5 py-0 m-0 bg-emerald-50 text-[#0B3D2E] border border-emerald-200/80 flex items-center gap-1"
                >
                  <SafetyCertificateFilled className="text-[10px]" />
                  <span>Admin</span>
                </Tag>
              )}

              <span className="text-gray-300">•</span>
              <span className="text-[11px] text-gray-400">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            {/* Actions (Edit / Delete) */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {isAuthor && !isEditing && (
                <Tooltip title="Edit comment">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-emerald-700 transition-colors rounded-md"
                  >
                    <EditOutlined className="text-xs" />
                  </button>
                </Tooltip>
              )}

              {canDelete && (
                <Popconfirm
                  title="Delete this comment?"
                  description="This will permanently purge this comment and any nested replies."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: isDeletingComment }}
                  onConfirm={handleDelete}
                >
                  <Tooltip title="Delete comment">
                    <button
                      type="button"
                      disabled={isDeletingComment}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors rounded-md"
                    >
                      <DeleteOutlined className="text-xs" />
                    </button>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
          </div>

          {/* Comment Body / Inline Edit Mode */}
          {isEditing ? (
            <div className="space-y-3 pt-1.5 pb-0.5">
              <Input.TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 6 }}
                className="rounded-xl text-xs sm:text-sm p-3 bg-white"
              />
              <div className="flex items-center gap-2.5 justify-end pt-1">
                <Button
                  size="small"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.text || comment.comment || "");
                  }}
                  icon={<CloseOutlined />}
                  className="rounded-lg text-xs h-8 px-3.5"
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="primary"
                  loading={isUpdatingComment}
                  onClick={handleSaveEdit}
                  disabled={!editText.trim()}
                  icon={<CheckOutlined />}
                  className={`rounded-lg text-xs h-8 px-4 font-semibold border-0 transition-all ${
                    !editText.trim()
                      ? "bg-[#0B3D2E]/45! text-white/80! cursor-not-allowed shadow-none"
                      : "bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! shadow-xs"
                  }`}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
              {comment.text || comment.comment}
            </p>
          )}

          {/* Bottom Action Bar: Like & Reply */}
          {!isEditing && (
            <div className="flex items-center gap-4 pt-1.5 text-xs">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                  isLiked
                    ? "text-rose-600"
                    : "text-gray-400 hover:text-rose-600"
                }`}
              >
                {isLiked ? (
                  <HeartFilled className="text-rose-500 animate-in zoom-in-75" />
                ) : (
                  <HeartOutlined />
                )}
                <span>{likeCount > 0 ? likeCount : "Like"}</span>
              </button>

              {!isChild && !isPostLocked && (
                <button
                  type="button"
                  onClick={() => setShowReplyInput((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-gray-400 hover:text-[#0B3D2E] transition-colors font-medium"
                >
                  <MessageOutlined />
                  <span>Reply</span>
                </button>
              )}
            </div>
          )}

          {/* Inline Reply Input */}
          {showReplyInput && !isPostLocked && (
            <div className="mt-3.5 space-y-3 rounded-2xl bg-gray-50/90 p-4 border border-gray-200/70">
              <Input.TextArea
                placeholder={`Reply to ${comment?.author?.name || "member"}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 5 }}
                className="rounded-xl text-xs sm:text-sm bg-white p-2.5"
              />
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <Button
                  size="small"
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyText("");
                  }}
                  className="rounded-lg text-xs h-8 px-3.5"
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="primary"
                  loading={isSubmittingReply}
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  icon={<SendOutlined />}
                  className={`rounded-lg text-xs h-8 px-4 font-semibold border-0 transition-all ${
                    !replyText.trim()
                      ? "bg-[#0B3D2E]/45! text-white/80! cursor-not-allowed shadow-none"
                      : "bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! shadow-xs"
                  }`}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Expand Nested Replies Button */}
          {!isChild && comment.totalReplies > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowReplies((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <div className="h-0.5 w-4 bg-emerald-600/40 rounded-full" />
                <span>
                  {showReplies
                    ? "Hide replies"
                    : `View ${comment.totalReplies} repl${comment.totalReplies === 1 ? "y" : "ies"}`}
                </span>
                {showReplies ? (
                  <UpOutlined className="text-[10px]" />
                ) : (
                  <DownOutlined className="text-[10px]" />
                )}
              </button>
            </div>
          )}

          {/* Nested Replies List */}
          {!isChild && showReplies && (
            <div className="mt-2 space-y-2">
              {isLoadingReplies ? (
                <div className="py-2 pl-4 flex items-center gap-2 text-xs text-gray-400">
                  <Spin size="small" />
                  <span>Loading replies...</span>
                </div>
              ) : nestedReplies.length === 0 ? (
                <p className="text-xs text-gray-400 italic pl-4">
                  No replies found.
                </p>
              ) : (
                nestedReplies.map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    postId={postId}
                    isPostLocked={isPostLocked}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    isChild={true}
                    parentCommentId={comment._id}
                    onDeleted={() => {
                      refetchReplies();
                      onDeleted?.();
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
