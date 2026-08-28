import { useMemo, useState } from "react";
import { Tabs, Badge } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useIFundAyiti } from "./IFundAyitiContext";
import { useApplicationWorkflow } from "./useApplicationWorkflow";
import { STATUS_ORDER, statusLabelMap } from "./statusMaps";
import { ApplicationsTable } from "./components/ApplicationsTable";
import {
  ApplicationFilters,
  AMOUNT_RANGES,
  DEFAULT_FILTERS,
  type ApplicationFilterValues,
} from "./components/ApplicationFilters";
import { ApplicationWorkflowModals } from "./components/ApplicationWorkflowModals";
import type { ApplicationStatus } from "./types";

type TabKey = ApplicationStatus | "all";

export default function ApplicationsPage() {
  const { applications, periods } = useIFundAyiti();
  const workflow = useApplicationWorkflow();
  const [tab, setTab] = useState<TabKey>("all");
  const [filters, setFilters] = useState<ApplicationFilterValues>(DEFAULT_FILTERS);

  const counts = useMemo(() => {
    const map = { all: applications.length } as Record<TabKey, number>;
    for (const status of STATUS_ORDER) map[status] = 0;
    for (const app of applications) map[app.status] += 1;
    return map;
  }, [applications]);

  const filtered = useMemo(() => {
    const amountRange = AMOUNT_RANGES.find((r) => r.key === filters.amountKey)?.range ?? null;
    const search = filters.search.trim().toLowerCase();

    return applications
      .filter((app) => (tab === "all" ? true : app.status === tab))
      .filter((app) => (filters.periodId === "all" ? true : app.periodId === filters.periodId))
      .filter((app) => {
        if (!amountRange) return true;
        return app.grant.requestedAmount >= amountRange.min && app.grant.requestedAmount <= amountRange.max;
      })
      .filter((app) => {
        if (!filters.dateRange) return true;
        const [from, to] = filters.dateRange;
        const created = new Date(app.createdAt).getTime();
        return created >= from.startOf("day").valueOf() && created <= to.endOf("day").valueOf();
      })
      .filter((app) => {
        if (!search) return true;
        return (
          app.personal.name.toLowerCase().includes(search) ||
          app.grant.projectName.toLowerCase().includes(search) ||
          app.trackingId.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [applications, tab, filters]);

  const tabItems = [
    { key: "all", label: <TabLabel label="All" count={counts.all} active={tab === "all"} /> },
    ...STATUS_ORDER.map((status) => ({
      key: status,
      label: <TabLabel label={statusLabelMap[status]} count={counts[status]} active={tab === status} />,
    })),
  ];

  return (
    <div>
      <GlassCard flat className="mb-4" padded={false}>
        <div className="px-4 pt-2 md:px-5">
          <Tabs activeKey={tab} onChange={(k) => setTab(k as TabKey)} items={tabItems} />
        </div>
        <div className="border-t border-navy-700/60 p-4 md:p-5">
          <ApplicationFilters value={filters} periods={periods} onChange={setFilters} />
        </div>
      </GlassCard>

      <GlassCard flat padded={false}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<InboxOutlined />}
            title="No applications found"
            description="Try adjusting the status tab or filters to see more applications."
          />
        ) : (
          <ApplicationsTable data={filtered} periods={periods} onAction={workflow.onAction} />
        )}
      </GlassCard>

      <ApplicationWorkflowModals wf={workflow} />
    </div>
  );
}

function TabLabel({ label, count, active }: { label: string; count: number; active: boolean }) {
  return (
    <span className="flex items-center gap-2">
      {label}
      <Badge
        count={count}
        showZero
        overflowCount={999}
        style={{
          backgroundColor: active ? "#8131F0" : "#23274f",
          color: active ? "#fff" : "#9ca3c9",
          boxShadow: "none",
        }}
      />
    </span>
  );
}
