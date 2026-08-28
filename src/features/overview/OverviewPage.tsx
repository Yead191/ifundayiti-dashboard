import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Button, Skeleton } from "antd";
import {
  FileTextOutlined,
  HeartOutlined,
  GiftOutlined,
  WalletOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, cn } from "@/lib/utils";
import { useIFundAyiti } from "@/features/core/IFundAyitiContext";
import {
  STATUS_ORDER,
  statusColorMap,
  statusLabelMap,
} from "@/features/core/statusMaps";
import type { ApplicationStatus } from "@/features/core/types";
import { BarChart } from "./components/charts/BarChart";
import { DonutChart } from "./components/charts/DonutChart";
import {
  useGetDashboardOverviewQuery,
  useGetFundStatsQuery,
  useGetMonthlyApplicationsQuery,
  useGetDonationAmountChartQuery,
  useGetApplicationStatusChartQuery,
} from "@/redux/features/dashboard/dashboardApi";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";

const apiStatusToKey: Record<string, ApplicationStatus> = {
  Winner: "winner",
  Finalist: "finalist",
  Submitted: "submitted",
  Rejected: "rejected",
  Approved: "approved",
  "Under Review": "underReview",
  UnderReview: "underReview",
  Archived: "archived",
};

export default function OverviewPage() {
  const navigate = useNavigate();
  const { periods } = useIFundAyiti();

  const years = [2026, 2025, 2024];
  const [year, setYear] = useState(2026);

  // RTK Queries
  const { data: profile } = useGetProfileQuery();
  const { data: overviewRes, isLoading: isOverviewLoading } =
    useGetDashboardOverviewQuery();
  const { data: fundStatsRes, isLoading: isFundStatsLoading } =
    useGetFundStatsQuery();
  const { data: monthlyAppsRes, isLoading: isMonthlyAppsLoading } =
    useGetMonthlyApplicationsQuery(year);
  const { data: donationChartRes, isLoading: isDonationChartLoading } =
    useGetDonationAmountChartQuery(year);
  const { data: statusChartRes, isLoading: isStatusChartLoading } =
    useGetApplicationStatusChartQuery();

  const openPeriod = periods.find((p) => p.status === "Open");

  // Get current time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Format data values
  const overview = overviewRes?.data;
  const fundStats = fundStatsRes?.data;
  const monthlyApps = monthlyAppsRes?.data ?? [];
  const donationChart = donationChartRes?.data ?? [];
  const statusChart = statusChartRes?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Premium Welcome & Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-navy-700 bg-linear-to-r from-[#0B3D2E]/10 via-[#0B3D2E]/2 to-[#E6D5B8]/20 p-6 md:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0B3D2E]/10 px-3 py-1 text-xs font-semibold text-[#0B3D2E]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
              </span>
              {openPeriod
                ? `Active Cycle: ${openPeriod.title}`
                : "No active application cycle"}
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
              {greeting}, {profile?.data?.name}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-mist-400">
              {openPeriod
                ? `You are running the current micro-grant cycle offering up to ${formatCurrency(openPeriod.maximumGrantAmount)} per application. Vetting, reviews, and donations are updating live.`
                : "The application period is currently closed. You can configure upcoming grant cycles or audit historical applications below."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/periods")}
              className="bg-[#0B3D2E] hover:bg-[#0c4434] border-0! rounded-xl"
            >
              New Cycle
            </Button>
            <Button
              size="large"
              onClick={() => navigate("/applications")}
              className="border-navy-700 hover:border-[#0B3D2E] hover:text-[#0B3D2E] rounded-xl bg-white/80"
            >
              Manage Board
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#E6D5B8]/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-[#0B3D2E]/5 blur-3xl" />
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Applications */}
        <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-6 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              Total Applications
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3D2E]/5 text-[#0B3D2E] transition-colors duration-300 group-hover:bg-[#0B3D2E] group-hover:text-white shadow-xs">
              <FileTextOutlined className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            {isOverviewLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <>
                <h3 className="font-display text-3xl font-bold text-[#0B3D2E]">
                  {overview?.totalApplication ?? 0}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-mist-500">
                  <RiseOutlined className="text-emerald-600 animate-pulse" />
                  <span>Received overall</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: Total Donations */}
        <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-6 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              Total Donations
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white shadow-xs">
              <HeartOutlined className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            {isFundStatsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <>
                <h3 className="font-display text-3xl font-bold text-[#0B3D2E]">
                  {formatCurrency(fundStats?.totalDonations ?? 0)}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-mist-500">
                  <span className="font-medium text-emerald-600">Funded</span>
                  <span>by supporters</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Metric 3: Awarded Grants */}
        <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-6 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              Awarded Grants
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-white shadow-xs">
              <GiftOutlined className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            {isFundStatsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <>
                <h3 className="font-display text-3xl font-bold text-[#0B3D2E]">
                  {formatCurrency(fundStats?.totalGrants ?? 0)}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-mist-500">
                  <span className="font-medium text-amber-600">Disbursed</span>
                  <span>to winner projects</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Metric 4: Program Fund */}
        <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-6 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
              Program Fund
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors duration-300 group-hover:bg-sky-500 group-hover:text-white shadow-xs">
              <WalletOutlined className="text-lg" />
            </div>
          </div>
          <div className="mt-4">
            {isFundStatsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <>
                <h3 className="font-display text-3xl font-bold text-[#0B3D2E]">
                  {formatCurrency(fundStats?.balance ?? 0)}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-mist-500">
                  <span className="font-medium text-sky-600">Available</span>
                  <span>for program support</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Progression Stage */}
      <GlassCard className="relative overflow-hidden border border-navy-700 p-6 shadow-xs bg-white">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-[15px] font-bold text-[#0B3D2E]">
              Application Lifecycle Pipeline
            </h3>
            <p className="text-xs text-mist-500">
              Real-time tracker of applicant stages from initial intake to
              winning announcement.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {isOverviewLoading ? (
            <div className="col-span-full py-4">
              <Skeleton active paragraph={{ rows: 1 }} />
            </div>
          ) : (
            STATUS_ORDER.map((status) => {
              const count = overview
                ? (overview[status as keyof typeof overview] ?? 0)
                : 0;
              const isActive = count > 0;
              return (
                <div
                  key={status}
                  className={cn(
                    "relative rounded-xl border p-4 transition-all duration-200",
                    isActive
                      ? "border-[#0B3D2E]/10 bg-linear-to-b from-white to-[#0B3D2E]/2 shadow-2xs"
                      : "border-slate-100 bg-slate-50/50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full animate-pulse"
                      style={{ background: statusColorMap[status] }}
                    />
                    <span className="text-[11px] font-semibold tracking-wide text-mist-500 uppercase truncate">
                      {statusLabelMap[status]}
                    </span>
                  </div>
                  <div className="mt-2.5 font-display text-2xl font-bold text-[#0B3D2E]">
                    {count}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* Analytics Charts Panel Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center pt-2">
        <div>
          <h3 className="font-display text-lg font-bold text-[#0B3D2E]">
            Financial & Application Audits
          </h3>
          <p className="text-xs text-mist-500">
            Compare monthly intakes and donation allocations across active
            years.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-mist-500">Period:</span>
          <Select
            value={year}
            onChange={setYear}
            options={years.map((y) => ({ label: `${y}`, value: y }))}
            style={{ width: 110 }}
            className="custom-select"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2 border border-navy-700 bg-white p-6 shadow-xs">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h4 className="text-sm font-bold text-[#0B3D2E]">
                Applications Incoming Volume
              </h4>
              <p className="text-xs text-mist-500">
                Monthly submission count tracker.
              </p>
            </div>
            <span className="rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-mist-600 border border-slate-100">
              {year}
            </span>
          </div>
          {isMonthlyAppsLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <BarChart
              data={monthlyApps.map((p) => ({
                label: p.month,
                value: p.count,
              }))}
            />
          )}
        </GlassCard>

        <GlassCard className="border border-navy-700 bg-white p-6 shadow-xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-[#0B3D2E]">
              Status Distributions
            </h4>
            <p className="text-xs text-mist-500">
              Overview of all application portfolios.
            </p>
          </div>
          {isStatusChartLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : statusChart.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Status breakdown will appear as applications arrive."
            />
          ) : (
            <DonutChart
              centerLabel="Applications"
              data={statusChart.map((slice) => {
                const statusKey =
                  apiStatusToKey[slice.status] ||
                  (slice.status.toLowerCase() as ApplicationStatus);
                return {
                  label: slice.status,
                  value: slice.count,
                  color: statusColorMap[statusKey] || "#cbd5e1",
                };
              })}
            />
          )}
        </GlassCard>
      </div>

      {/* Donations Volume Chart */}
      <GlassCard className="border border-navy-700 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#0B3D2E]">
              Donations Inflow Track
            </h4>
            <p className="text-xs text-mist-500">
              Cumulative funding volume from program sponsors.
            </p>
          </div>
          <Button
            type="text"
            size="small"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            onClick={() => navigate("/donations")}
            className="text-xs font-semibold text-[#0B3D2E] hover:bg-[#0B3D2E]/5"
          >
            Audit Donations
          </Button>
        </div>
        {isDonationChartLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <BarChart
            data={donationChart.map((p) => ({
              label: p.month,
              value: p.amount,
            }))}
            valueFormatter={(v) => formatCurrency(v)}
            gradientFrom="#10B981"
            gradientTo="#047857"
          />
        )}
      </GlassCard>
    </div>
  );
}
