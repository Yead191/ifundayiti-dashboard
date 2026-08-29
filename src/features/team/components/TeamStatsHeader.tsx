import {
  CrownOutlined,
  TeamOutlined,
  HeartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { TeamStats } from "@/redux/features/team/team.types";

interface TeamStatsHeaderProps {
  stats?: TeamStats;
  loading?: boolean;
  onSelectTab?: (tab: string) => void;
}

export function TeamStatsHeader({
  stats,
  loading = false,
  onSelectTab,
}: TeamStatsHeaderProps) {
  const statCards = [
    {
      id: "director",
      title: "Board Directors",
      count: stats?.totalDirectors ?? 0,
      description: "Leadership & governance",
      icon: <CrownOutlined className="text-xl text-amber-500" />,
      bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-600",
    },
    {
      id: "member",
      title: "Core Members",
      count: stats?.totalMembers ?? 0,
      description: "Operations & field execution",
      icon: <TeamOutlined className="text-xl text-emerald-500" />,
      bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-600",
    },
    {
      id: "volunteer",
      title: "Total Volunteers",
      count: stats?.totalVolunteers ?? 0,
      description: "Community vetting & translators",
      icon: <HeartOutlined className="text-xl text-violet-500" />,
      bgGradient: "from-violet-500/10 via-violet-500/5 to-transparent",
      borderColor: "border-violet-500/30",
      textColor: "text-violet-600",
    },
    {
      id: "pending_volunteers",
      title: "Pending Applicants",
      count: stats?.totalVolunteersPending ?? 0,
      description: "Awaiting admin approval",
      icon: <ClockCircleOutlined className="text-xl text-rose-500" />,
      bgGradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      borderColor: "border-rose-500/30",
      textColor: "text-rose-600",
      hasAlertBadge: (stats?.totalVolunteersPending ?? 0) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <GlassCard
          key={card.id}
          className={`relative cursor-pointer overflow-hidden border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${card.borderColor} bg-gradient-to-br ${card.bgGradient}`}
          onClick={() => onSelectTab?.(card.id)}
        >
          {card.hasAlertBadge && (
            <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            </span>
          )}

          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-navy-700/40 bg-white/70 p-2.5 shadow-xs">
              {card.icon}
            </div>
            <div className={`font-display text-2xl font-bold ${card.textColor}`}>
              {loading ? "..." : card.count}
            </div>
          </div>

          <div className="mt-3.5">
            <h4 className="font-display text-sm font-semibold text-cloud-100">
              {card.title}
            </h4>
            <p className="mt-0.5 text-xs text-mist-500">{card.description}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
