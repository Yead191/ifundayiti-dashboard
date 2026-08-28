import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Table, Tabs, Tooltip, type TableProps } from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  FlagFilled,
  MessageOutlined,
  HeartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useDeletePostMutation,
  useGetPostsQuery,
} from "@/redux/features/forum/forumApi";
import {
  POST_STATUS_OPTIONS,
  type ApiPost,
  type PostStatus,
} from "@/redux/features/forum/forum.types";
import {
  postStatusDotClassMap,
  postStatusLabelMap,
  postStatusToneMap,
} from "./statusMaps";

type StatusTab = PostStatus | "all";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: PostStatus) {
  const { data } = useGetPostsQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

function postPreview(content: string) {
  const trimmed = content.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 48)}…`;
}

export default function ForumModerationPage() {
  const navigate = useNavigate();
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab]);

  const allCount = useStatusCount();
  const reportedCount = useStatusCount("reported");
  const publishedCount = useStatusCount("published");
  const removedCount = useStatusCount("removed");

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    reported: reportedCount,
    published: publishedCount,
    removed: removedCount,
  };

  const { data, isFetching } = useGetPostsQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? undefined : statusTab,
  });

  const [deletePost] = useDeletePostMutation();

  const posts = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiPost>(async (record) => {
    const label = postPreview(record.content);
    const promise = deletePost(record._id).unwrap();

    toast.promise(promise, {
      loading: "Deleting post…",
      success: `Deleted “${label}”.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const columns: TableProps<ApiPost>["columns"] = [
    {
      title: "Post",
      key: "content",
      render: (_, record) => (
        <button
          type="button"
          className="group flex max-w-xl items-start gap-3 text-left"
          onClick={() => navigate(`/forum/${record._id}`)}
        >
          <Avatar
            src={getImageUrl(record?.author?.image || "")}
            icon={<UserOutlined />}
            size={40}
            className="mt-0.5 shrink-0 bg-violet-600/25! text-violet-glow!"
          />
          <div className="min-w-0">
            <div className="line-clamp-2 text-sm font-medium leading-snug text-cloud-100 transition group-hover:text-violet-glow">
              {record.content}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-mist-400">
              <span>{record?.author?.name || "Unknown"}</span>
              {record?.author?.role && (
                <>
                  <span className="text-mist-700">·</span>
                  <span className="uppercase tracking-wide text-mist-500">{record.author.role}</span>
                </>
              )}
            </div>
          </div>
        </button>
      ),
    },
    {
      title: "Category",
      key: "category",
      responsive: ["md"],
      render: (_, record) => <StatusTag tone="violet">{record.category}</StatusTag>,
    },
    {
      title: "Engagement",
      key: "engagement",
      responsive: ["lg"],
      render: (_, record) => (
        <div className="flex items-center gap-3 text-xs text-mist-400">
          <span className="inline-flex items-center gap-1">
            <HeartOutlined /> {record.totalLikes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageOutlined /> {record.totalComments}
          </span>
        </div>
      ),
    },
    {
      title: "Reports",
      key: "reports",
      render: (_, record) =>
        (record.reportCount ?? 0) > 0 ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-danger">
            <FlagFilled className="text-[11px]" />
            {record.reportCount}
          </span>
        ) : (
          <span className="text-mist-600">—</span>
        ),
    },
    {
      title: "Posted",
      key: "createdAt",
      responsive: ["xl"],
      render: (_, record) => (
        <span className="text-mist-400">{formatDate(record?.createdAt || "")}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <StatusTag tone={postStatusToneMap[record.status]}>
          {postStatusLabelMap[record.status]}
        </StatusTag>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 108,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Review post">
            <Button
              type="text"
              className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/forum/${record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete post">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteFlow.request(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: "all" as const, label: "All", count: tabCounts.all },
    ...POST_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: postStatusLabelMap[status],
      count: tabCounts[status],
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 overflow-hidden p-6 md:p-7">
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -right-8 -top-16 h-44 w-44 rounded-full bg-warning/15 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-36 w-36 rounded-full bg-violet-600/20 blur-[50px]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
              <FlagFilled className="text-lg text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-cloud-100">Forum moderation</h2>
              <p className="mt-1 max-w-xl text-sm text-mist-400">
                Monitor community posts, review reports, and keep the conversation healthy.
              </p>
            </div>
          </div>

          {reportedCount > 0 && (
            <div className="relative rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm">
              <div className="font-semibold text-warning">{reportedCount} reported</div>
              <div className="text-xs text-mist-400">Awaiting review</div>
            </div>
          )}
        </div>
      </div>

      <GlassCard flat className="mb-4" padded={false}>
        <div className="px-4 pt-2 md:px-5">
          <Tabs
            activeKey={statusTab}
            onChange={(key) => setStatusTab(key as StatusTab)}
            items={tabItems.map((tab) => ({
              key: tab.key,
              label: (
                <span className="flex items-center gap-2">
                  {tab.key !== "all" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        postStatusDotClassMap[tab.key as PostStatus]
                      )}
                    />
                  )}
                  {tab.label}
                  <Badge
                    count={tab.count}
                    showZero
                    overflowCount={999}
                    style={{
                      backgroundColor: statusTab === tab.key ? "#8131F0" : "#23274f",
                      color: statusTab === tab.key ? "#fff" : "#9ca3c9",
                      boxShadow: "none",
                    }}
                  />
                </span>
              ),
            }))}
          />
        </div>

        <div className="flex flex-col gap-2.5 border-t border-navy-700/60 p-4 sm:flex-row sm:items-center md:px-5">
          <SearchInput
            placeholder="Search posts by content or author…"
            value={search}
            onChange={setSearch}
            className="sm:w-80!"
          />
          <div className="text-xs text-mist-600 sm:ml-auto">
            {pagination?.total ?? 0} post{(pagination?.total ?? 0) === 1 ? "" : "s"}
          </div>
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && posts.length === 0 ? (
          <EmptyState
            icon={<FlagFilled />}
            title="No posts in this view"
            description="Try another status tab or clear your search."
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={posts}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} posts`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title="Delete this post?"
        description={`This permanently removes the post${
          deleteFlow.target?.author?.name ? ` by ${deleteFlow.target.author.name}` : ""
        } and its reports from the forum. This can't be undone.`}
        confirmLabel="Delete post"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
