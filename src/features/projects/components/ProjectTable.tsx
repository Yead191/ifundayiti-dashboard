import {
  Table,
  Tag,
  Button,
  Space,
  Popconfirm,
  Dropdown,
  Tooltip,
  Switch,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  MoreOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type {
  Project,
  ProjectStatus,
} from "@/redux/features/projects/project.types";
import {
  CATEGORY_CONFIG,
  STATUS_CONFIG,
  formatGrantAmount,
} from "../projectHelpers";

interface ProjectTableProps {
  data: Project[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: ProjectStatus) => void;
  onToggleFeatured: (id: string) => void;
  togglingId?: string | null;
}

export function ProjectTable({
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
  onToggleFeatured,
  togglingId,
}: ProjectTableProps) {
  const getStatusMenuItems = (project: Project): MenuProps["items"] => [
    {
      key: "Published",
      label: "Mark as Published",
      icon: <CheckOutlined className="text-emerald-500" />,
      disabled: project.status === "Published",
      onClick: () => onChangeStatus(project._id, "Published"),
    },
    {
      key: "Draft",
      label: "Move to Draft",
      icon: <ClockCircleOutlined className="text-amber-500" />,
      disabled: project.status === "Draft",
      onClick: () => onChangeStatus(project._id, "Draft"),
    },
    {
      key: "Archived",
      label: "Archive Project",
      icon: <InboxOutlined className="text-slate-500" />,
      disabled: project.status === "Archived",
      onClick: () => onChangeStatus(project._id, "Archived"),
    },
  ];

  const columns: ColumnsType<Project> = [
    {
      title: "Project",
      key: "project",
      width: 280,
      render: (_, record) => {
        const catConfig = CATEGORY_CONFIG[record.category] || {
          label: record.category,
          color: "default",
        };

        return (
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div
              className="relative h-13 w-13 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-navy-700/60 bg-navy-950/40"
              onClick={() => onView(record)}
            >
              {record.image ? (
                <img
                  src={toFileUrl(record.image)}
                  alt={record.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-mist-400">
                  <PictureOutlined />
                </div>
              )}
            </div>

            {/* Title & Category */}
            <div className="min-w-0 flex-1">
              <div
                onClick={() => onView(record)}
                className="cursor-pointer font-display text-sm font-bold text-cloud-100 transition-colors hover:text-emerald-700 line-clamp-1"
              >
                {record.name}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <Tag
                  color={catConfig.color}
                  className="m-0 rounded-full border-0 text-[10px] font-medium"
                >
                  {catConfig.label}
                </Tag>
                {record.year && (
                  <span className="text-[11px] text-mist-500 font-medium">
                    · {record.year}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Location & Founder",
      key: "location",
      width: 180,
      render: (_, record) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1 text-cloud-100 font-medium truncate">
            <EnvironmentOutlined className="text-emerald-600 shrink-0" />
            <span className="truncate">{record.location}</span>
          </div>
          {record.founder && (
            <div className="flex items-center gap-1 text-mist-500 truncate">
              <UserOutlined className="text-violet-500 shrink-0" />
              <span className="truncate">{record.founder}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Grant Amount",
      key: "grantAmount",
      width: 130,
      render: (_, record) => (
        <span className="inline-flex rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/20">
          {formatGrantAmount(record.grantAmount)}
        </span>
      ),
    },
    {
      title: "Grant Cycle",
      key: "cycle",
      width: 170,
      render: (_, record) => {
        const cycle =
          typeof record.applicationPeriod === "object" &&
          record.applicationPeriod !== null
            ? record.applicationPeriod.title
            : null;

        return cycle ? (
          <span className="truncate text-xs text-mist-600 font-medium block max-w-37.5">
            {cycle}
          </span>
        ) : (
          <span className="text-xs text-mist-400 italic">None</span>
        );
      },
    },
    {
      title: "Spotlight",
      key: "featured",
      width: 110,
      align: "center",
      render: (_, record) => {
        const isFeatured = Boolean(record.featured);
        const isToggling = togglingId === record._id;

        return (
          <Tooltip
            title={
              isFeatured
                ? "Featured on public home (Click to toggle)"
                : "Click to Spotlight"
            }
          >
            <button
              type="button"
              disabled={isToggling}
              onClick={() => onToggleFeatured(record._id)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                isFeatured
                  ? "bg-amber-500/15 text-amber-600 border border-amber-400/40 hover:bg-amber-500/25"
                  : "bg-navy-700/30 text-mist-400 border border-transparent hover:bg-navy-700/60 hover:text-amber-500"
              }`}
            >
              {isFeatured ? (
                <StarFilled className="text-amber-500 text-xs" />
              ) : (
                <StarOutlined className="text-xs" />
              )}
              <span>{isFeatured ? "Featured" : "Normal"}</span>
            </button>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      render: (_, record) => {
        const statusConfig = STATUS_CONFIG[record.status] || {
          label: record.status,
          color: "default",
        };

        return (
          <Dropdown
            menu={{ items: getStatusMenuItems(record) }}
            trigger={["click"]}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-2 py-1 hover:bg-black/5 transition-colors"
            >
              <Tag
                color={statusConfig.color}
                className="m-0 rounded-full border-0 text-[11px] font-semibold"
              >
                {statusConfig.label}
              </Tag>
              <MoreOutlined className="text-mist-400 text-xs" />
            </button>
          </Dropdown>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      align: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View Project Story">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              className="rounded-lg text-mist-500 hover:bg-emerald-50 hover:text-emerald-700"
            />
          </Tooltip>
          <Tooltip title="Edit Project">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className="rounded-lg text-mist-500 hover:bg-emerald-50 hover:text-emerald-700"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this project?"
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
      ),
    },
  ];

  return (
    <GlassCard className="border border-navy-700/60 p-0 overflow-hidden shadow-xs">
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
          showTotal: (tot) => `Total ${tot} projects`,
          className: "px-4 py-3",
        }}
        scroll={{ x: 1000 }}
      />
    </GlassCard>
  );
}
