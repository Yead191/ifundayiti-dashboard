import { useState } from "react";
import { Tabs, Badge, Input, Select, Button, Space } from "antd";
import {
  InboxOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetApplicationsQuery } from "@/redux/features/applications/applicationsApi";
import { useGetPeriodsQuery } from "@/redux/features/periods/periodsApi";
import { useApplicationWorkflow } from "./useApplicationWorkflow";
import { useGetDashboardOverviewQuery } from "@/redux/features/dashboard/dashboardApi";
import { STATUS_ORDER, statusLabelMap } from "@/features/core/statusMaps";
import { ApplicationsTable } from "./components/ApplicationsTable";
import { ApplicationWorkflowModals } from "./components/ApplicationWorkflowModals";

type TabKey = string;

export default function ApplicationsPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodId, setPeriodId] = useState("all");

  // Fetch applications from the backend
  const {
    data: applicationsData,
    isLoading: isLoadingApplications,
    isFetching: isFetchingApplications,
    refetch,
  } = useGetApplicationsQuery({
    page,
    limit,
    searchTerm,
    status: tab,
    applicationPeriod: periodId,
  });

  // Fetch periods for the filter select dropdown
  const { data: periodsData, isLoading: isLoadingPeriods } = useGetPeriodsQuery(
    {
      limit: 100,
    },
  );

  // Fetch dashboard overview counts for tab badges
  const { data: overviewRes } = useGetDashboardOverviewQuery();
  const overview = overviewRes?.data;

  const workflow = useApplicationWorkflow(() => {
    refetch();
  });

  const periods = periodsData?.data || [];
  const applications = applicationsData?.data || [];
  const total = applicationsData?.pagination?.total || 0;

  const tabItems = [
    {
      key: "all",
      label: (
        <TabLabel
          label="All"
          active={tab === "all"}
          count={overview?.totalApplication}
        />
      ),
    },
    ...STATUS_ORDER.map((status) => ({
      key: status,
      label: (
        <TabLabel
          label={statusLabelMap[status]}
          active={tab === status}
          count={
            overview?.[status as keyof typeof overview] as number | undefined
          }
        />
      ),
    })),
  ];

  const handleTabChange = (key: TabKey) => {
    setTab(key);
    setPage(1); // Reset page on tab switch
  };

  const handlePageChange = (p: number, l: number) => {
    setPage(p);
    setLimit(l);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Applications
          </h1>
          <p className="text-sm text-mist-600 mt-1">
            Review submissions, evaluate projects, and manage the full
            micro-grant lifecycle.
          </p>
        </div>
        <Button
          icon={<ReloadOutlined spin={isFetchingApplications} />}
          onClick={refetch}
          className="self-start md:self-auto border-navy-700/60 hover:text-violet-600 hover:border-violet-600 rounded-xl"
        >
          Refresh Board
        </Button>
      </div>

      {/* Tabs and Filters */}
      <GlassCard flat className="mb-4 overflow-hidden" padded={false}>
        <div className="px-4 pt-2 md:px-5 border-b border-navy-700/40 bg-linear-to-b from-navy-800/10 to-transparent">
          <Tabs
            activeKey={tab}
            onChange={handleTabChange}
            items={tabItems}
            className="applications-tabs"
          />
        </div>
        <div className="p-4 md:p-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500 mb-1.5">
              Search Applicants
            </div>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-mist-500" />}
              placeholder="Search name, project title, etc."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border-navy-700/60 hover:border-violet-600 focus:border-violet-600"
            />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-mist-500 mb-1.5">
              Grant Cycle / Period
            </div>
            <Select
              className="w-full rounded-xl"
              value={periodId}
              onChange={(val) => {
                setPeriodId(val);
                setPage(1);
              }}
              loading={isLoadingPeriods}
              options={[
                { label: "All Grant Cycles", value: "all" },
                ...periods.map((p) => ({ label: p.title, value: p._id })),
              ]}
            />
          </div>
        </div>
      </GlassCard>

      {/* Table Data */}
      <GlassCard
        flat
        padded={false}
        className="overflow-hidden border border-navy-700/60 shadow-md"
      >
        {applications.length === 0 && !isLoadingApplications ? (
          <EmptyState
            icon={<InboxOutlined className="text-mist-500 text-5xl" />}
            title="No applications found"
            description="There are no applications matching your current filter criteria."
          />
        ) : (
          <ApplicationsTable
            data={applications}
            loading={isLoadingApplications}
            page={page}
            pageSize={limit}
            total={total}
            onPageChange={handlePageChange}
            onAction={workflow.onAction}
          />
        )}
      </GlassCard>

      {/* Action Modals */}
      <ApplicationWorkflowModals wf={workflow} />
    </div>
  );
}

function TabLabel({
  label,
  active,
  count,
}: {
  label: string;
  active: boolean;
  count?: number;
}) {
  return (
    <span className="flex items-center gap-2.5 py-1 px-1 font-semibold transition-colors duration-200">
      <span>{label}</span>
      {count !== undefined && (
        <Badge
          count={count}
          showZero
          style={{
            backgroundColor: active ? "#0b3d2e" : "rgba(11, 61, 46, 0.08)",
            color: active ? "#fff" : "#0b3d2e",
            boxShadow: "none",
            fontSize: "10px",
            height: "18px",
            lineHeight: "18px",
            minWidth: "18px",
            padding: "0 5px",
          }}
        />
      )}
    </span>
  );
}
