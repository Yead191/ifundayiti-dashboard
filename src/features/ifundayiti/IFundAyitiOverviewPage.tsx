import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Button } from "antd";
import {
  FileTextOutlined,
  HeartOutlined,
  GiftOutlined,
  WalletOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { useIFundAyiti } from "./IFundAyitiContext";
import {
  computeStats,
  monthlyApplications,
  monthlyDonations,
  statusDistribution,
  availableYears,
} from "./selectors";
import { STATUS_ORDER, statusColorMap, statusLabelMap } from "./statusMaps";
import { BarChart } from "./components/charts/BarChart";
import { DonutChart } from "./components/charts/DonutChart";

export default function IFundAyitiOverviewPage() {
  const navigate = useNavigate();
  const { applications, donations, periods } = useIFundAyiti();

  const years = useMemo(() => availableYears(applications, donations), [applications, donations]);
  const [year, setYear] = useState(years[0]);

  const stats = useMemo(() => computeStats(applications, donations), [applications, donations]);
  const appsByMonth = useMemo(() => monthlyApplications(applications, year), [applications, year]);
  const donationsByMonth = useMemo(() => monthlyDonations(donations, year), [donations, year]);
  const distribution = useMemo(() => statusDistribution(applications), [applications]);

  const openPeriod = periods.find((p) => p.status === "Open");

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-cloud-100">IFundAyiti grant program</h2>
          <p className="mt-1 text-sm text-mist-400">
            {openPeriod
              ? `Current cycle: ${openPeriod.title} · up to ${formatCurrency(openPeriod.maximumGrantAmount)} per grant`
              : "No application period is currently open."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="btn-gradient !border-0" onClick={() => navigate("/ifundayiti/applications")}>
            Manage applications
          </Button>
          <Button onClick={() => navigate("/ifundayiti/periods")}>Application periods</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total applications" value={stats.totalApplications} icon={<FileTextOutlined />} tone="violet" />
        <StatCard label="Total donations" value={formatCurrency(stats.totalDonations)} icon={<HeartOutlined />} tone="success" />
        <StatCard label="Awarded grants" value={formatCurrency(stats.awardedGrants)} icon={<GiftOutlined />} tone="gold" />
        <StatCard
          label="Current program fund"
          value={formatCurrency(stats.currentProgramFund)}
          icon={<WalletOutlined />}
          tone="info"
        />
      </div>

      <GlassCard flat className="mt-6">
        <h3 className="mb-4 font-display text-[15px] font-semibold text-cloud-100">Application pipeline</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5 transition hover:border-violet-600/30"
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColorMap[status] }} />
                <span className="text-xs text-mist-400">{statusLabelMap[status]}</span>
              </div>
              <div className="mt-2 font-display text-xl font-semibold text-cloud-100">{stats.byStatus[status]}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-semibold text-cloud-100">Analytics</h3>
        <Select
          value={year}
          onChange={setYear}
          options={years.map((y) => ({ label: `${y}`, value: y }))}
          style={{ width: 120 }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassCard flat className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-cloud-100">Applications by month</h4>
            <span className="text-xs text-mist-600">{year}</span>
          </div>
          <BarChart data={appsByMonth.map((p) => ({ label: p.month, value: p.value }))} />
        </GlassCard>

        <GlassCard flat>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-cloud-100">Status distribution</h4>
          </div>
          {distribution.length === 0 ? (
            <EmptyState title="No applications yet" description="Status breakdown will appear as applications arrive." />
          ) : (
            <DonutChart
              centerLabel="Applications"
              data={distribution.map((slice) => ({
                label: slice.label,
                value: slice.count,
                color: statusColorMap[slice.status],
              }))}
            />
          )}
        </GlassCard>
      </div>

      <GlassCard flat className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-cloud-100">Donations by month</h4>
          <Button
            type="text"
            size="small"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            onClick={() => navigate("/ifundayiti/donations")}
          >
            View donations
          </Button>
        </div>
        <BarChart
          data={donationsByMonth.map((p) => ({ label: p.month, value: p.value }))}
          valueFormatter={(v) => formatCurrency(v)}
          gradientFrom="#34d399"
          gradientTo="#0f9b6e"
        />
      </GlassCard>
    </div>
  );
}
