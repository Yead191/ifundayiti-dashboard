import { Avatar, Table, type TableProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { statusToneMap, statusLabelMap } from "../statusMaps";
import type { Application, ApplicationPeriod, ApplicationStatus } from "../types";
import { ApplicationActionsCell } from "./ApplicationActions";
import type { AppActionKey } from "../applicationActions";

export function ApplicationsTable({
  data,
  periods,
  onAction,
}: {
  data: Application[];
  periods: ApplicationPeriod[];
  onAction: (key: AppActionKey, application: Application) => void;
}) {
  const periodTitle = (id: string) => periods.find((p) => p.id === id)?.title ?? "—";

  const columns: TableProps<Application>["columns"] = [
    {
      title: "Applicant",
      key: "applicant",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.personal.image} icon={<UserOutlined />} size={38} />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{record.personal.name}</div>
            <div className="font-mono text-[11px] text-mist-600">{record.trackingId}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Project",
      key: "project",
      responsive: ["md"],
      render: (_, record) => (
        <div className="max-w-[220px] truncate text-mist-300">{record.grant.projectName}</div>
      ),
    },
    {
      title: "Requested",
      key: "requestedAmount",
      sorter: (a, b) => a.grant.requestedAmount - b.grant.requestedAmount,
      render: (_, record) => (
        <span className="font-medium text-cloud-100">{formatCurrency(record.grant.requestedAmount)}</span>
      ),
    },
    {
      title: "Period",
      key: "period",
      responsive: ["lg"],
      render: (_, record) => <span className="text-mist-400">{periodTitle(record.periodId)}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <StatusTag tone={statusToneMap[record.status as ApplicationStatus]}>
          {statusLabelMap[record.status]}
        </StatusTag>
      ),
    },
    {
      title: "Submitted",
      key: "createdAt",
      responsive: ["md"],
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (_, record) => <span className="text-mist-400">{formatDate(record.createdAt)}</span>,
    },
    {
      title: "",
      key: "actions",
      width: 130,
      render: (_, record) => <ApplicationActionsCell application={record} onAction={onAction} />,
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 8, hideOnSinglePage: true, showSizeChanger: false }}
    />
  );
}
