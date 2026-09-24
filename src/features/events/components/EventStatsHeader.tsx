import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  FireOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import type { EventStatsOverview } from "@/redux/features/events/events.types";

interface EventStatsHeaderProps {
  stats?: EventStatsOverview;
  loading?: boolean;
  upcomingCount?: number;
}

export function EventStatsHeader({ stats, loading, upcomingCount = 0 }: EventStatsHeaderProps) {
  const totalEvents = stats?.totalEvents ?? 0;
  const totalBookings = stats?.totalBookings ?? 0;
  const paidBookings = stats?.paidBookings ?? 0;
  const freeBookings = stats?.freeBookings ?? 0;

  const totalReservedSeats =
    stats?.totalReservedSeats ??
    stats?.totalTicketsReserved ??
    (stats?.paidReservedSeats ?? 0) + (stats?.freeReservedSeats ?? 0);
  const paidReservedSeats = stats?.paidReservedSeats ?? 0;
  const freeReservedSeats = stats?.freeReservedSeats ?? 0;

  const totalRevenue = stats?.totalRevenue ?? stats?.totalEstimatedRevenue ?? 0;
  const upcomingGatherings = stats?.upcomingEvents ?? upcomingCount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 2xl:gap-4">
      {/* Total Events */}
      <GlassCard className="p-3.5 2xl:p-5 flex flex-col justify-between space-y-2 2xl:space-y-3 relative overflow-hidden border-0 bg-white/90 hover:bg-white transition-all shadow-xs hover:shadow-sm">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-[#0B3D2E] truncate">
            Total Events
          </span>
          <div className="flex h-8 w-8 2xl:h-10 2xl:w-10 shrink-0 items-center justify-center rounded-xl 2xl:rounded-2xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50">
            <CalendarOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-3xl font-extrabold text-[#0B3D2E] leading-tight">
            {loading ? "…" : totalEvents}
          </h2>
          <p className="text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate">
            {stats?.publishedEvents !== undefined
              ? `${stats.publishedEvents} published • ${stats.draftEvents ?? 0} draft`
              : "All gatherings in system"}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-emerald-500/10 blur-xl" />
      </GlassCard>

      {/* Total Bookings */}
      <GlassCard className="p-3.5 2xl:p-5 flex flex-col justify-between space-y-2 2xl:space-y-3 relative overflow-hidden border-0 bg-white/90 hover:bg-white transition-all shadow-xs hover:shadow-sm">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-indigo-700 truncate">
            Total Bookings
          </span>
          <div className="flex h-8 w-8 2xl:h-10 2xl:w-10 shrink-0 items-center justify-center rounded-xl 2xl:rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50">
            <AuditOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-3xl font-extrabold text-indigo-950 leading-tight">
            {loading ? "…" : totalBookings.toLocaleString()}
          </h2>
          <p className="text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 flex items-center gap-1 2xl:gap-1.5 flex-wrap">
            <span className="font-semibold text-indigo-900">{paidBookings} paid</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-emerald-800">{freeBookings} free</span>
            <span className="text-gray-400 hidden xl:inline">bookings</span>
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-indigo-500/10 blur-xl" />
      </GlassCard>

      {/* Reserved Seats */}
      <GlassCard className="p-3.5 2xl:p-5 flex flex-col justify-between space-y-2 2xl:space-y-3 relative overflow-hidden border-0 bg-white/90 hover:bg-white transition-all shadow-xs hover:shadow-sm">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-sky-700 truncate">
            Reserved Seats
          </span>
          <div className="flex h-8 w-8 2xl:h-10 2xl:w-10 shrink-0 items-center justify-center rounded-xl 2xl:rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-200/50">
            <TeamOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-3xl font-extrabold text-sky-950 leading-tight">
            {loading ? "…" : totalReservedSeats.toLocaleString()}
          </h2>
          <p className="text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 flex items-center gap-1 2xl:gap-1.5 flex-wrap">
            <span className="font-semibold text-sky-900">{paidReservedSeats} paid</span>
            <span className="text-gray-300">•</span>
            <span className="font-semibold text-emerald-800">{freeReservedSeats} free</span>
            <span className="text-gray-400 hidden xl:inline">seats</span>
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-sky-500/10 blur-xl" />
      </GlassCard>

      {/* Estimated Event Revenue */}
      <GlassCard className="p-3.5 2xl:p-5 flex flex-col justify-between space-y-2 2xl:space-y-3 relative overflow-hidden border-0 bg-white/90 hover:bg-white transition-all shadow-xs hover:shadow-sm">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-amber-800 truncate">
            Event Revenue
          </span>
          <div className="flex h-8 w-8 2xl:h-10 2xl:w-10 shrink-0 items-center justify-center rounded-xl 2xl:rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-300/50">
            <DollarCircleOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-3xl font-extrabold text-amber-950 leading-tight truncate">
            {loading ? "…" : formatCurrency(totalRevenue)}
          </h2>
          <p className="text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate">
            {paidBookings > 0
              ? `From ${paidBookings} paid bookings`
              : "Paid ticket reservations"}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-amber-500/10 blur-xl" />
      </GlassCard>

      {/* Upcoming Gatherings */}
      <GlassCard className="p-3.5 2xl:p-5 flex flex-col justify-between space-y-2 2xl:space-y-3 relative overflow-hidden border-0 bg-white/90 hover:bg-white transition-all shadow-xs hover:shadow-sm">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-teal-800 truncate">
            Upcoming
          </span>
          <div className="flex h-8 w-8 2xl:h-10 2xl:w-10 shrink-0 items-center justify-center rounded-xl 2xl:rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-200/50">
            <FireOutlined className="text-sm 2xl:text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl lg:text-lg xl:text-xl 2xl:text-3xl font-extrabold text-teal-950 leading-tight">
            {loading ? "…" : upcomingGatherings}
          </h2>
          <p className="text-[10px] 2xl:text-xs text-mist-500 mt-0.5 2xl:mt-1 truncate">
            {stats?.pastEvents !== undefined
              ? `${stats.pastEvents} past gatherings`
              : "Actively open"}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 2xl:h-24 2xl:w-24 rounded-full bg-teal-500/10 blur-xl" />
      </GlassCard>
    </div>
  );
}
