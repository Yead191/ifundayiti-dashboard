import { useState } from "react";
import { Avatar, Button, Input, Spin, Tooltip, Alert } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  LockOutlined,
  ReloadOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/useAuth";
import { getImageUrl } from "@/lib/getImageUrl";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetCommunityCommentsQuery,
  useCreateCommunityCommentMutation,
} from "@/redux/features/community/communityApi";
import type { ICommunityComment } from "@/redux/features/community/community.types";
import { CommentItem } from "./CommentItem";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";

interface CommunityDiscussionSectionProps {
  postId: string;
  isLocked?: boolean;
  totalComments?: number;
}

export function CommunityDiscussionSection({
  postId,
  isLocked = false,
  totalComments = 0,
}: CommunityDiscussionSectionProps) {
  const { data: userRes } = useGetProfileQuery();
  const [commentText, setCommentText] = useState("");

  const {
    data: commentsRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetCommunityCommentsQuery({ postId }, { skip: !postId });

  const [createComment, { isLoading: isSubmitting }] =
    useCreateCommunityCommentMutation();

  const comments: ICommunityComment[] = commentsRes?.data || [];

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({
        postId,
        comment: commentText.trim(),
      }).unwrap();

      toast.success("Comment posted successfully");
      setCommentText("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to post comment");
    }
  };

  const user = userRes?.data;
  const currentUserId = user ? user._id : undefined;
  const userAvatar = user ? (user as any).image : undefined;
  const isAdmin = Boolean(
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN",
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B3D2E]">
            <MessageOutlined className="text-base" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-display m-0">
              Discussion & Moderation
            </h3>
            <p className="text-xs text-gray-500 m-0">
              {totalComments}{" "}
              {totalComments === 1 ? "comment" : "comments & replies"} recorded
            </p>
          </div>
        </div>

        <Tooltip title="Refresh comments">
          <Button
            type="text"
            size="small"
            icon={
              <ReloadOutlined className={isFetching ? "animate-spin" : ""} />
            }
            onClick={() => refetch()}
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700"
          />
        </Tooltip>
      </div>

      {/* Discussion Locked Alert */}
      {isLocked && (
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
          <LockOutlined className="text-amber-600 text-base mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold">Discussion Locked</span>
            <p className="text-amber-700 m-0">
              Commenting has been disabled by an administrator. Verified members
              can still read the announcement and react, but new comments and
              replies cannot be submitted.
            </p>
          </div>
        </div>
      )}

      {/* Top-Level Comment Input Box */}
      {!isLocked && (
        <GlassCard className="p-4 sm:p-5 border border-gray-200/80 bg-white">
          <div className="flex items-start gap-3.5">
            <Avatar
              src={userAvatar ? getImageUrl(userAvatar) : undefined}
              icon={<UserOutlined />}
              size={40}
              className="bg-emerald-100 text-[#0B3D2E] border border-emerald-300 ring-2 ring-emerald-50 shrink-0 mt-0.5"
            />
            <div className="flex-1 space-y-4">
              <Input.TextArea
                placeholder="Share an official announcement update, answer member questions, or join the discussion..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autoSize={{ minRows: 3, maxRows: 6 }}
                className="rounded-xl text-sm p-3.5"
              />
              <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Posting as{" "}
                  <strong className="text-gray-700">
                    {user?.name || "Administrator"}
                  </strong>
                </span>
                <Button
                  type="primary"
                  loading={isSubmitting}
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                  icon={<SendOutlined />}
                  className={`h-10 px-5 rounded-xl font-semibold border-0 transition-all ${
                    !commentText.trim()
                      ? "bg-[#0B3D2E]/45! text-white/80! cursor-not-allowed shadow-none"
                      : "bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! shadow-xs"
                  }`}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Comments List */}
      <GlassCard className="p-4 sm:p-6 border border-gray-200/80 bg-white">
        {isLoading ? (
          <div className="py-12 text-center">
            <Spin size="default" />
            <p className="mt-2 text-xs text-gray-400">
              Loading conversation thread...
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-2">
              <CommentOutlined className="text-2xl" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800">
              No Comments Yet
            </h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-0.5">
              {isLocked
                ? "This announcement has no comments, and discussion has been locked."
                : "Be the first to start the discussion or share official notes."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments?.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={postId}
                isPostLocked={isLocked}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onDeleted={() => refetch()}
              />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
