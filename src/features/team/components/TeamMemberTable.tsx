import { Table, Avatar, Tag, Space, Button, Popconfirm, Dropdown, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
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
import { toFileUrl } from "@/config";
import type { TeamMember, TeamStatus } from "@/redux/features/team/team.types";

interface TeamMemberTableProps {
  data: TeamMember[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onView: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: TeamStatus) => void;
  onOpenRejectModal: (member: TeamMember) => void;
}

export function TeamMemberTable({
  data,
  loading = false,
  page,
  pageSize,
  total,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
  onOpenRejectModal,
}: TeamMemberTableProps) {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "director":
        return { label: "Director", color: "gold", icon: <CrownOutlined /> };
      case "member":
        return { label: "Core Member", color: "blue", icon: <TeamOutlined /> };
      case "volunteer":
        return { label: "Volunteer", color: "purple", icon: <HeartOutlined /> };
      default:
        return { label: category, color: "default", icon: <UserOutlined /> };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Active", color: "success" };
      case "pending":
        return { label: "Pending", color: "warning" };
      case "rejected":
        return { label: "Rejected", color: "error" };
      case "blocked":
        return { label: "Blocked", color: "default" };
      default:
        return { label: status, color: "default" };
    }
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: "Team Member",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={toFileUrl(record.image)}
            icon={<UserOutlined />}
            size={42}
            className="border border-navy-700/40 bg-white"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-display text-sm font-bold text-cloud-100">
              <span
                onClick={() => onView(record)}
                className="cursor-pointer hover:text-violet-600 hover:underline truncate"
              >
                {record.name}
              </span>
              {record.featured && (
                <Tag color="gold" className="rounded-full border-0 text-[9px] font-bold">
                  ★
                </Tag>
              )}
            </div>
            <div className="text-xs text-mist-500 truncate">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => {
        const config = getCategoryConfig(category);
        return (
          <Tag color={config.color} icon={config.icon} className="rounded-full border-0 font-medium">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => {
        const config = getStatusConfig(status);
        return (
          <div className="space-y-1">
            <Tag color={config.color} className="rounded-full border-0 font-semibold">
              {config.label}
            </Tag>
            {status === "rejected" && record.rejectionReason && (
              <div className="max-w-[180px] text-[10px] text-rose-600 truncate" title={record.rejectionReason}>
                Reason: {record.rejectionReason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location: string) => (
        <span className="text-xs text-mist-600">{location || "—"}</span>
      ),
    },
    {
      title: "Focus Areas",
      dataIndex: "focusAreas",
      key: "focusAreas",
      render: (areas: string[]) => (
        <div className="flex max-w-[200px] flex-wrap gap-1">
          {Array.isArray(areas) && areas.slice(0, 2).map((area, idx) => (
            <Tag key={idx} className="rounded-md border-0 bg-navy-700/20 text-[10px] text-mist-600">
              {area}
            </Tag>
          ))}
          {Array.isArray(areas) && areas.length > 2 && (
            <Tooltip title={areas.slice(2).join(", ")}>
              <Tag className="rounded-md border-0 bg-violet-600/10 text-[10px] font-semibold text-violet-600">
                +{areas.length - 2}
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Contact & Links",
      key: "contacts",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          {record.email && (
            <Tooltip title={record.email}>
              <a
                href={`mailto:${record.email}`}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-navy-700/40 bg-white text-mist-500 hover:text-violet-600"
              >
                <MailOutlined className="text-xs" />
              </a>
            </Tooltip>
          )}
          {record.phone && (
            <Tooltip title={record.phone}>
              <a
                href={`tel:${record.phone}`}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-navy-700/40 bg-white text-mist-500 hover:text-emerald-600"
              >
                <PhoneOutlined className="text-xs" />
              </a>
            </Tooltip>
          )}
          {record.linkedin && (
            <Tooltip title="LinkedIn">
              <a
                href={record.linkedin.startsWith("http") ? record.linkedin : `https://${record.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-6 w-6 items-center justify-center rounded-md border border-navy-700/40 bg-white text-mist-500 hover:text-blue-600"
              >
                <LinkedinOutlined className="text-xs" />
              </a>
            </Tooltip>
          )}
          {record.twitter && (
            <Tooltip title="Twitter / X">
              <a
                href={record.twitter.startsWith("http") ? record.twitter : `https://${record.twitter}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-6 w-6 items-center justify-center rounded-md border border-navy-700/40 bg-white text-mist-500 hover:text-sky-500"
              >
                <TwitterOutlined className="text-xs" />
              </a>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => {
        const statusMenuItems: MenuProps["items"] = [
          {
            key: "active",
            label: "Mark as Active",
            icon: <CheckOutlined className="text-emerald-500" />,
            disabled: record.status === "active",
            onClick: () => onChangeStatus(record._id, "active"),
          },
          {
            key: "pending",
            label: "Mark as Pending",
            disabled: record.status === "pending",
            onClick: () => onChangeStatus(record._id, "pending"),
          },
          {
            key: "rejected",
            label: "Reject Application",
            icon: <CloseOutlined className="text-rose-500" />,
            disabled: record.status === "rejected",
            onClick: () => onOpenRejectModal(record),
          },
          {
            key: "blocked",
            label: "Block Member",
            icon: <StopOutlined className="text-slate-500" />,
            disabled: record.status === "blocked",
            danger: true,
            onClick: () => onChangeStatus(record._id, "blocked"),
          },
        ];

        return (
          <Space size={4}>
            {record.status === "pending" ? (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => onChangeStatus(record._id, "active")}
                  className="bg-emerald-600 hover:bg-emerald-700 border-0 rounded-lg text-[11px]"
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => onOpenRejectModal(record)}
                  className="rounded-lg text-[11px]"
                >
                  Reject
                </Button>
              </>
            ) : null}

            <Tooltip title="View Profile">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
                className="rounded-lg text-mist-500 hover:bg-violet-600/10 hover:text-violet-600"
              />
            </Tooltip>

            <Tooltip title="Edit Profile">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
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
              onConfirm={() => onDelete(record._id)}
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
        );
      },
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: onPageChange,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (tot) => `Total ${tot} members`,
        }}
        className="custom-table"
      />
    </div>
  );
}
