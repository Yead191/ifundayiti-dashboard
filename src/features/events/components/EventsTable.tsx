import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Tooltip, Progress, Popconfirm, Select } from "antd";
import type { TableProps } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  StarFilled,
  EnvironmentOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  CalendarOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import type { IEvent } from "@/redux/features/events/events.types";
import {
  getCategoryBadge,
  getFormatBadge,
} from "../statusMaps";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toFileUrl } from "@/config";

interface EventsTableProps {
  data: IEvent[];
  loading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
}

export function EventsTable({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onDelete,
  onStatusChange,
}: EventsTableProps) {
  const navigate = useNavigate();

  const columns: TableProps<IEvent>["columns"] = [
    {
      title: "Event Details",
      key: "event",
      render: (_, record) => {
        const imageUrl = record.image ? toFileUrl(record.image) : "";
        return (
          <div className="flex items-center gap-3.5 py-1">
            {/* Banner Thumbnail */}
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={record.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200/60 text-slate-400">
                  <PictureOutlined className="text-xl" />
                </div>
              )}
              {record.featured && (
                <div className="absolute top-1 left-1 flex items-center justify-center rounded-md bg-amber-400 p-1 text-[9px] text-amber-950 shadow-xs">
                  <StarFilled />
                </div>
              )}
            </div>

            {/* Title & Location */}
            <div className="min-w-0 max-w-xs">
              <Link
                to={`/events/${record._id}`}
                className="font-display text-sm font-bold text-slate-900 hover:text-[#0B3D2E] transition line-clamp-1 block"
              >
                {record.title}
              </Link>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1">
                <EnvironmentOutlined className="text-[11px] text-slate-400" />
                <span>{record.location || "Online"}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Category & Format",
      key: "classification",
      width: 190,
      render: (_, record) => {
        const cat = getCategoryBadge(record.category);
        const fmt = getFormatBadge(record.type);

        const formatIcon =
          record.type === "virtual" ? (
            <VideoCameraOutlined />
          ) : record.type === "hybrid" ? (
            <GlobalOutlined />
          ) : (
            <EnvironmentOutlined />
          );

        return (
          <div className="flex flex-col gap-1.5 items-start">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.bgClass}`}
            >
              {cat.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${fmt.bgClass}`}
            >
              {formatIcon}
              <span>{fmt.label}</span>
            </span>
          </div>
        );
      },
    },
    {
      title: "Schedule",
      key: "schedule",
      width: 190,
      render: (_, record) => (
        <div className="text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <CalendarOutlined className="text-emerald-700" />
            <span>{formatDateTime(record.startDate)}</span>
          </div>
          {record.endDate && record.endDate !== record.startDate && (
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Until {formatDateTime(record.endDate)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Pricing",
      key: "pricing",
      width: 120,
      render: (_, record) => {
        const isFree =
          record.pricingType === "free" ||
          record.type === "virtual" ||
          !record.price;

        return isFree ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            FREE RSVP
          </span>
        ) : (
          <div className="font-display font-extrabold text-slate-900 text-sm">
            {formatCurrency(record.price)}
          </div>
        );
      },
    },
    {
      title: "Capacity & Seats",
      key: "capacity",
      width: 170,
      render: (_, record) => {
        const capacity = record.capacity || 1;
        const reserved = record.reservedCount || 0;
        const remaining = Math.max(0, record.remainingSeats ?? capacity - reserved);
        const percent = Math.min(100, Math.round((reserved / capacity) * 100));
        const isFull = remaining === 0;

        return (
          <div className="w-full">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-800">
                {reserved} / {capacity}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  isFull ? "text-rose-600" : remaining < 10 ? "text-amber-600" : "text-emerald-700"
                }`}
              >
                {isFull ? "SOLD OUT" : `${remaining} left`}
              </span>
            </div>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              status={isFull ? "exception" : "normal"}
              strokeColor={isFull ? "#e11d48" : percent > 80 ? "#d97706" : "#059669"}
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, record) => {
        const currentStatus = (record.status || "draft").toLowerCase();

        return (
          <Select
            value={currentStatus}
            onChange={(val) => onStatusChange(record._id, val)}
            className="w-full text-xs"
            options={[
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      align: "right",
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          {/* View Bookings Deep Link */}
          <Tooltip title="View Attendee Bookings">
            <Button
              type="text"
              size="small"
              icon={<TeamOutlined className="text-indigo-600" />}
              onClick={() => navigate(`/event-bookings?event=${record._id}`)}
              className="h-8 w-8 rounded-lg hover:bg-indigo-50"
            />
          </Tooltip>

          {/* View Details Page */}
          <Tooltip title="View Event Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined className="text-slate-600" />}
              onClick={() => navigate(`/events/${record._id}`)}
              className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-800"
            />
          </Tooltip>

          {/* Edit Event Page */}
          <Tooltip title="Edit Event Details">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-amber-600" />}
              onClick={() => navigate(`/events/${record._id}/edit`)}
              className="h-8 w-8 rounded-lg hover:bg-amber-50"
            />
          </Tooltip>

          {/* Delete Action */}
          <Tooltip title="Delete Event">
            <Popconfirm
              title="Delete Event"
              description="Are you sure you want to delete this event? All attendee ticket records will be affected."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record._id)}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="h-8 w-8 rounded-lg"
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
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
          className: "px-4 py-3",
        }}
        className="[&_.ant-table-thead_th]:bg-slate-50/80 [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:text-slate-500 [&_.ant-table-tbody_tr]:hover:bg-emerald-50/20"
      />
    </div>
  );
}
