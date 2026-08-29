import { Avatar, Table, Button, Dropdown } from "antd";
import type { TableProps, MenuProps } from "antd";
import { UserOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { statusToneMap, statusLabelMap } from "@/features/core/statusMaps";
import type { APIApplication } from "@/redux/features/applications/applicationsApi";
import {
  ACTION_META,
  STATUS_ACTIONS,
  type AppActionKey,
} from "../applicationActions";
import { useNavigate } from "react-router-dom";
import { toFileUrl } from "@/config";

export interface ApplicationsTableProps {
  data: APIApplication[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onAction: (key: AppActionKey, application: APIApplication) => void;
}

export function ApplicationsTable({
  data,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onAction,
}: ApplicationsTableProps) {
  const navigate = useNavigate();

  const columns: TableProps<APIApplication>["columns"] = [
    {
      title: "Applicant",
      key: "applicant",
      render: (_, record) => {
        const imageUrl = toFileUrl(record.personal?.image);
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={imageUrl}
              icon={<UserOutlined />}
              size={40}
              className="border border-navy-700/60"
            />
            <div className="min-w-0">
              <div
                className="font-semibold text-cloud-100 hover:text-violet-600 cursor-pointer transition-colors duration-200"
                onClick={() => navigate(`/applications/${record._id}`)}
              >
                {record.personal?.name || "Anonymous"}
              </div>
              <div className="font-mono text-[10px] text-mist-600 truncate max-w-30">
                {record._id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Project",
      key: "project",
      responsive: ["md"],
      render: (_, record) => (
        <div className="max-w-55 truncate text-mist-400 font-medium">
          {record.grant?.projectName}
        </div>
      ),
    },
    {
      title: "Requested",
      key: "requestedAmount",
      sorter: (a, b) => a.grant.requestedAmount - b.grant.requestedAmount,
      render: (_, record) => (
        <span className="font-bold text-cloud-100">
          {formatCurrency(record.grant?.requestedAmount)}
        </span>
      ),
    },
    {
      title: "Period",
      key: "period",
      responsive: ["lg"],
      render: (_, record) => (
        <span className="text-mist-500 font-medium">
          {record.applicationPeriod?.title || "—"}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <StatusTag
          tone={
            statusToneMap[record.status as keyof typeof statusToneMap] ||
            "neutral"
          }
        >
          {statusLabelMap[record.status as keyof typeof statusLabelMap] ||
            record.status}
        </StatusTag>
      ),
    },
    {
      title: "Submitted",
      key: "createdAt",
      responsive: ["md"],
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (_, record) => (
        <span className="text-mist-500">{formatDate(record.createdAt)}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      align: "right",
      render: (_, record) => {
        const actions =
          STATUS_ACTIONS[record.status as keyof typeof STATUS_ACTIONS] || [];
        const menuItems: MenuProps["items"] = actions.map((key) => ({
          key,
          label: ACTION_META[key].label,
          icon: ACTION_META[key].icon,
          danger: ACTION_META[key].danger,
          onClick: () => onAction(key, record),
        }));

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/applications/${record._id}`)}
              className="hover:text-violet-600 hover:border-violet-600"
            >
              View
            </Button>
            {actions.length > 0 && (
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  size="small"
                  icon={<MoreOutlined />}
                  aria-label="More actions"
                  className="hover:text-violet-600 hover:border-violet-600"
                />
              </Dropdown>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        current: page,
        pageSize: pageSize,
        total: total,
        onChange: onPageChange,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20", "50"],
        className: "px-4",
      }}
    />
  );
}
