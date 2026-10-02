import {
  AccountBookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  CrownOutlined,
  CompassOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import type { IExpenseStats } from "@/redux/features/expenses/expenses.types";

interface ExpenseStatsHeaderProps {
  stats?: IExpenseStats;
  loading?: boolean;
  activeStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
  onSelectCategory?: (category: string) => void;
}

export function ExpenseStatsHeader({
  stats,
  loading = false,
  activeStatusFilter,
  onSelectStatus,
  onSelectCategory,
}: ExpenseStatsHeaderProps) {
  const totalAmount = stats?.totalAmount ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;
  const totalPaidAmount = stats?.totalPaidAmount ?? 0;
  const paidCount = stats?.paidCount ?? 0;
  const totalUnpaidAmount = stats?.totalUnpaidAmount ?? 0;
  const unpaidCount = stats?.unpaidCount ?? 0;
  const thisMonthPaidAmount = stats?.thisMonthPaidAmount ?? 0;

  const byCat = stats?.byCategory ?? {
    business: 0,
    event: 0,
    program: 0,
    other: 0,
  };

  const totalCatSum =
    byCat.business + byCat.event + byCat.program + byCat.other || 1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 2xl:gap-4">
      {/* 1. TOTAL OPERATIONAL EXPENSES */}
      <GlassCard
        className={`relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all ${
          onSelectStatus ? "cursor-pointer" : ""
        } ${activeStatusFilter === "all" ? "ring-2 ring-slate-400/40" : ""}`}
        onClick={() => onSelectStatus?.("all")}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-slate-700">
              Total Expenses
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-200/50">
              <AccountBookOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-slate-900 tracking-tight">
              {loading ? "…" : formatCurrency(totalAmount)}
            </h2>
            <p className="text-[11px] 2xl:text-xs text-mist-500 mt-0.5 truncate">
              {loading ? "…" : `${totalExpenses} total logged expenses`}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] 2xl:text-[11px] text-gray-500 font-medium">
          <span>All operational vouchers</span>
          <span className="text-slate-700 font-semibold">Active Ledger</span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-slate-500/10 blur-xl" />
      </GlassCard>

      {/* 2. PAID OUTFLOWS (FUND DEDUCTIONS) */}
      <GlassCard
        className={`relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all ${
          onSelectStatus ? "cursor-pointer" : ""
        } ${activeStatusFilter === "paid" ? "ring-2 ring-emerald-500/40" : ""}`}
        onClick={() => onSelectStatus?.("paid")}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-emerald-800">
              Paid Outflows
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50">
              <CheckCircleOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-[#0B3D2E] tracking-tight">
              {loading ? "…" : formatCurrency(totalPaidAmount)}
            </h2>
            <p className="text-[11px] 2xl:text-xs text-mist-500 mt-0.5 truncate">
              {loading ? "…" : `${paidCount} settled fund deductions`}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] 2xl:text-[11px] text-emerald-700 font-medium">
          <span>Deducted from Program Fund</span>
          <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
            Settled
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl" />
      </GlassCard>

      {/* 3. PENDING / UNPAID EXPENSES */}
      <GlassCard
        className={`relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all ${
          onSelectStatus ? "cursor-pointer" : ""
        } ${activeStatusFilter === "unpaid" ? "ring-2 ring-amber-500/40" : ""}`}
        onClick={() => onSelectStatus?.("unpaid")}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Bills
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/50">
              <ClockCircleOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-amber-900 tracking-tight">
              {loading ? "…" : formatCurrency(totalUnpaidAmount)}
            </h2>
            <p className="text-[11px] 2xl:text-xs text-mist-500 mt-0.5 truncate">
              {loading ? "…" : `${unpaidCount} obligations awaiting payment`}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] 2xl:text-[11px] text-amber-700 font-medium">
          <span>Pending payment approval</span>
          <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-md font-bold">
            Unpaid
          </span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-amber-500/10 blur-xl" />
      </GlassCard>

      {/* 4. THIS MONTH'S SPENDING */}
      <GlassCard className="relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-sky-800">
              This Month
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/50">
              <CalendarOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-extrabold text-sky-950 tracking-tight">
              {loading ? "…" : formatCurrency(thisMonthPaidAmount)}
            </h2>
            <p className="text-[11px] 2xl:text-xs text-mist-500 mt-0.5 truncate">
              Month-to-date paid expenditures
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] 2xl:text-[11px] text-sky-700 font-medium">
          <span>Current billing period</span>
          <span className="text-sky-900 font-bold">MTD</span>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-sky-500/10 blur-xl" />
      </GlassCard>

      {/* 5. CATEGORY SPENDING BREAKDOWN */}
      <GlassCard className="relative overflow-hidden p-3.5 2xl:p-4.5 flex flex-col justify-between space-y-3 bg-white/90 shadow-2xs hover:shadow-xs transition-all">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-purple-800">
              Categories
            </span>
            <div className="flex h-8 w-8 2xl:h-9 2xl:w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 ring-1 ring-purple-200/50">
              <ApartmentOutlined className="text-sm 2xl:text-base" />
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
            {/* Multi-colored bar */}
            <div className="h-2 w-full rounded-full bg-gray-100 flex overflow-hidden">
              <div
                style={{ width: `${(byCat.business / totalCatSum) * 100}%` }}
                className="bg-cyan-500 h-full"
                title={`Business: ${formatCurrency(byCat.business)}`}
              />
              <div
                style={{ width: `${(byCat.event / totalCatSum) * 100}%` }}
                className="bg-purple-500 h-full"
                title={`Event: ${formatCurrency(byCat.event)}`}
              />
              <div
                style={{ width: `${(byCat.program / totalCatSum) * 100}%` }}
                className="bg-emerald-500 h-full"
                title={`Program: ${formatCurrency(byCat.program)}`}
              />
              <div
                style={{ width: `${(byCat.other / totalCatSum) * 100}%` }}
                className="bg-slate-400 h-full"
                title={`Other: ${formatCurrency(byCat.other)}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-1 pt-0.5">
              <button
                type="button"
                onClick={() => onSelectCategory?.("business")}
                className="flex items-center justify-between text-[10px] 2xl:text-[11px] text-gray-600 hover:text-cyan-800 transition-colors p-1 rounded-md hover:bg-cyan-50/60 text-left"
              >
                <span className="flex items-center gap-1 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
                  <span>Business</span>
                </span>
                <span className="font-semibold text-gray-900 ml-1">
                  {formatCurrency(byCat.business)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory?.("event")}
                className="flex items-center justify-between text-[10px] 2xl:text-[11px] text-gray-600 hover:text-purple-800 transition-colors p-1 rounded-md hover:bg-purple-50/60 text-left"
              >
                <span className="flex items-center gap-1 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                  <span>Event</span>
                </span>
                <span className="font-semibold text-gray-900 ml-1">
                  {formatCurrency(byCat.event)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory?.("program")}
                className="flex items-center justify-between text-[10px] 2xl:text-[11px] text-gray-600 hover:text-emerald-800 transition-colors p-1 rounded-md hover:bg-emerald-50/60 text-left"
              >
                <span className="flex items-center gap-1 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Program</span>
                </span>
                <span className="font-semibold text-gray-900 ml-1">
                  {formatCurrency(byCat.program)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory?.("other")}
                className="flex items-center justify-between text-[10px] 2xl:text-[11px] text-gray-600 hover:text-slate-800 transition-colors p-1 rounded-md hover:bg-slate-50/60 text-left"
              >
                <span className="flex items-center gap-1 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Other</span>
                </span>
                <span className="font-semibold text-gray-900 ml-1">
                  {formatCurrency(byCat.other)}
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-purple-500/10 blur-xl" />
      </GlassCard>
    </div>
  );
}
