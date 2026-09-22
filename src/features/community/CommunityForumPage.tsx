import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Table,
  Button,
  Segmented,
  Switch,
  Input,
  Tooltip,
  Tag,
  Avatar,
  Dropdown,
} from "antd";
import type { TableProps, MenuProps } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  MessageOutlined,
  HeartOutlined,
  StarFilled,
  StarOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  UserOutlined,
  PictureOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useGetCommunityPostsQuery,
  useUpdateCommunityPostMutation,
  useDeleteCommunityPostMutation,
} from "@/redux/features/community/communityApi";
import type { ICommunityPost } from "@/redux/features/community/community.types";
import {
  COMMUNITY_STATUS_CONFIG,
  formatRelativeTime,
  stripHtml,
  getAuthorInfo,
} from "./communityHelpers";
import { CommunityBroadcastBanner } from "./components/CommunityBroadcastBanner";
import { DeleteCommunityPostModal } from "./components/DeleteCommunityPostModal";

export default function CommunityForumPage() {
  const navigate = useNavigate();

  // Filters & Search state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: searchTerm,
  } = useDebouncedSearch();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pinnedOnly, setPinnedOnly] = useState<boolean>(false);

  // Modal & Target states
  const [deletingPost, setDeletingPost] = useState<ICommunityPost | null>(null);

  // Queries & Mutations
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      searchTerm: searchTerm.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      isPinned: pinnedOnly ? true : undefined,
    }),
    [page, limit, searchTerm, statusFilter, pinnedOnly],
  );

  const {
    data: postsRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetCommunityPostsQuery(queryParams);

  const [updatePost] = useUpdateCommunityPostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeleteCommunityPostMutation();

  const posts: ICommunityPost[] = postsRes?.data || [];
  const meta = postsRes?.meta || postsRes?.pagination;

  // Toggle Pinned
  const handleTogglePin = async (post: ICommunityPost, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePost({
        id: post._id,
        data: { isPinned: !post.isPinned },
      }).unwrap();
      toast.success(post.isPinned ? "Announcement unpinned" : "Announcement pinned to top");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update pin state");
    }
  };

  // Toggle Locked
  const handleToggleLock = async (post: ICommunityPost, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updatePost({
        id: post._id,
        data: { isLocked: !post.isLocked },
      }).unwrap();
      toast.success(post.isLocked ? "Discussion unlocked" : "Discussion locked (comments closed)");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update lock state");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    try {
      await deletePost(deletingPost._id).unwrap();
      toast.success("Forum announcement deleted successfully");
      setDeletingPost(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete announcement");
    }
  };

  const columns: TableProps<ICommunityPost>["columns"] = [
    {
      title: "Announcement",
      key: "post",
      render: (_, record) => {
        const title = record.title || "Untitled Announcement";
        const excerpt = stripHtml(record.content);
        const hasImages = Array.isArray(record.images) && record.images.length > 0;
        const firstImage = hasImages ? getImageUrl(record.images![0]) : null;

        return (
          <div className="flex items-start gap-3 max-w-xl">
            {firstImage ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200/80 bg-gray-100">
                <img
                  src={firstImage}
                  alt={title}
                  className="h-full w-full object-cover"
                />
                {record.images!.length > 1 && (
                  <span className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1 py-0.2 text-[9px] font-bold text-white">
                    +{record.images!.length - 1}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0B3D2E] border border-emerald-100">
                <MessageOutlined className="text-xl" />
              </div>
            )}

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {record.isPinned && (
                  <Tag
                    bordered={false}
                    className="rounded-full text-[10px] font-bold px-2 py-0 m-0 bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1"
                  >
                    <StarFilled className="text-amber-500 text-[10px]" />
                    <span>PINNED</span>
                  </Tag>
                )}

                {record.isLocked && (
                  <Tag
                    bordered={false}
                    className="rounded-full text-[10px] font-bold px-2 py-0 m-0 bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                  >
                    <LockOutlined className="text-[10px]" />
                    <span>LOCKED</span>
                  </Tag>
                )}

                <Link
                  to={`/community/${record._id}`}
                  className="font-display font-bold text-sm text-gray-900 hover:text-[#0B3D2E] transition-colors truncate"
                >
                  {title}
                </Link>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed m-0">
                {excerpt || "No written content..."}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Author",
      key: "author",
      width: 170,
      render: (_, record) => {
        const author = getAuthorInfo(record.author);
        const isAdmin = author.role === "SUPER_ADMIN" || author.role === "ADMIN";

        return (
          <div className="flex items-center gap-2">
            <Avatar
              src={author.image ? getImageUrl(author.image) : undefined}
              icon={<UserOutlined />}
              size={32}
              className="bg-emerald-50 text-[#0B3D2E] border border-emerald-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-semibold text-xs text-gray-900 truncate">
                {author.name}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                {isAdmin && <SafetyCertificateFilled className="text-emerald-600 text-[10px]" />}
                <span className="capitalize">{author.role.toLowerCase()}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Engagement",
      key: "engagement",
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-3 text-xs">
          <Tooltip title={`${record.totalLikes} member reactions`}>
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 bg-rose-50/70 px-2 py-1 rounded-lg border border-rose-100">
              <HeartOutlined />
              <span>{record.totalLikes}</span>
            </span>
          </Tooltip>

          <Tooltip title={`${record.totalComments} comments & replies`}>
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50/70 px-2 py-1 rounded-lg border border-indigo-100">
              <MessageOutlined />
              <span>{record.totalComments}</span>
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Controls",
      key: "controls",
      width: 130,
      render: (_, record) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Tooltip title={record.isPinned ? "Unpin from top" : "Pin to feed top"}>
            <Button
              type="text"
              size="small"
              icon={record.isPinned ? <StarFilled className="text-amber-500" /> : <StarOutlined />}
              onClick={(e) => handleTogglePin(record, e)}
              className="h-8 w-8 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50"
            />
          </Tooltip>

          <Tooltip title={record.isLocked ? "Unlock discussion" : "Lock discussion (close comments)"}>
            <Button
              type="text"
              size="small"
              icon={record.isLocked ? <LockOutlined className="text-amber-600" /> : <UnlockOutlined />}
              onClick={(e) => handleToggleLock(record, e)}
              className="h-8 w-8 rounded-lg text-gray-400 hover:text-[#0B3D2E] hover:bg-emerald-50"
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => {
        const cfg =
          COMMUNITY_STATUS_CONFIG[record.status] ||
          COMMUNITY_STATUS_CONFIG.published;
        return (
          <Tag
            bordered={false}
            className={`rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 border ${cfg.badgeBg} ${cfg.textColor} ${cfg.borderColor}`}
          >
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Created",
      key: "createdAt",
      width: 120,
      render: (_, record) => (
        <span className="text-xs text-gray-500">
          {formatRelativeTime(record.createdAt)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "right",
      render: (_, record) => {
        const menuItems: MenuProps["items"] = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View Discussion",
            onClick: () => navigate(`/community/${record._id}`),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit Announcement",
            onClick: () => navigate(`/community/edit/${record._id}`),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            danger: true,
            label: "Delete Announcement",
            onClick: () => setDeletingPost(record),
          },
        ];

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700"
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-cloud-100">
            Community Forum & Announcements
          </h1>
          <p className="text-xs sm:text-sm text-mist-600 mt-1">
            Broadcast official announcements to all verified diaspora members, pin priority updates, and moderate nested discussions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Tooltip title="Refresh announcements">
            <Button
              icon={<ReloadOutlined className={isFetching ? "animate-spin" : ""} />}
              onClick={() => refetch()}
              className="h-10 w-10 rounded-xl"
            />
          </Tooltip>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/community/create")}
            className="h-10 rounded-xl px-5 font-semibold bg-[#0B3D2E]! hover:bg-[#082e23]! border-0 shadow-sm"
          >
            New Announcement
          </Button>
        </div>
      </div>

      {/* Broadcast Alert Banner */}
      <CommunityBroadcastBanner />

      {/* Filter Toolbar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-xs">
            <Input
              prefix={<SearchOutlined className="text-mist-400 mr-1" />}
              placeholder="Search announcements, content..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              allowClear
              className="h-10 rounded-xl"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Segmented */}
            <Segmented
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val as string);
                setPage(1);
              }}
              className="p-1 rounded-xl bg-gray-100 font-medium"
              options={[
                { value: "all", label: "All Status" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archived", label: "Archived" },
              ]}
            />

            {/* Pinned Switch */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700">
              <StarFilled className={pinnedOnly ? "text-amber-500" : "text-gray-400"} />
              <span>Pinned Only</span>
              <Switch
                size="small"
                checked={pinnedOnly}
                onChange={(checked) => {
                  setPinnedOnly(checked);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Posts Feed Table */}
      {posts.length === 0 && !isLoading ? (
        <GlassCard className="p-12 text-center">
          <EmptyState
            icon={<MessageOutlined className="text-4xl text-[#0B3D2E]" />}
            title={
              searchTerm || statusFilter !== "all" || pinnedOnly
                ? "No Matching Announcements"
                : "No Community Announcements Published"
            }
            description={
              searchTerm || statusFilter !== "all" || pinnedOnly
                ? "No forum threads match your current search or filter criteria. Try resetting your query."
                : "Create an announcement to broadcast important updates and engage with verified community members."
            }
            actionLabel={
              searchTerm || statusFilter !== "all" || pinnedOnly
                ? "Reset Filters"
                : "+ Create First Announcement"
            }
            onAction={() => {
              if (searchTerm || statusFilter !== "all" || pinnedOnly) {
                setSearchInput("");
                setStatusFilter("all");
                setPinnedOnly(false);
                setPage(1);
              } else {
                navigate("/community/create");
              }
            }}
          />
        </GlassCard>
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <Table<ICommunityPost>
            rowKey="_id"
            columns={columns}
            dataSource={posts}
            loading={isLoading || isFetching}
            onRow={(record) => ({
              onClick: () => navigate(`/community/${record._id}`),
              className: "cursor-pointer hover:bg-emerald-50/20 transition-colors",
            })}
            pagination={{
              current: meta?.page ?? page,
              pageSize: meta?.limit ?? limit,
              total: meta?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} total announcements`,
              onChange: (nextPage, nextSize) => {
                setPage(nextPage);
                setLimit(nextSize);
              },
            }}
            scroll={{ x: 950 }}
          />
        </GlassCard>
      )}

      {/* Deletion Danger Modal */}
      <DeleteCommunityPostModal
        open={Boolean(deletingPost)}
        post={deletingPost}
        loading={isDeleting}
        onCancel={() => setDeletingPost(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
