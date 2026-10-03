import { useState, useMemo } from "react";
import { DatePicker, Button, Tooltip, Tag } from "antd";
import {
  DollarCircleOutlined,
  AccountBookOutlined,
  WalletOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  HeartOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { useGetTransactionStatsQuery } from "@/redux/features/transactions/transactionsApi";
import type { ITransactionStats } from "@/redux/features/transactions/transactions.types";

const { RangePicker } = DatePicker;

export interface TransactionStatsCardsProps {
  /** Optional pre-fetched stats (if provided, skips internal query) */
  stats?: ITransactionStats;
  loading?: boolean;
  /** Controlled date filters */
  startDate?: string;
  endDate?: string;
  onDateChange?: (dates: { startDate?: string; endDate?: string } | null) => void;
  /** Whether to show the date filter toolbar above cards */
  showDateFilter?: boolean;
  className?: string;
}

export function TransactionStatsCards({
  stats: propsStats,
  loading: propsLoading,
  startDate: controlledStartDate,
  endDate: controlledEndDate,
  onDateChange,
  showDateFilter = true,
  className = "",
}: TransactionStatsCardsProps) {
  // Local date range state when not strictly controlled
  const [internalDates, setInternalDates] = useState<[Dayjs | null, Dayjs | null] | null>(() => {
    if (controlledStartDate && controlledEndDate) {
      return [dayjs(controlledStartDate), dayjs(controlledEndDate)];
    }
    return null;
  });

  const [activePreset, setActivePreset] = useState<"all" | "today" | "thisMonth" | "last30">("all");

  // Determine query date params
  const queryParams = useMemo(() => {
    const start = controlledStartDate || (internalDates?.[0] ? internalDates[0].startOf("day").toISOString() : undefined);
    const end = controlledEndDate || (internalDates?.[1] ? internalDates[1].endOf("day").toISOString() : undefined);
    if (!start && !end) return undefined;
    return {
      startDate: start,
      endDate: end,
    };
  }, [controlledStartDate, controlledEndDate, internalDates]);

  // Query stats from API /transaction/stats if not passed via props
  const {
    data: statsRes,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    refetch,
  } = useGetTransactionStatsQuery(queryParams, {
    skip: !!propsStats,
  });

  const stats = propsStats || statsRes?.data || {
    totalRevenue: 0,
    totalInflow: 0,
    totalOutflow: 0,
    netBalance: 0,
    shopRevenue: 0,
    donationRevenue: 0,
    eventRevenue: 0,
    expenseAmount: 0,
    membershipRevenue: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    creditTransactions: 0,
    debitTransactions: 0,
    todayTransactions: 0,
    thisMonthTransactions: 0,
  };

  const loading = propsLoading ?? (isStatsLoading || isStatsFetching);

  // Quick preset handlers
  const handleApplyPreset = (preset: "all" | "today" | "thisMonth" | "last30") => {
    setActivePreset(preset);
    let newDates: [Dayjs | null, Dayjs | null] | null = null;

    if (preset === "today") {
      newDates = [dayjs().startOf("day"), dayjs().endOf("day")];
    } else if (preset === "thisMonth") {
      newDates = [dayjs().startOf("month"), dayjs().endOf("month")];
    } else if (preset === "last30") {
      newDates = [dayjs().subtract(30, "days").startOf("day"), dayjs().endOf("day")];
    }

    setInternalDates(newDates);
    if (onDateChange) {
      if (!newDates) {
        onDateChange(null);
      } else {
        onDateChange({
          startDate: newDates[0]?.toISOString(),
          endDate: newDates[1]?.toISOString(),
        });
      }
    }
  };

  const handleRangePickerChange = (dates: any) => {
    setInternalDates(dates);
    setActivePreset("all");
    if (onDateChange) {
      if (!dates || !dates[0] || !dates[1]) {
        onDateChange(null);
      } else {
        onDateChange({
          startDate: dates[0].startOf("day").toISOString(),
          endDate: dates[1].endOf("day").toISOString(),
        });
      }
    }
  };

  const handleClearFilter = () => {
    setInternalDates(null);
    setActivePreset("all");
    if (onDateChange) onDateChange(null);
  };

  // Financial values
  const totalInflow = stats.totalInflow ?? stats.totalRevenue ?? 0;
  const totalOutflow = stats.totalOutflow ?? stats.expenseAmount ?? 0;
  const netBalance = stats.netBalance ?? totalInflow - totalOutflow;
  const eventRevenue = stats.eventRevenue ?? 0;
  const shopRevenue = stats.shopRevenue ?? 0;
  const donationRevenue = stats.donationRevenue ?? 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Optional Top Filter Bar for Date-Driven Stats */}
      {showDateFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <FilterOutlined className="text-slate-400" />
              <span>Stats Period:</span>
            </span>

            {/* Quick Preset Buttons */}
            <div className="inline-flex rounded-xl bg-gray-100/90 p-0.5 text-xs font-medium border border-gray-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => handleApplyPreset("all")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activePreset === "all" && !internalDates
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-gray-600 hover:text-slate-900"
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("today")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activePreset === "today"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-gray-600 hover:text-slate-900"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("thisMonth")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activePreset === "thisMonth"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-gray-600 hover:text-slate-900"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("last30")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activePreset === "last30"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-gray-600 hover:text-slate-900"
                }`}
              >
                Last 30 Days
              </button>
            </div>

            {/* Range Picker */}
            <RangePicker
              value={internalDates as any}
              onChange={handleRangePickerChange}
              className="h-8 rounded-xl text-xs max-w-64 border-gray-200"
              placeholder={["Start date", "End date"]}
              allowClear
            />

            {(internalDates || activePreset !== "all") && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClearFilter}
                className="text-xs text-mist-500 hover:text-rose-600"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Activity Status Pills */}
          <div className="flex items-center gap-2 text-xs">
            <Tag bordered={false} className="m-0 bg-emerald-50 text-emerald-800 rounded-md font-semibold text-[11px] py-0.5 px-2">
              <CheckCircleOutlined className="text-emerald-600 mr-1" />
              {stats.successfulTransactions ?? 0} Success
            </Tag>
            {(stats.pendingTransactions ?? 0) > 0 && (
              <Tag bordered={false} className="m-0 bg-amber-50 text-amber-800 rounded-md font-semibold text-[11px] py-0.5 px-2">
                <ClockCircleOutlined className="text-amber-600 mr-1" />
                {stats.pendingTransactions} Pending
              </Tag>
            )}
            {(stats.failedTransactions ?? 0) > 0 && (
              <Tag bordered={false} className="m-0 bg-rose-50 text-rose-800 rounded-md font-semibold text-[11px] py-0.5 px-2">
                <CloseCircleOutlined className="text-rose-600 mr-1" />
                {stats.failedTransactions} Failed
              </Tag>
            )}
            {!propsStats && (
              <Tooltip title="Refresh transaction stats">
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined className={loading ? "animate-spin" : ""} />}
                  onClick={() => refetch()}
                  className="text-gray-400 hover:text-slate-800"
                />
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {/* 6 Top-Tier Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 lg:gap-2.5 2xl:gap-3.5">
        {/* 1. Total Inflow / Gross Revenue */}
        <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-[#0B3D2E] truncate"
              title="Total Gross Revenue / Inflow"
            >
              Total Inflow
            </span>
            <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50 shrink-0">
              <DollarCircleOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-[#0B3D2E] tracking-tight truncate">
              {loading ? "…" : formatCurrency(totalInflow)}
            </h2>
            <p
              className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
              title={`${stats.successfulTransactions} successful payments`}
            >
              {stats.successfulTransactions} successful inflows
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-emerald-500/10 blur-xl" />
        </GlassCard>

        {/* 2. Total Outflow (Expenses Paid) */}
        <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-rose-700 truncate"
              title="Total Outflow / Expenses"
            >
              Total Outflow
            </span>
            <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-200/50 shrink-0">
              <AccountBookOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-rose-700 tracking-tight truncate">
              {loading ? "…" : formatCurrency(totalOutflow)}
            </h2>
            <p
              className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
              title={`${stats.debitTransactions ?? 0} debit transactions`}
            >
              {stats.debitTransactions ?? 0} operational debits
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-rose-500/10 blur-xl" />
        </GlassCard>

        {/* 3. Net Balance */}
        <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-teal-800 truncate"
              title="Net Balance (Inflow - Outflow)"
            >
              Net Balance
            </span>
            <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-200/50 shrink-0">
              <WalletOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>
          <div>
            <h2
              className={`font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold tracking-tight truncate ${
                netBalance < 0 ? "text-rose-600" : "text-teal-950"
              }`}
            >
              {loading ? "…" : formatCurrency(netBalance)}
            </h2>
            <p
              className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
              title={`${stats.totalTransactions} total transactions across all accounts`}
            >
              {stats.totalTransactions} total events
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-teal-500/10 blur-xl" />
        </GlassCard>

        {/* 4. Event Bookings Revenue */}
        <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-sky-700 truncate"
              title="Event & Booking Revenue"
            >
              Event Bookings
            </span>
            <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/50 shrink-0">
              <CalendarOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-sky-900 tracking-tight truncate">
              {loading ? "…" : formatCurrency(eventRevenue)}
            </h2>
            <p
              className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
              title="Direct event tickets and registrations"
            >
              Ticket sales & bookings
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-sky-500/10 blur-xl" />
        </GlassCard>

        {/* 5. Shop / Store Revenue */}
        <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-indigo-700 truncate"
              title="Shop / Store Revenue"
            >
              Shop / Store
            </span>
            <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50 shrink-0">
              <ShoppingOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-indigo-950 tracking-tight truncate">
              {loading ? "…" : formatCurrency(shopRevenue)}
            </h2>
            <p
              className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
              title="Direct merchandise & store sales"
            >
              Merchandise & store
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-indigo-500/10 blur-xl" />
        </GlassCard>

        {/* 6. Donations Revenue */}
        <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-amber-700 truncate"
              title="Donations & Philanthropic Contributions"
            >
              Donations
            </span>
            <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/50 shrink-0">
              <HeartOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>
          <div>
            <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-amber-700 tracking-tight truncate">
              {loading ? "…" : formatCurrency(donationRevenue)}
            </h2>
            <p
              className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
              title="Direct donor contributions"
            >
              Philanthropic gifts
            </p>
          </div>
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-amber-500/10 blur-xl" />
        </GlassCard>
      </div>
    </div>
  );
}

export default TransactionStatsCards;
