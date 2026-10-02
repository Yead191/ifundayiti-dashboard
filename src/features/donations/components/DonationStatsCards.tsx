import {
  WalletOutlined,
  HeartOutlined,
  ShopOutlined,
  AccountBookOutlined,
  GiftOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import type { IFundStats } from "@/redux/features/donations/donations.types";

interface DonationStatsCardsProps {
  stats?: IFundStats;
  loading?: boolean;
}

export function DonationStatsCards({
  stats,
  loading = false,
}: DonationStatsCardsProps) {
  const totalBalance = stats?.totalBalance ?? stats?.balance ?? 0;
  const totalDonations = stats?.totalDonations ?? 0;
  const donationCount = stats?.donationCount ?? 0;
  const totalFundRaised = stats?.totalFundRaised ?? 0;
  const fundRaisedCount = stats?.fundRaisedCount ?? 0;
  const totalPaidExpenses = stats?.totalPaidExpenses ?? 0;
  const paidExpenseCount = stats?.paidExpenseCount ?? 0;
  const totalGrants = stats?.totalGrants ?? 0;
  const grantCount = stats?.grantCount ?? 0;
  const totalCount = stats?.totalCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 lg:gap-2.5 2xl:gap-3.5">
      {/* 1. Net Available Fund Balance */}
      <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-mist-500 truncate"
            title="Net Available Fund"
          >
            Net Available Fund
          </span>
          <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50 shrink-0">
            <WalletOutlined className="text-sm 2xl:text-base" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-[#0B3D2E] tracking-tight">
            {loading ? "…" : formatCurrency(totalBalance)}
          </h2>
          <p
            className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
            title="Inflows minus grants and expenses disbursed"
          >
            Net liquidity after outflows
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-emerald-500/10 blur-xl" />
      </GlassCard>

      {/* 2. Total Donations Received */}
      <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-sky-700 truncate"
            title="Donations Received"
          >
            Donations Received
          </span>
          <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/50 shrink-0">
            <HeartOutlined className="text-sm 2xl:text-base" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-sky-900 tracking-tight">
            {loading ? "…" : formatCurrency(totalDonations)}
          </h2>
          <p
            className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
            title={`${donationCount} philanthropic contributions`}
          >
            {donationCount} philanthropic gifts
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-sky-500/10 blur-xl" />
      </GlassCard>

      {/* 3. Total Funds Raised (Store & Offline) */}
      <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-purple-700 truncate"
            title="Funds Raised (Store)"
          >
            Funds Raised
          </span>
          <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-purple-50 text-purple-700 ring-1 ring-purple-200/50 shrink-0">
            <ShopOutlined className="text-sm 2xl:text-base" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-purple-900 tracking-tight">
            {loading ? "…" : formatCurrency(totalFundRaised)}
          </h2>
          <p
            className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
            title={`${fundRaisedCount} store orders & offline sales`}
          >
            {fundRaisedCount} orders & offline sales
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-purple-500/10 blur-xl" />
      </GlassCard>

      {/* 4. Total Paid Expenses (Operational Expenses) */}
      <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-rose-700 truncate"
            title="Expenses Paid"
          >
            Expenses Paid
          </span>
          <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-200/50 shrink-0">
            <AccountBookOutlined className="text-sm 2xl:text-base" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-rose-900 tracking-tight">
            {loading ? "…" : formatCurrency(totalPaidExpenses)}
          </h2>
          <p
            className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
            title={`${paidExpenseCount} operational expenses paid`}
          >
            {paidExpenseCount} paid expenses
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-rose-500/10 blur-xl" />
      </GlassCard>

      {/* 5. Total Grants Disbursed */}
      <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-amber-700 truncate"
            title="Grants Disbursed"
          >
            Grants Disbursed
          </span>
          <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/50 shrink-0">
            <GiftOutlined className="text-sm 2xl:text-base" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-amber-700 tracking-tight">
            {loading ? "…" : formatCurrency(totalGrants)}
          </h2>
          <p
            className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
            title={`${grantCount} grants awarded to local projects`}
          >
            {grantCount} grants awarded
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-amber-500/10 blur-xl" />
      </GlassCard>

      {/* 6. Total Records / Volume */}
      <GlassCard className="p-3 lg:p-2.5 xl:p-3 2xl:p-4.5 flex flex-col justify-between space-y-2 lg:space-y-1.5 2xl:space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] lg:text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-indigo-700 truncate"
            title="Total Records"
          >
            Total Records
          </span>
          <div className="flex lg:hidden 2xl:flex h-8 w-8 2xl:h-9.5 2xl:w-9.5 items-center justify-center rounded-xl 2xl:rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50 shrink-0">
            <SwapOutlined className="text-sm 2xl:text-base" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-base lg:text-sm xl:text-base 2xl:text-xl font-extrabold text-indigo-950 tracking-tight">
            {loading ? "…" : `${totalCount} records`}
          </h2>
          <p
            className="text-[11px] lg:text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate"
            title="Combined donations, sales, expenses & grants"
          >
            Combined fund activities
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-indigo-500/10 blur-xl" />
      </GlassCard>
    </div>
  );
}

export default DonationStatsCards;
