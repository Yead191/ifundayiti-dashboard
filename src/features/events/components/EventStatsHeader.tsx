import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  FireOutlined,
} from "@ant-design/icons";
import type { EventStatsOverview } from "@/redux/features/events/events.types";

interface EventStatsHeaderProps {
  stats?: EventStatsOverview;
  loading?: boolean;
  upcomingCount?: number;
}

export function EventStatsHeader({ stats, loading, upcomingCount = 0 }: EventStatsHeaderProps) {
  const totalEvents = stats?.totalEvents ?? 0;
  const totalReserved =
    stats?.totalTicketsReserved ??
    stats?.totalReservedSeats ??
    stats?.totalBookings ??
    0;
  const totalRevenue = stats?.totalRevenue ?? stats?.totalEstimatedRevenue ?? 0;
  const upcomingGatherings = stats?.upcomingEvents ?? upcomingCount ?? 0;

  const totalCapacity = stats?.totalCapacity ?? 0;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalReserved / totalCapacity) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Events */}
      <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden border border-emerald-900/10 hover:border-emerald-500/30 transition shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E]">
            Total Events
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[#0B3D2E] ring-1 ring-emerald-200/50">
            <CalendarOutlined className="text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B3D2E]">
            {loading ? "…" : totalEvents}
          </h2>
          <p className="text-xs text-mist-500 mt-1">
            {stats?.publishedEvents !== undefined
              ? `${stats.publishedEvents} published • ${stats.draftEvents ?? 0} draft`
              : "All gatherings in system"}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl" />
      </GlassCard>

      {/* Reserved / Sold Tickets */}
      <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden border border-indigo-900/10 hover:border-indigo-500/30 transition shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
            Tickets Reserved
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50">
            <TeamOutlined className="text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-indigo-950">
            {loading ? "…" : totalReserved.toLocaleString()}
          </h2>
          <p className="text-xs text-mist-500 mt-1">
            {stats?.totalCheckedIn !== undefined && stats.totalCheckedIn > 0
              ? `${stats.totalCheckedIn} checked in • ${totalReserved} reserved`
              : totalCapacity > 0
              ? `${occupancyRate}% seat occupancy (${totalCapacity.toLocaleString()} cap)`
              : "Total attendee reservations"}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl" />
      </GlassCard>

      {/* Estimated Event Revenue */}
      <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden border border-amber-900/10 hover:border-amber-500/30 transition shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Event Revenue
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-300/50">
            <DollarCircleOutlined className="text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-amber-950">
            {loading ? "…" : formatCurrency(totalRevenue)}
          </h2>
          <p className="text-xs text-mist-500 mt-1">
            {stats?.paidBookings !== undefined
              ? `${stats.paidBookings} paid bookings`
              : "Paid ticket reservations"}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl" />
      </GlassCard>

      {/* Upcoming Gatherings */}
      <GlassCard className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden border border-teal-900/10 hover:border-teal-500/30 transition shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Upcoming Gatherings
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-200/50">
            <FireOutlined className="text-lg" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-teal-950">
            {loading ? "…" : upcomingGatherings}
          </h2>
          <p className="text-xs text-mist-500 mt-1">
            {stats?.pastEvents !== undefined
              ? `${stats.pastEvents} past gatherings completed`
              : "Actively open for registration"}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-teal-500/10 blur-xl" />
      </GlassCard>
    </div>
  );
}
