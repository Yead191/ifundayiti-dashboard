import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Avatar, Button, Popconfirm, Spin, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  TagOutlined,
  CopyOutlined,
  CheckOutlined,
  DollarCircleOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  useGetUserByIdQuery,
  useChangeUserStatusMutation,
  useDeleteUserMutation,
} from "@/redux/features/users/usersApi";
import { getImageUrl } from "@/lib/getImageUrl";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { userRoleBadgeClassMap, userStatusBadgeClassMap } from "./statusMaps";
import { EditUserModal } from "./components/EditUserModal";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: userRes,
    isLoading,
    isError,
    refetch,
  } = useGetUserByIdQuery(id || "", { skip: !id });

  const [changeStatus, { isLoading: isTogglingStatus }] =
    useChangeUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const user = userRes?.data;

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const nextStatus = user.status === "active" ? "blocked" : "active";
    try {
      await changeStatus({ id: user._id, status: nextStatus }).unwrap();
      toast.success(
        `User account has been ${nextStatus === "active" ? "activated" : "blocked"}.`,
      );
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user status.");
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteUser(user._id).unwrap();
      toast.success("User permanently deleted.");
      navigate("/users", { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <span className="text-sm font-medium text-slate-500">
          Loading user profile…
        </span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 text-2xl">
          <UserOutlined />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            The requested user could not be loaded or may have been deleted.
          </p>
        </div>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/users")}
          className="bg-[#0B3D2E] hover:bg-emerald-800! border-0 rounded-xl"
        >
          Back to Users Directory
        </Button>
      </div>
    );
  }

  const roleBadgeClass =
    userRoleBadgeClassMap[user.role] ||
    "bg-slate-100 text-slate-700 border-slate-200";
  const statusBadgeClass =
    userStatusBadgeClassMap[user.status] ||
    "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="space-y-6 pb-14">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/users")}
          className="rounded-lg text-slate-600 hover:bg-black/5 hover:text-[#0B3D2E] font-medium"
        >
          Back to Users Directory
        </Button>

        <div className="flex items-center gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditModalOpen(true)}
            className="rounded-xl border-slate-200 font-medium hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
          >
            Edit User & Role
          </Button>

          <Popconfirm
            title={
              user.status === "active"
                ? "Block this user account?"
                : "Re-activate this user account?"
            }
            description={
              user.status === "active"
                ? "The user will immediately lose access to their dashboard and account features."
                : "The user will regain access to their account."
            }
            okText={user.status === "active" ? "Block User" : "Activate User"}
            cancelText="Cancel"
            okButtonProps={
              user.status === "active"
                ? { danger: true }
                : { className: "bg-[#0B3D2E] border-0" }
            }
            onConfirm={handleToggleStatus}
          >
            <Button
              icon={<StopOutlined />}
              loading={isTogglingStatus}
              danger={user.status === "active"}
              className="rounded-xl font-medium"
            >
              {user.status === "active" ? "Block User" : "Unblock User"}
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Permanently delete user?"
            description="All associated records and storage files will be removed. This cannot be undone."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={handleDelete}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              className="rounded-xl font-medium hover:bg-rose-50"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <GlassCard className="relative overflow-hidden bg-linear-to-br from-white via-white to-emerald-50/30">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with status indicator */}
            <div className="relative">
              <Avatar
                size={84}
                src={getImageUrl(user.image)}
                icon={<UserOutlined className="text-3xl text-slate-400" />}
                className="border-2 border-white shadow-md bg-slate-100"
              />
              {user.verified && (
                <Tooltip title="Email Verified Account">
                  <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-emerald-500 text-emerald-600 text-sm">
                    <CheckCircleFilled />
                  </span>
                </Tooltip>
              )}
            </div>

            {/* Name, Roles, Email */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {user.name}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs border uppercase tracking-wider font-semibold ${roleBadgeClass}`}
                >
                  {user.role}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs border capitalize font-semibold ${statusBadgeClass}`}
                >
                  {user.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MailOutlined className="text-slate-400" />
                  <span>{user.email}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.email, "email", "Email")}
                    className="text-slate-400 hover:text-emerald-700 ml-1 transition"
                  >
                    {copiedKey === "email" ? (
                      <CheckOutlined className="text-emerald-600" />
                    ) : (
                      <CopyOutlined />
                    )}
                  </button>
                </div>

                <span className="text-slate-300">·</span>

                <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                  <span>ID: {user._id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user._id, "id", "User ID")}
                    className="text-slate-400 hover:text-emerald-700 ml-1 transition"
                  >
                    {copiedKey === "id" ? (
                      <CheckOutlined className="text-emerald-600" />
                    ) : (
                      <CopyOutlined />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-center shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Member Since
              </span>
              <div className="mt-0.5 text-xs font-bold text-slate-800">
                {formatRelativeTime(user.createdAt)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-center shadow-xs">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Auth Method
              </span>
              <div className="mt-0.5 text-xs font-bold text-slate-800 capitalize">
                {user.authType || "Credentials"}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Identity & Associated Activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Account Profile Card */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SafetyCertificateOutlined className="text-base text-[#0B3D2E]" />
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Profile & Contact Information
                </h3>
              </div>
              <Button
                size="small"
                type="link"
                icon={<EditOutlined />}
                onClick={() => setEditModalOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-800"
              >
                Edit Details
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-slate-400 font-medium">Full Name</span>
                <p className="mt-0.5 font-semibold text-slate-900 text-sm">
                  {user.name}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-slate-400 font-medium">
                  Email Address
                </span>
                <p className="mt-0.5 font-semibold text-slate-900 text-sm">
                  {user.email}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-slate-400 font-medium">
                  Company / Organization
                </span>
                <p className="mt-0.5 font-semibold text-slate-800 flex items-center gap-1.5">
                  <BankOutlined className="text-slate-400" />
                  <span>{user.company || "Not specified"}</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-slate-400 font-medium">
                  Area of Interest
                </span>
                <p className="mt-0.5 font-semibold text-slate-800 flex items-center gap-1.5">
                  <TagOutlined className="text-slate-400" />
                  <span>{user.interest || "General Community"}</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-slate-400 font-medium">
                  Email Verification
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {user.verified ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircleFilled /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <ClockCircleOutlined /> Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-slate-400 font-medium">
                  Account Registered
                </span>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {formatDateTime(user.createdAt)}
                </p>
              </div>
            </div>

            {user.rejectionReason && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-800">
                <span className="font-bold">
                  Administrative Note / Rejection Reason:
                </span>
                <p className="mt-0.5 text-rose-700">{user.rejectionReason}</p>
              </div>
            )}
          </GlassCard>

          {/* Connected Platform Activity Links */}
          <GlassCard className="space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Related Platform Activity
            </h3>
            <p className="text-xs text-slate-500">
              Quickly jump to records associated with this user across modules:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Link
                to={`/transactions?user=${user._id}`}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 hover:border-[#0B3D2E] hover:bg-emerald-50/40 transition group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-[#0B3D2E] group-hover:text-white transition">
                  <DollarCircleOutlined />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Transactions
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Audit payments & fees
                  </span>
                </div>
              </Link>

              <Link
                to={`/shop/orders?user=${user._id}`}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 hover:border-sky-500 hover:bg-sky-50/40 transition group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition">
                  <ShoppingOutlined />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Shop Orders
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Merchandise orders
                  </span>
                </div>
              </Link>

              <Link
                to={`/applications?searchTerm=${encodeURIComponent(user.name)}`}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 hover:border-purple-500 hover:bg-purple-50/40 transition group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition">
                  <FileTextOutlined />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Grants & Applications
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Cycle submissions
                  </span>
                </div>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Column: Account Summary & Control Actions */}
        <div className="space-y-6">
          {/* Account Overview Info */}
          <GlassCard className="space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <InfoCircleOutlined className="text-base text-[#0B3D2E]" />
              <h3 className="font-display text-sm font-bold text-slate-900">
                Account Status Summary
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Current Role</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] border font-semibold ${roleBadgeClass}`}
                >
                  {user.role}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Account Standing</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] border capitalize font-semibold ${statusBadgeClass}`}
                >
                  {user.status}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Registered</span>
                <span className="font-semibold text-slate-800">
                  {formatDateTime(user.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Profile Update</span>
                <span className="font-semibold text-slate-800">
                  {formatDateTime(user.updatedAt)}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions Panel */}
          <GlassCard className="space-y-3">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Account Control Actions
            </h3>

            <div className="space-y-2">
              <Button
                block
                icon={<EditOutlined />}
                onClick={() => setEditModalOpen(true)}
                className="rounded-xl h-10 font-semibold border-slate-200 hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
              >
                Change Role or Details
              </Button>

              <Popconfirm
                title={
                  user.status === "active"
                    ? "Confirm blocking account?"
                    : "Confirm unblocking account?"
                }
                okText="Proceed"
                cancelText="Cancel"
                okButtonProps={user.status === "active" ? { danger: true } : {}}
                onConfirm={handleToggleStatus}
              >
                <Button
                  block
                  danger={user.status === "active"}
                  icon={<StopOutlined />}
                  loading={isTogglingStatus}
                  className="rounded-xl h-10 font-semibold"
                >
                  {user.status === "active"
                    ? "Block This User"
                    : "Activate User"}
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Permanently remove account?"
                description="This will permanently delete this user from the database."
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={handleDelete}
              >
                <Button
                  block
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  className="rounded-xl h-10 font-semibold hover:bg-rose-50"
                >
                  Delete Account Record
                </Button>
              </Popconfirm>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Edit Modal */}
      <EditUserModal
        user={user}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => void refetch()}
      />
    </div>
  );
}
