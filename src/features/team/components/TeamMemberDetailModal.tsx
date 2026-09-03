import { Modal, Avatar, Tag, Button, Space, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  CalendarOutlined,
  CrownOutlined,
  HeartOutlined,
  TeamOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { toFileUrl } from "@/config";
import { formatDate } from "@/lib/utils";
import type { TeamMember } from "@/redux/features/team/team.types";

interface TeamMemberDetailModalProps {
  open: boolean;
  member: TeamMember | null;
  onCancel: () => void;
  onEdit?: (member: TeamMember) => void;
  onApprove?: (member: TeamMember) => void;
  onReject?: (member: TeamMember) => void;
  onBlock?: (member: TeamMember) => void;
}

export function TeamMemberDetailModal({
  open,
  member,
  onCancel,
  onEdit,
  onApprove,
  onReject,
  onBlock,
}: TeamMemberDetailModalProps) {
  if (!member) return null;

  const categoryConfig = {
    director: {
      label: "Board Director",
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
    pending: { label: "Pending Approval", color: "warning" },
    rejected: { label: "Rejected", color: "error" },
    blocked: { label: "Blocked", color: "default" },
  }[member.status] || { label: member.status, color: "default" };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      destroyOnHidden
      title={
        <span className="font-display text-base font-bold text-[#0B3D2E]">
          Member Profile Details
        </span>
      }
    >
      <div className="mt-4 space-y-5">
        {/* Header Profile Info */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy-700/40 bg-linear-to-r from-navy-800/10 via-navy-800/5 to-transparent p-5 sm:flex-row">
          <Avatar
            src={toFileUrl(member.image)}
            icon={<UserOutlined />}
            size={88}
            className="border-2 border-violet-600/30 bg-white shadow-md"
          />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h3 className="font-display text-xl font-bold text-cloud-100">
                {member.name}
              </h3>
              {member.featured && (
                <Tag
                  color="gold"
                  className="rounded-full border-0 text-[10px] font-bold"
                >
                  ★ Featured
                </Tag>
              )}
            </div>

            {member.title && (
              <p className="mt-1 text-sm font-semibold text-violet-500">
                {member.title}
              </p>
            )}

            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Tag
                color={categoryConfig.color}
                icon={categoryConfig.icon}
                className="rounded-full border-0 font-medium"
              >
                {categoryConfig.label}
              </Tag>
              <Tag
                color={statusConfig.color}
                className="rounded-full border-0 font-semibold"
              >
                {statusConfig.label}
              </Tag>
            </div>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-mist-500 sm:justify-start">
              <EnvironmentOutlined />
              <span>{member.location || "Location not specified"}</span>
            </p>
          </div>
        </div>

        {/* Rejection notice if rejected */}
        {member.status === "rejected" && member.rejectionReason && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700">
            <span className="font-bold">Rejection Notice: </span>
            {member.rejectionReason}
          </div>
        )}

        {/* Biography */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-mist-500">
            Biography
          </div>
          <div
            className="mt-1.5 text-sm leading-relaxed text-[#111827] [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-cloud-100 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-cloud-100 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-cloud-100 [&_a]:text-violet-600 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-violet-500/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_strong]:font-semibold [&_strong]:text-black"
            dangerouslySetInnerHTML={{
              __html: member.bio || "No biography provided.",
            }}
          />
        </div>

        {/* Focus Areas */}
        {Array.isArray(member.focusAreas) && member.focusAreas.length > 0 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-mist-500">
              Focus Areas & Skills
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {member.focusAreas.map((area, idx) => (
                <Tag
                  key={idx}
                  className="rounded-lg border-0 bg-violet-600/10 px-2.5 py-0.5 text-xs font-medium text-violet-700"
                >
                  {area}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <Divider className="my-2 border-navy-700/30" />

        {/* Contact Information */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-mist-500 mb-2">
            Contact & Social Channels
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-navy-700/40 bg-white/60 p-2.5">
              <MailOutlined className="text-violet-600" />
              <span className="text-mist-500">Email:</span>
              <a
                href={`mailto:${member.email}`}
                className="font-medium text-cloud-100 hover:underline truncate"
              >
                {member.email}
              </a>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-navy-700/40 bg-white/60 p-2.5">
              <PhoneOutlined className="text-emerald-600" />
              <span className="text-mist-500">Phone:</span>
              <span className="font-medium text-cloud-100">
                {member.phone || "—"}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-navy-700/40 bg-white/60 p-2.5">
              <LinkedinOutlined className="text-blue-600" />
              <span className="text-mist-500">LinkedIn:</span>
              {member.linkedin ? (
                <a
                  href={
                    member.linkedin.startsWith("http")
                      ? member.linkedin
                      : `https://${member.linkedin}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-violet-600 hover:underline truncate"
                >
                  Profile Link
                </a>
              ) : (
                <span className="text-mist-400">—</span>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-navy-700/40 bg-white/60 p-2.5">
              <TwitterOutlined className="text-sky-500" />
              <span className="text-mist-500">Twitter:</span>
              {member.twitter ? (
                <a
                  href={
                    member.twitter.startsWith("http")
                      ? member.twitter
                      : `https://${member.twitter}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-violet-600 hover:underline truncate"
                >
                  Handle Link
                </a>
              ) : (
                <span className="text-mist-400">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-700/40 pt-3 text-[11px] text-mist-400">
          <div className="flex items-center gap-1.5">
            <CalendarOutlined />
            <span>
              Joined on {member.createdAt ? formatDate(member.createdAt) : "—"}
            </span>
          </div>
          <div>
            ID: <span className="font-mono">{member._id}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-700/40 pt-4">
          <div>
            {member.status === "pending" && (
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => {
                    onApprove?.(member);
                    onCancel();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 border-0 rounded-xl"
                >
                  Approve Volunteer
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    onReject?.(member);
                    onCancel();
                  }}
                  className="rounded-xl"
                >
                  Reject
                </Button>
              </Space>
            )}

            {member.status !== "pending" && member.status !== "blocked" && (
              <Button
                danger
                type="text"
                icon={<StopOutlined />}
                onClick={() => {
                  onBlock?.(member);
                  onCancel();
                }}
                className="text-xs hover:bg-red-50"
              >
                Block Member
              </Button>
            )}
          </div>

          <Space>
            <Button onClick={onCancel} className="rounded-xl">
              Close
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onEdit?.(member);
                onCancel();
              }}
              className="btn-linear rounded-xl border-0"
            >
              Edit Profile
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
}
