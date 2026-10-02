import { Skeleton } from "antd";
import {
  FileTextOutlined,
  HeartOutlined,
  ShopOutlined,
  GiftOutlined,
  WalletOutlined,
  RiseOutlined,
  AccountBookOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "@/lib/utils";
import type {
  DashboardOverview,
  FundStats,
} from "@/redux/features/dashboard/dashboard.types";

interface OverviewMetricsProps {
  overview?: DashboardOverview;
  fundStats?: FundStats;
  isOverviewLoading?: boolean;
  isFundStatsLoading?: boolean;
}

export function OverviewMetrics({
  overview,
  fundStats,
  isOverviewLoading,
  isFundStatsLoading,
}: OverviewMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* 1. Applications */}
      <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-3.5 lg:p-3 xl:p-3 2xl:p-5.5 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-semibold uppercase tracking-wider text-mist-500 truncate"
            title="Applications"
          >
            Applications
          </span>
          <div className="flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 shrink-0 items-center justify-center rounded-xl bg-[#0B3D2E]/5 text-[#0B3D2E] transition-colors duration-300 group-hover:bg-[#0B3D2E] group-hover:text-white shadow-xs">
            <FileTextOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div className="mt-2.5 xl:mt-3 2xl:mt-4">
          {isOverviewLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          ) : (
            <>
              <h3 className="font-display text-lg lg:text-base xl:text-lg 2xl:text-2xl font-bold text-[#0B3D2E] tracking-tight truncate">
                {overview?.totalApplication ?? 0}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 truncate">
                <RiseOutlined className="text-emerald-600 animate-pulse shrink-0" />
                <span className="truncate">Received overall</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* 2. Awarded Grants */}
      <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-3.5 lg:p-3 xl:p-3 2xl:p-5.5 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-semibold uppercase tracking-wider text-mist-500 truncate"
            title="Awarded Grants"
          >
            Awarded Grants
          </span>
          <div className="flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-white shadow-xs">
            <GiftOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div className="mt-2.5 xl:mt-3 2xl:mt-4">
          {isFundStatsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          ) : (
            <>
              <h3
                className="font-display text-lg lg:text-base xl:text-lg 2xl:text-2xl font-bold text-[#0B3D2E] tracking-tight truncate"
                title={formatCurrency(fundStats?.totalGrants ?? 0)}
              >
                {formatCurrency(fundStats?.totalGrants ?? 0)}
              </h3>
              <p
                className="mt-1 flex items-center gap-1 text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 truncate"
                title={`${fundStats?.grantCount ?? 0} grants disbursed`}
              >
                <span className="font-semibold text-amber-600 shrink-0">
                  {fundStats?.grantCount ?? 0}{" "}
                  {fundStats?.grantCount === 1 ? "grant" : "grants"}
                </span>
                <span className="truncate">disbursed</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* 3. Fundraised */}
      <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-3.5 lg:p-3 xl:p-3 2xl:p-5.5 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-semibold uppercase tracking-wider text-mist-500 truncate"
            title="Fundraised"
          >
            Fundraised
          </span>
          <div className="flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 transition-colors duration-300 group-hover:bg-purple-600 group-hover:text-white shadow-xs">
            <ShopOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div className="mt-2.5 xl:mt-3 2xl:mt-4">
          {isFundStatsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          ) : (
            <>
              <h3
                className="font-display text-lg lg:text-base xl:text-lg 2xl:text-2xl font-bold text-[#0B3D2E] tracking-tight truncate"
                title={formatCurrency(fundStats?.totalFundRaised ?? 0)}
              >
                {formatCurrency(fundStats?.totalFundRaised ?? 0)}
              </h3>
              <p
                className="mt-1 flex items-center gap-1 text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 truncate"
                title={`${fundStats?.fundRaisedCount ?? 0} orders & sales raised`}
              >
                <span className="font-semibold text-purple-600 shrink-0">
                  {fundStats?.fundRaisedCount ?? 0}{" "}
                  {fundStats?.fundRaisedCount === 1
                    ? "order/sale"
                    : "orders & sales"}
                </span>
                <span className="truncate">raised</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* 4. Donations */}
      <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-3.5 lg:p-3 xl:p-3 2xl:p-5.5 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-semibold uppercase tracking-wider text-mist-500 truncate"
            title="Donations"
          >
            Donations
          </span>
          <div className="flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white shadow-xs">
            <HeartOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div className="mt-2.5 xl:mt-3 2xl:mt-4">
          {isFundStatsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          ) : (
            <>
              <h3
                className="font-display text-lg lg:text-base xl:text-lg 2xl:text-2xl font-bold text-[#0B3D2E] tracking-tight truncate"
                title={formatCurrency(fundStats?.totalDonations ?? 0)}
              >
                {formatCurrency(fundStats?.totalDonations ?? 0)}
              </h3>
              <p
                className="mt-1 flex items-center gap-1 text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 truncate"
                title={`${fundStats?.donationCount ?? 0} donations funded`}
              >
                <span className="font-semibold text-emerald-600 shrink-0">
                  {fundStats?.donationCount ?? 0}{" "}
                  {fundStats?.donationCount === 1 ? "donation" : "donations"}
                </span>
                <span className="truncate">funded</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* 5. Expenses */}
      <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-3.5 lg:p-3 xl:p-3 2xl:p-5.5 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-semibold uppercase tracking-wider text-mist-500 truncate"
            title="Expenses"
          >
            Expenses
          </span>
          <div className="flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 transition-colors duration-300 group-hover:bg-rose-600 group-hover:text-white shadow-xs">
            <AccountBookOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div className="mt-2.5 xl:mt-3 2xl:mt-4">
          {isFundStatsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          ) : (
            <>
              <h3
                className="font-display text-lg lg:text-base xl:text-lg 2xl:text-2xl font-bold text-[#0B3D2E] tracking-tight truncate"
                title={formatCurrency(fundStats?.totalPaidExpenses ?? 0)}
              >
                {formatCurrency(fundStats?.totalPaidExpenses ?? 0)}
              </h3>
              <p
                className="mt-1 flex items-center gap-1 text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 truncate"
                title={`${fundStats?.paidExpenseCount ?? 0} expenses paid`}
              >
                <span className="font-semibold text-rose-600 shrink-0">
                  {fundStats?.paidExpenseCount ?? 0}{" "}
                  {fundStats?.paidExpenseCount === 1 ? "expense" : "expenses"}
                </span>
                <span className="truncate">paid</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* 6. Total Program Funds */}
      <div className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-white p-3.5 lg:p-3 xl:p-3 2xl:p-5.5 shadow-xs transition-all duration-350 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-950/2">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-semibold uppercase tracking-wider text-mist-500 truncate"
            title="Total Program Funds"
          >
            Program Funds
          </span>
          <div className="flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors duration-300 group-hover:bg-sky-500 group-hover:text-white shadow-xs">
            <WalletOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div className="mt-2.5 xl:mt-3 2xl:mt-4">
          {isFundStatsLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          ) : (
            <>
              <h3
                className="font-display text-lg lg:text-base xl:text-lg 2xl:text-2xl font-bold text-[#0B3D2E] tracking-tight truncate"
                title={formatCurrency(
                  fundStats?.totalBalance ?? fundStats?.balance ?? 0,
                )}
              >
                {formatCurrency(
                  fundStats?.totalBalance ?? fundStats?.balance ?? 0,
                )}
              </h3>
              <p
                className="mt-1 flex items-center gap-1 text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 truncate"
                title="Total balance available"
              >
                <span className="font-semibold text-sky-600 shrink-0">
                  Total balance
                </span>
                <span className="truncate">available</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OverviewMetrics;
