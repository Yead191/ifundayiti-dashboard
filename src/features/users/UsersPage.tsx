import { useEffect, useState } from "react";
import { Avatar, Badge, Button, Segmented, Table, Tabs, Tooltip, type TableProps } from "antd";
import {
  UserOutlined,
  EyeOutlined,
  DeleteOutlined,
  TeamOutlined,
  CheckCircleFilled,
  CrownOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useChangeUserStatusMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
} from "@/redux/features/users/usersApi";
import {
  USER_STATUS_OPTIONS,
  type ApiUser,
  type UserAccountStatus,
} from "@/redux/features/users/users.types";
import {
  subscriptionStatusToneMap,
  userStatusDotClassMap,
  userStatusLabelMap,
} from "./statusMaps";
import { UserProfileModal } from "./components/UserProfileModal";
import { UserStatusSelect } from "./components/UserStatusSelect";

type StatusTab = UserAccountStatus | "all";
type SubscriptionFilter = "all" | "subscribers";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useStatusCount(status?: UserAccountStatus) {
  const { data } = useGetUsersQuery({ page: 1, limit: 1, status });
  return data?.pagination?.total ?? 0;
}

export default function UsersPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState<ApiUser | null>(null);

  const hasSubscription = subscriptionFilter === "subscribers";

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab, subscriptionFilter]);

  const allCount = useStatusCount();
  const activeCount = useStatusCount("active");
  const blockedCount = useStatusCount("blocked");

  const tabCounts: Record<StatusTab, number> = {
    all: allCount,
    active: activeCount,
    blocked: blockedCount,
  };

  const { data, isFetching } = useGetUsersQuery({
    page,
    limit,
    searchTerm,
    status: statusTab === "all" ? undefined : statusTab,
    hasSubscription: hasSubscription || undefined,
  });

  const [changeStatus, { isLoading: isChangingStatus }] = useChangeUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiUser>(async (record) => {
    const promise = deleteUser(record._id)
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: `Deleting ${record.name}…`,
      success: `${record.name}'s account has been removed.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const applyStatusChange = (user: ApiUser, status: UserAccountStatus) => {
    const promise = changeStatus({
      id: user._id,
      body: { status },
    })
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev && prev._id === user._id ? { ...prev, status } : prev));
      });

    toast.promise(promise, {
      loading: `Updating ${user.name}…`,
      success: `${user.name} is now ${userStatusLabelMap[status].toLowerCase()}.`,
      error: (err) => getErrorMessage(err),
    });
  };

  const columns: TableProps<ApiUser>["columns"] = [
    {
      title: "User",
      key: "name",
      render: (_, record) => (
        <button
          type="button"
          className="group flex items-center gap-3.5 text-left"
          onClick={() => setViewing(record)}
        >
          <div className="rounded-xl bg-gradient-to-br from-violet-600/40 to-violet-900/30 p-[1.5px] transition group-hover:from-violet-600/70">
            <Avatar
              src={getImageUrl(record.image)}
              icon={<UserOutlined />}
              size={44}
              className="!rounded-[10px] !bg-navy-800"
              shape="square"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-medium text-cloud-100 transition group-hover:text-violet-glow">
              {record.name}
              {record.verified && <CheckCircleFilled className="text-[12px] text-info" />}
            </div>
            <div className="max-w-[240px] truncate text-xs text-mist-400">{record.email}</div>
          </div>
        </button>
      ),
    },
    {
      title: "Company",
      key: "company",
      responsive: ["md"],
      render: (_, record) => (
        <span className="text-mist-300">{record.company || "—"}</span>
      ),
    },
    {
      title: "Interest",
      key: "interest",
      responsive: ["lg"],
      render: (_, record) =>
        record.interest ? (
          <StatusTag tone="violet">{record.interest}</StatusTag>
        ) : (
          <span className="text-mist-600">—</span>
        ),
    },
    {
      title: "Subscription",
      key: "subscription",
      responsive: ["md"],
      render: (_, record) => {
        const sub = record.subscription;
        if (!sub) {
          return <span className="text-mist-600">—</span>;
        }
        return (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusTag tone="gold" icon={<CrownOutlined />}>
                {sub.name}
              </StatusTag>
              <StatusTag tone={subscriptionStatusToneMap[sub.status] ?? "neutral"}>
                {sub.status}
              </StatusTag>
            </div>
            <div className="mt-1 text-xs text-mist-400">
              {formatCurrency(sub.price)}
              <span className="text-mist-600">/{sub.recuring}</span>
              <span className="mx-1 text-mist-700">·</span>
              ends {formatDate(sub.end_date)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Joined",
      key: "createdAt",
      responsive: ["xl"],
      render: (_, record) => <span className="text-mist-400">{formatDate(record.createdAt)}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <UserStatusSelect
          value={record.status}
          onChange={(status) => applyStatusChange(record, status)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 108,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="View profile">
            <Button
              type="text"
              className="!text-mist-400 hover:!bg-violet-600/15 hover:!text-violet-glow"
              icon={<EyeOutlined />}
              onClick={() => setViewing(record)}
            />
          </Tooltip>
          <Tooltip title="Delete user">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteFlow.request(record)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: "all" as const, label: "All", count: tabCounts.all },
    ...USER_STATUS_OPTIONS.map((status) => ({
      key: status,
      label: userStatusLabelMap[status],
      count: tabCounts[status],
    })),
  ];

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <TeamOutlined className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">Users</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Browse member accounts, update access status, and remove users when needed.
            </p>
          </div>
        </div>
        {blockedCount > 0 && (
          <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm">
            <div className="font-semibold text-danger">{blockedCount} blocked</div>
            <div className="text-xs text-mist-400">Restricted accounts</div>
          </div>
        )}
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
                        userStatusDotClassMap[tab.key as UserAccountStatus]
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

        <div className="flex flex-col gap-2.5 border-t border-navy-700/60 p-4 sm:flex-row sm:flex-wrap sm:items-center md:px-5">
          <SearchInput
            placeholder="Search by name, email, company…"
            value={search}
            onChange={setSearch}
            className="sm:!w-72"
          />
          <Segmented
            value={subscriptionFilter}
            onChange={(value) => setSubscriptionFilter(value as SubscriptionFilter)}
            options={[
              { label: "All members", value: "all" },
              {
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <CrownOutlined />
                    Has subscription
                  </span>
                ),
                value: "subscribers",
              },
            ]}
          />
          <div className="text-xs text-mist-600 sm:ml-auto">
            {pagination?.total ?? 0} user{(pagination?.total ?? 0) === 1 ? "" : "s"}
          </div>
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && users.length === 0 ? (
          <EmptyState
            icon={<UserOutlined />}
            title="No users in this view"
            description="Try another status tab, clear the subscription filter, or adjust your search."
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={users}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} users`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <UserProfileModal
        user={viewing}
        open={!!viewing}
        updating={isChangingStatus}
        onClose={() => setViewing(null)}
        onStatusChange={(status) => {
          if (!viewing) return;
          applyStatusChange(viewing, status);
        }}
        onDelete={(user) => {
          setViewing(null);
          deleteFlow.request(user);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete ${deleteFlow.target?.name}?`}
        description="This permanently deletes the user account from Hubology. This can't be undone."
        confirmLabel="Delete user"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
