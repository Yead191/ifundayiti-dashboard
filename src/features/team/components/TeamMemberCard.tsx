import {
  Avatar,
  Tag,
  Button,
  Space,
  Popconfirm,
  Dropdown,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  EyeOutlined,
  CrownOutlined,
  HeartOutlined,
  TeamOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type { TeamMember, TeamStatus } from "@/redux/features/team/team.types";

interface TeamMemberCardProps {
  member: TeamMember;
  onView: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: TeamStatus) => void;
  onOpenRejectModal: (member: TeamMember) => void;
}

export function TeamMemberCard({
  member,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
  onOpenRejectModal,
}: TeamMemberCardProps) {
  const categoryConfig = {
    director: {
      label: "Director",
      color: "gold",
      icon: <CrownOutlined />,
    },
    member: {
      label: "Core Member",
      color: "blue",
      icon: <TeamOutlined />,
    },
    volunteer: {
      label: "Volunteer",
      color: "purple",
      icon: <HeartOutlined />,
    },
  }[member.category] || {
    label: member.category,
    color: "default",
    icon: <UserOutlined />,
  };

  const statusConfig = {
    active: { label: "Active", color: "success" },
    pending: { label: "Pending", color: "warning" },
    rejected: { label: "Rejected", color: "error" },
    blocked: { label: "Blocked", color: "default" },
  }[member.status] || { label: member.status, color: "default" };

  const statusMenuItems: MenuProps["items"] = [
    {
      key: "active",
      label: "Mark as Active",
      icon: <CheckOutlined className="text-emerald-500" />,
      disabled: member.status === "active",
      onClick: () => onChangeStatus(member._id, "active"),
    },
    {
      key: "pending",
      label: "Mark as Pending",
      disabled: member.status === "pending",
      onClick: () => onChangeStatus(member._id, "pending"),
    },
    {
      key: "rejected",
      label: "Reject Application",
      icon: <CloseOutlined className="text-rose-500" />,
      disabled: member.status === "rejected",
      onClick: () => onOpenRejectModal(member),
    },
    {
      key: "blocked",
      label: "Block Member",
      icon: <StopOutlined className="text-slate-500" />,
      disabled: member.status === "blocked",
      danger: true,
      onClick: () => onChangeStatus(member._id, "blocked"),
    },
  ];

  return (
    <GlassCard className="group relative flex flex-col justify-between overflow-hidden border border-navy-700/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-600/50 hover:shadow-lg">
      {/* Featured Star Top Badge */}
      {member.featured && (
        <Tag
          color="gold"
          className="absolute right-3.5 top-3.5 rounded-full border-0 text-[10px] font-bold shadow-xs"
        >
          ★ Featured
        </Tag>
      )}

      <div>
        {/* Profile Card Header */}
        <div className="flex items-start gap-3.5">
          <div className="relative cursor-pointer" onClick={() => onView(member)}>
            <Avatar
              src={toFileUrl(member.image)}
              icon={<UserOutlined />}
              size={64}
              className="border-2 border-violet-600/20 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                member.status === "active"
                  ? "bg-emerald-500"
                  : member.status === "pending"
                    ? "bg-amber-500"
                    : member.status === "rejected"
                      ? "bg-rose-500"
                      : "bg-slate-400"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4
              onClick={() => onView(member)}
              className="cursor-pointer truncate font-display text-base font-bold text-cloud-100 transition-colors hover:text-violet-600"
            >
              {member.name}
            </h4>

            {member.title && (
              <p className="mt-0.5 truncate text-[11px] font-medium text-violet-500">
                {member.title}
              </p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Tag
                color={categoryConfig.color}
                icon={categoryConfig.icon}
                className="rounded-full border-0 text-[10px] font-medium"
              >
                {categoryConfig.label}
              </Tag>
              <Tag color={statusConfig.color} className="rounded-full border-0 text-[10px] font-semibold">
                {statusConfig.label}
              </Tag>
            </div>

            <p className="mt-1 flex items-center gap-1 text-[11px] text-mist-500">
              <EnvironmentOutlined />
              <span className="truncate">{member.location || "Haiti"}</span>
            </p>
          </div>
        </div>

        {/* Short Biography */}
        <p className="mt-3.5 line-clamp-3 text-xs leading-relaxed text-mist-600">
          {member.bio || "No background details provided."}
        </p>

        {/* Focus Areas */}
        {Array.isArray(member.focusAreas) && member.focusAreas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {member.focusAreas.slice(0, 3).map((area, idx) => (
              <Tag
                key={idx}
                className="rounded-md border-0 bg-navy-700/30 text-[10px] text-mist-600"
              >
                {area}
              </Tag>
            ))}
            {member.focusAreas.length > 3 && (
              <Tooltip title={member.focusAreas.slice(3).join(", ")}>
                <Tag className="rounded-md border-0 bg-violet-600/10 text-[10px] font-semibold text-violet-600">
                  +{member.focusAreas.length - 3} more
                </Tag>
              </Tooltip>
            )}
          </div>
        )}

        {/* Rejection Notice Snippet */}
        {member.status === "rejected" && member.rejectionReason && (
          <div className="mt-3 rounded-xl border border-rose-200/60 bg-rose-50/70 p-2.5 text-[11px] text-rose-700">
            <span className="font-semibold">Reason:</span> {member.rejectionReason}
          </div>
        )}
      </div>

      {/* Card Footer & Contacts */}
      <div className="mt-4 border-t border-navy-700/40 pt-3">
        <div className="flex items-center justify-between">
          {/* Socials & Contacts */}
          <div className="flex items-center gap-2">
            {member.email && (
              <Tooltip title={member.email}>
                <a
                  href={`mailto:${member.email}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-navy-700/40 bg-white/70 text-mist-500 transition-colors hover:border-violet-600 hover:text-violet-600"
                >
                  <MailOutlined className="text-xs" />
                </a>
              </Tooltip>
            )}
            {member.phone && (
              <Tooltip title={member.phone}>
                <a
                  href={`tel:${member.phone}`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-navy-700/40 bg-white/70 text-mist-500 transition-colors hover:border-emerald-600 hover:text-emerald-600"
                >
                  <PhoneOutlined className="text-xs" />
                </a>
              </Tooltip>
            )}
            {member.linkedin && (
              <Tooltip title="LinkedIn Profile">
                <a
                  href={member.linkedin.startsWith("http") ? member.linkedin : `https://${member.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-navy-700/40 bg-white/70 text-mist-500 transition-colors hover:border-blue-600 hover:text-blue-600"
                >
                  <LinkedinOutlined className="text-xs" />
                </a>
              </Tooltip>
            )}
            {member.twitter && (
              <Tooltip title="Twitter / X Profile">
                <a
                  href={member.twitter.startsWith("http") ? member.twitter : `https://${member.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-navy-700/40 bg-white/70 text-mist-500 transition-colors hover:border-sky-500 hover:text-sky-500"
                >
                  <TwitterOutlined className="text-xs" />
                </a>
              </Tooltip>
            )}
          </div>

          {/* Quick Action Buttons */}
          {member.status === "pending" ? (
            <Space size={4}>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => onChangeStatus(member._id, "active")}
                className="bg-emerald-600 hover:bg-emerald-700 border-0 rounded-lg text-[11px]"
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => onOpenRejectModal(member)}
                className="rounded-lg text-[11px]"
              >
                Reject
              </Button>
            </Space>
          ) : (
            <Space size={4}>
              <Tooltip title="View Profile Details">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onView(member)}
                  className="rounded-lg text-mist-500 hover:bg-violet-600/10 hover:text-violet-600"
                />
              </Tooltip>
              <Tooltip title="Edit Profile">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(member)}
                  className="rounded-lg text-mist-500 hover:bg-violet-600/10 hover:text-violet-600"
                />
              </Tooltip>

              <Dropdown menu={{ items: statusMenuItems }} trigger={["click"]}>
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  className="rounded-lg text-mist-500 hover:bg-black/5"
                />
              </Dropdown>

              <Popconfirm
                title="Delete team member profile?"
                description="This action cannot be undone."
                onConfirm={() => onDelete(member._id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="rounded-lg hover:bg-red-50"
                />
              </Popconfirm>
            </Space>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
