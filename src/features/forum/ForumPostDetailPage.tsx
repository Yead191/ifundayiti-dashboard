import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar, Button, Skeleton } from "antd";
import {
  ArrowLeftOutlined,
  FlagFilled,
  HeartOutlined,
  MessageOutlined,
  UserOutlined,
  CheckOutlined,
  StopOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useGetPostQuery,
  useGetPostReportsQuery,
  useReviewPostMutation,
} from "@/redux/features/forum/forumApi";
import {
  postStatusLabelMap,
  postStatusToneMap,
  reportStatusToneMap,
} from "./statusMaps";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function ForumPostDetailPage() {
  const { postId = "" } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const { data: postRes, isLoading: isPostLoading, isError } = useGetPostQuery(postId, {
    skip: !postId,
  });
  const { data: reportsRes, isFetching: isReportsFetching } = useGetPostReportsQuery(postId, {
    skip: !postId,
  });
  const [reviewPost, { isLoading: isReviewing }] = useReviewPostMutation();

  const post = postRes?.data;
  const reports = reportsRes?.data ?? [];

  const applyStatus = async (status: "published" | "removed", successMessage: string) => {
    if (!post) return;
    const promise = reviewPost({ id: post._id, status }).unwrap();
    toast.promise(promise, {
      loading: "Updating post…",
      success: successMessage,
      error: (err) => getErrorMessage(err),
    });
    await promise.catch(() => undefined);
  };

  if (isPostLoading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 1 }} className="mb-6 max-w-xs" />
        <GlassCard flat>
          <Skeleton active avatar paragraph={{ rows: 8 }} />
        </GlassCard>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div>
        <Link
          to="/forum"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
        >
          <ArrowLeftOutlined />
          Back to forum
        </Link>
        <EmptyState
          icon={<FlagFilled />}
          title="Post not found"
          description="This post may have been deleted or the link is invalid."
          actionLabel="Back to forum"
          onAction={() => navigate("/forum")}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <Link
          to="/forum"
          className="inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
        >
          <ArrowLeftOutlined />
          Back to forum
        </Link>
      </div>

      <div className="aurora-field glass-panel mb-6 overflow-hidden p-6 md:p-7">
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full bg-warning/15 blur-[60px]" />

          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone={postStatusToneMap[post.status]}>
                {postStatusLabelMap[post.status]}
              </StatusTag>
              <StatusTag tone="violet">{post.category}</StatusTag>
              {(post.reportCount ?? reports.length) > 0 && (
                <StatusTag tone="danger" icon={<FlagFilled />}>
                  {post.reportCount ?? reports.length} report
                  {(post.reportCount ?? reports.length) === 1 ? "" : "s"}
                </StatusTag>
              )}
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold text-cloud-100">Post review</h2>
            <p className="mt-1 text-sm text-mist-400">
              Posted {formatDate(post.createdAt)}
              {post.updatedAt ? ` · Updated ${formatDate(post.updatedAt)}` : ""}
            </p>
          </div>

          <div className="relative flex flex-wrap gap-2">
            {(post.status === "reported" || post.status === "removed") && (
              <Button
                type="primary"
                icon={post.status === "removed" ? <UndoOutlined /> : <CheckOutlined />}
                className="btn-gradient border-0!"
                loading={isReviewing}
                onClick={() =>
                  applyStatus(
                    "published",
                    post.status === "removed"
                      ? "Post restored and published again."
                      : "Report dismissed — post stays published."
                  )
                }
              >
                {post.status === "removed" ? "Restore post" : "Dismiss report"}
              </Button>
            )}
            {post.status !== "removed" && (
              <Button
                danger
                icon={<StopOutlined />}
                loading={isReviewing}
                onClick={() => applyStatus("removed", "Post removed from the forum.")}
              >
                Remove post
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <GlassCard flat className="xl:col-span-3">
          <div className="flex items-center gap-3 border-b border-navy-700/60 pb-4">
            <Avatar
              src={getImageUrl(post?.author?.image || "")}
              icon={<UserOutlined />}
              size={48} 
              className="bg-violet-600/25! text-violet-glow!"
            />
            <div className="min-w-0">
              <div className="font-medium text-cloud-100">{post?.author?.name || "Deleted User"}</div>
              <div className="text-xs text-mist-400">
                {post?.author?.role ? `${post?.author?.role} · ` : ""}
                {formatDate(post?.createdAt || "")}
              </div>
            </div>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-mist-200">
            {post?.content || "No content available"}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-navy-700/60 pt-4 text-sm text-mist-400">
            <span className="inline-flex items-center gap-1.5">
              <HeartOutlined className="text-danger/80" />
              {post.totalLikes} likes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageOutlined className="text-info/80" />
              {post.totalComments} comments
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FlagFilled className="text-warning/80" />
              {post.reportCount ?? reports.length} reports
            </span>
          </div>
        </GlassCard>

        <div className="xl:col-span-2">
          <GlassCard flat>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[15px] font-semibold text-cloud-100">
                Reports ({reports.length})
              </h3>
            </div>

            {isReportsFetching && reports.length === 0 ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : reports.length === 0 ? (
              <p className="py-8 text-center text-sm text-mist-500">
                No reports filed against this post.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-2xl border border-navy-700/60 bg-navy-800/35 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar
                          src={getImageUrl(report.reporter.image)}
                          icon={<UserOutlined />}
                          size={36}
                          className="bg-warning/15! text-warning!"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-cloud-100">
                            {report.reporter.name}
                          </div>
                          <div className="truncate text-[11px] text-mist-500">
                            {report.reporter.email}
                          </div>
                        </div>
                      </div>
                      <StatusTag tone={reportStatusToneMap[report.status] ?? "neutral"}>
                        {report.status}
                      </StatusTag>
                    </div>

                    <div className="mt-3">
                      <StatusTag tone="danger">{report.reason}</StatusTag>
                      {report.description && (
                        <p className="mt-2 text-sm leading-relaxed text-mist-300">
                          {report.description}
                        </p>
                      )}
                      <div className="mt-2 text-[11px] text-mist-600">
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
