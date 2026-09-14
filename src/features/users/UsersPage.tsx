import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Pagination,
  Popconfirm,
  Select,
  Segmented,
  Switch,
  Table,
  type MenuProps,
  type TableProps,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetUserStatsQuery,
  useGetUsersQuery,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
  useDeleteMultipleUsersMutation,
} from "@/redux/features/users/usersApi";
import type { ApiUser, UserRole } from "@/redux/features/users/users.types";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatDate, getInitials } from "@/lib/utils";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import {
  userRoleBadgeClassMap,
} from "./statusMaps";
import { EditUserModal } from "./components/EditUserModal";

export default function UsersPage() {
  const navigate = useNavigate();

  // Search & Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: searchTerm,
  } = useDebouncedSearch();

  const [roleTab, setRoleTab] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("-createdAt");

  // Selection & Modal States
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Queries
  const { data: statsRes, refetch: refetchStats } =
    useGetUserStatsQuery();

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: number;
      searchTerm?: string;
      role?: string;
      status?: string;
      verified?: boolean;
      sort?: string;
    } = {
      page,
      limit,
      sort: sortBy,
    };

    if (searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }
    if (roleTab !== "all") {
      params.role = roleTab;
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (verifiedFilter !== "all") {
      params.verified = verifiedFilter === "verified";
    }

    return params;
  }, [page, limit, searchTerm, roleTab, statusFilter, verifiedFilter, sortBy]);

  const {
    data: usersRes,
    isLoading: isLoadingUsers,
    isFetching,
    refetch: refetchUsers,
  } = useGetUsersQuery(queryParams);

  // Mutations
  const [changeUserStatus] = useChangeUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [deleteMultipleUsers, { isLoading: isDeletingMultiple }] =
    useDeleteMultipleUsersMutation();

  const users = usersRes?.data ?? [];
  const pagination = usersRes?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
  };
  const stats = statsRes?.data;

  const handleRefresh = () => {
    void refetchStats();
    void refetchUsers();
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setRoleTab("all");
    setStatusFilter("all");
    setVerifiedFilter("all");
    setSortBy("-createdAt");
    setPage(1);
  };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleStatus = async (record: ApiUser) => {
    const nextStatus = record.status === "active" ? "blocked" : "active";
    try {
      await changeUserStatus({ id: record._id, status: nextStatus }).unwrap();
      toast.success(
        `User ${record.name} is now ${nextStatus === "active" ? "activated" : "blocked"}.`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to change user status.");
    }
  };

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      toast.success("User deleted successfully.");
      setSelectedRowKeys((prev) => prev.filter((k) => k !== id));
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user.");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedRowKeys.length) return;
    try {
      const ids = selectedRowKeys.map(String);
      const res = await deleteMultipleUsers(ids).unwrap();
      toast.success(`${res.data.deletedCount} users deleted.`);
      setSelectedRowKeys([]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete selected users.");
    }
  };

  const handleExportCSV = (exportSelectedOnly = false) => {
    const targetUsers = exportSelectedOnly
      ? users.filter((u) => selectedRowKeys.includes(u._id))
      : users;

    if (!targetUsers.length) {
      toast.error("No users available to export.");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Verified",
      "Company",
      "Joined Date",
    ];

    const rows = targetUsers.map((u) => [
      `"${u._id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.verified ? "Yes" : "No"}"`,
      `"${(u.company || "").replace(/"/g, '""')}"`,
      `"${formatDate(u.createdAt)}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ifundayiti-users-${exportSelectedOnly ? "selected" : "export"}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${targetUsers.length} users to CSV.`);
  };

  // Table Columns
  const columns: TableProps<ApiUser>["columns"] = [
    {
      title: "User Profile",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (_: unknown, record: ApiUser) => {
        const initials = getInitials(record.name);
        return (
          <div className="flex items-center gap-3">
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/users/${record._id}`)}
            >
              <Avatar
                size={40}
                src={getImageUrl(record.image)}
                icon={<UserOutlined />}
                className="bg-emerald-100 text-[#0B3D2E] font-bold border border-slate-200 shrink-0"
              >
                {!record.image && initials}
              </Avatar>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate(`/users/${record._id}`)}
                  className="font-semibold text-slate-900 hover:text-emerald-700 text-left truncate transition max-w-[180px]"
                >
                  {record.name}
                </button>
              </div>

              <div className="group/email flex items-center gap-1 text-xs text-slate-500">
                <span className="truncate max-w-[160px]">{record.email}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(record.email, record._id, "Email");
                  }}
                  className="text-slate-400 hover:text-emerald-700 transition opacity-0 group-hover/email:opacity-100"
                >
                  {copiedKey === record._id ? (
                    <CheckOutlined className="text-emerald-600 text-[10px]" />
                  ) : (
                    <CopyOutlined className="text-[10px]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (role: UserRole | string) => {
        const badgeClass =
          userRoleBadgeClassMap[role] ||
          "bg-slate-100 text-slate-700 border-slate-200 font-medium";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs border tracking-wide uppercase ${badgeClass}`}
          >
            {role}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string, record: ApiUser) => {
        const isActive = status === "active";
        return (
          <div className="flex items-center gap-2">
            <Popconfirm
              title={
                isActive
                  ? `Block user ${record.name}?`
                  : `Unblock user ${record.name}?`
              }
              description={
                isActive
                  ? "They will immediately lose access to their account."
                  : "They will regain normal platform access."
              }
              okText={isActive ? "Block" : "Activate"}
              cancelText="Cancel"
              okButtonProps={isActive ? { danger: true } : {}}
              onConfirm={() => handleToggleStatus(record)}
            >
              <Switch
                checked={isActive}
                size="small"
                className={isActive ? "bg-emerald-600!" : "bg-slate-300!"}
              />
            </Popconfirm>
            <span
              className={`text-xs font-semibold capitalize ${
                isActive ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      title: "Verified",
      dataIndex: "verified",
      key: "verified",
      width: 120,
      render: (verified: boolean) =>
        verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircleFilled className="text-emerald-600" />
            <span>Verified</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
            <ClockCircleOutlined className="text-amber-600" />
            <span>Unverified</span>
          </span>
        ),
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (createdAt: string) => (
        <span className="text-xs text-slate-600">{formatDate(createdAt)}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "right",
      render: (_: unknown, record: ApiUser) => {
        const actionItems: MenuProps["items"] = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View Full Details",
            onClick: () => navigate(`/users/${record._id}`),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit User & Role",
            onClick: () => setEditingUser(record),
          },
          {
            key: "toggle",
            icon: <StopOutlined />,
            label: record.status === "active" ? "Block User" : "Activate User",
            onClick: () => handleToggleStatus(record),
          },
          { type: "divider" },
          {
            key: "delete",
            icon: <DeleteOutlined />,
            label: "Delete User",
            danger: true,
            onClick: () => {
              void handleDeleteSingle(record._id);
            },
          },
        ];

        return (
          <Dropdown menu={{ items: actionItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined className="text-slate-500 text-base" />}
              className="h-8 w-8 rounded-lg hover:bg-slate-100"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <GlassCard className="relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B3D2E] text-white shadow-md shadow-emerald-950/20">
              <TeamOutlined className="text-2xl" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 md:text-2xl">
                User Management
              </h1>
              <p className="text-xs text-slate-500">
                Oversee platform members, verified community accounts, and administrative access
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={handleRefresh}
              className="rounded-xl border-slate-200 text-slate-600 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExportCSV(false)}
              className="rounded-xl border-slate-200 text-slate-600 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Top KPI Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4 border-t border-slate-100 pt-4">
          {/* Total Members */}
          <div className="rounded-xl border border-indigo-100/80 bg-indigo-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900">Total Members</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <TeamOutlined />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats?.totalUsers ?? pagination.total}
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">
              +{stats?.newThisMonth ?? 0} new this month
            </span>
          </div>

          {/* Active Accounts */}
          <div className="rounded-xl border border-emerald-100/80 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Active Accounts</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircleOutlined />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats?.activeUsers ?? 0}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {stats?.totalUsers
                ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active rate`
                : "Live accounts"}
            </span>
          </div>

          {/* Verified Members */}
          <div className="rounded-xl border border-teal-100/80 bg-teal-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-900">Verified Members</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <CheckCircleFilled />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats?.verifiedUsers ?? 0}
            </div>
            <span className="text-[11px] text-teal-700 font-medium">
              {stats?.unverifiedUsers ?? 0} unverified
            </span>
          </div>

          {/* Blocked / Flagged */}
          <div className="rounded-xl border border-rose-100/80 bg-rose-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-900">Blocked / Pending</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <StopOutlined />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {stats?.blockedUsers ?? 0}
            </div>
            <span className="text-[11px] text-rose-700 font-medium">
              {stats?.pendingUsers ?? 0} pending reviews
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Role Segments & Filter Toolbar */}
      <div className="space-y-3">
        {/* Role Tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Segmented
            value={roleTab}
            onChange={(val) => {
              setRoleTab(String(val));
              setPage(1);
            }}
            options={[
              { label: `All Accounts (${stats?.totalUsers ?? pagination.total})`, value: "all" },
              { label: `Regular Users (${stats?.regularUsers ?? 0})`, value: "USER" },
              { label: `Admins (${stats?.admins ?? 0})`, value: "ADMIN" },
            ]}
            className="p-1 rounded-xl bg-slate-200/70 text-xs font-medium w-full sm:w-auto overflow-x-auto"
          />

          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-[#0B3D2E]"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Detailed Filter Dropdowns */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by name, email, or company…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              allowClear
              className="h-10 rounded-xl border-slate-200 bg-white hover:border-[#0B3D2E]/40 focus:border-[#0B3D2E] shadow-xs"
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl"
              options={[
                { label: "Status: All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Blocked", value: "blocked" },
                { label: "Pending", value: "pending" },
                { label: "Rejected", value: "rejected" },
              ]}
            />
          </div>

          <div>
            <Select
              value={verifiedFilter}
              onChange={(val) => {
                setVerifiedFilter(val);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl"
              options={[
                { label: "Verification: All", value: "all" },
                { label: "Verified Only", value: "verified" },
                { label: "Unverified", value: "unverified" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={isLoadingUsers || isFetching}
          pagination={false}
          scroll={{ x: 860 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          locale={{
            emptyText: (
              <EmptyState
                icon={<UserOutlined />}
                title={searchTerm ? "No users matching search" : "No users found"}
                description={
                  searchTerm
                    ? `No user records matched "${searchTerm}".`
                    : "There are currently no users registered under this criteria."
                }
                actionLabel={searchTerm ? "Clear Search" : undefined}
                onAction={searchTerm ? () => setSearchInput("") : undefined}
              />
            ),
          }}
          rowClassName={(record) =>
            selectedRowKeys.includes(record._id) ? "bg-emerald-50/40" : ""
          }
        />

        {/* Bottom Pagination */}
        {pagination.total > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 p-4 sm:flex-row bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, pagination.total)} of {pagination.total} users
            </span>

            <Pagination
              current={page}
              pageSize={limit}
              total={pagination.total}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
              onChange={(newPage, newLimit) => {
                setPage(newPage);
                setLimit(newLimit);
              }}
              className="text-xs"
            />
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedRowKeys.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-slate-900/90 px-5 py-3 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {selectedRowKeys.length}
            </span>
            <span className="text-xs font-medium text-slate-200">
              users selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExportCSV(true)}
            className="border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
          >
            Export Selected
          </Button>

          <Popconfirm
            title={`Delete ${selectedRowKeys.length} users?`}
            description="All profile records and uploaded files will be permanently deleted."
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={handleBulkDelete}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={isDeletingMultiple}
              className="text-xs font-semibold"
            >
              Delete Selected
            </Button>
          </Popconfirm>

          <Button
            size="small"
            type="text"
            onClick={() => setSelectedRowKeys([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Deselect
          </Button>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSuccess={() => {
          void refetchUsers();
          void refetchStats();
        }}
      />
    </div>
  );
}
