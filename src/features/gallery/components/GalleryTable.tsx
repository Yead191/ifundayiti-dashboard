import {
  Table,
  Tag,
  Button,
  Space,
  Popconfirm,
  Dropdown,
  Tooltip,
  Switch,
  Image,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  StarFilled,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { toFileUrl } from "@/config";
import type {
  GalleryCategory,
  GalleryItem,
  GalleryStatus,
} from "@/redux/features/gallery/gallery.types";
import {
  GALLERY_CATEGORY_CONFIG,
  GALLERY_STATUS_CONFIG,
  formatGalleryDate,
} from "../galleryHelpers";

interface GalleryTableProps {
  items: GalleryItem[];
  loading?: boolean;
  onPreview: (item: GalleryItem) => void;
  onEdit: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: GalleryStatus) => void;
  onToggleFeatured: (id: string) => void;
  togglingId?: string | null;
}

export function GalleryTable({
  items,
  loading = false,
  onPreview,
  onEdit,
  onDelete,
  onChangeStatus,
  onToggleFeatured,
  togglingId,
}: GalleryTableProps) {
  const getStatusMenuItems = (record: GalleryItem): MenuProps["items"] => [
    {
      key: "Published",
      label: "Mark as Published",
      icon: <CheckOutlined className="text-emerald-500" />,
      disabled: record.status === "Published",
      onClick: () => onChangeStatus(record._id, "Published"),
    },
    {
      key: "Draft",
      label: "Move to Draft",
      icon: <ClockCircleOutlined className="text-amber-500" />,
      disabled: record.status === "Draft",
      onClick: () => onChangeStatus(record._id, "Draft"),
    },
    {
      key: "Archived",
      label: "Archive Photo",
      icon: <InboxOutlined className="text-slate-400" />,
      disabled: record.status === "Archived",
      onClick: () => onChangeStatus(record._id, "Archived"),
    },
  ];

  const columns: ColumnsType<GalleryItem> = [
    {
      title: "Photo",
      key: "image",
      width: 100,
      render: (_, record) => {
        const url = toFileUrl(record.image);
        return (
          <div className="relative h-14 w-20 overflow-hidden rounded-xl bg-navy-900/10 border border-navy-700/30">
            {url ? (
              <Image
                src={url}
                alt={record.title}
                className="h-full w-full object-cover"
                preview={{
                  mask: <EyeOutlined className="text-sm" />,
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-mist-400">
                No image
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Title & Story",
      key: "title",
      render: (_, record) => (
        <div className="max-w-xs space-y-1">
          <div
            onClick={() => onPreview(record)}
            className="font-display line-clamp-1 cursor-pointer font-bold text-cloud-100 hover:text-emerald-700 transition-colors"
          >
            {record.title}
          </div>
          {record.description && (
            <p className="line-clamp-1 text-xs text-mist-500">
              {record.description}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 170,
      render: (category: string) => {
        const config = GALLERY_CATEGORY_CONFIG[category as GalleryCategory] || {
          label: category,
          color: "default",
        };
        return (
          <Tag color={config.color} className="rounded-full font-medium">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (location?: string) =>
        location ? (
          <span className="flex items-center gap-1.5 text-xs text-mist-600 font-medium">
            <EnvironmentOutlined className="text-emerald-600 shrink-0" />
            <span className="truncate max-w-32">{location}</span>
          </span>
        ) : (
          <span className="text-xs text-mist-400">—</span>
        ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 130,
      render: (date?: string) => (
        <span className="flex items-center gap-1.5 text-xs text-mist-500">
          <CalendarOutlined className="text-mist-400" />
          <span>{formatGalleryDate(date)}</span>
        </span>
      ),
    },
    {
      title: "Spotlight",
      dataIndex: "featured",
      key: "featured",
      width: 110,
      align: "center",
      render: (featured: boolean, record) => {
        const isToggling = togglingId === record._id;
        return (
          <Tooltip
            title={
              featured
                ? "Featured on Homepage (Click to toggle)"
                : "Click to Feature in Spotlight"
            }
          >
            <Switch
              size="small"
              checked={featured}
              loading={isToggling}
              onChange={() => onToggleFeatured(record._id)}
              checkedChildren={<StarFilled className="text-amber-400 text-[10px]" />}
              className={featured ? "!bg-amber-500" : ""}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: GalleryStatus, record) => {
        const config = GALLERY_STATUS_CONFIG[status] || {
          label: status,
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
                color={config.color}
                className="m-0 rounded-full font-semibold border-0 text-xs"
              >
                {config.label}
              </Tag>
              <MoreOutlined className="text-xs text-mist-400" />
            </button>
          </Dropdown>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      align: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onPreview(record)}
              className="rounded-lg text-mist-500 hover:text-emerald-700"
            />
          </Tooltip>

          <Tooltip title="Edit Metadata">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className="rounded-lg text-mist-500 hover:text-emerald-700"
            />
          </Tooltip>

          <Popconfirm
            title="Delete photo?"
            description="Permanently delete from catalog and remove image from disk."
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
              className="rounded-lg"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-700/60 bg-white/70 backdrop-blur-sm shadow-xs">
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={false}
        className="custom-table"
      />
    </div>
  );
}
