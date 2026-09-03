import {
  PictureOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarFilled,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { GalleryStats } from "@/redux/features/gallery/gallery.types";

interface GalleryStatsHeaderProps {
  stats?: GalleryStats;
  loading?: boolean;
  activeStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
  isFeaturedOnly?: boolean;
  onToggleFeaturedOnly?: () => void;
}

export function GalleryStatsHeader({
  stats,
  loading = false,
  activeStatusFilter,
  onSelectStatus,
  isFeaturedOnly,
  onToggleFeaturedOnly,
}: GalleryStatsHeaderProps) {
  const cards = [
    {
      id: "all",
      title: "Total Photos",
      value: stats?.totalItems ?? 0,
      description: "Visual archive & field media",
      icon: <PictureOutlined className="text-xl text-violet-600" />,
      bgGradient: "from-violet-500/10 via-violet-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "all" && !isFeaturedOnly
          ? "border-violet-600 ring-2 ring-violet-600/20"
          : "border-violet-500/30",
      textColor: "text-violet-700",
      action: () => {
        if (isFeaturedOnly && onToggleFeaturedOnly) onToggleFeaturedOnly();
        onSelectStatus?.("all");
      },
    },
    {
      id: "Published",
      title: "Published Photos",
      value: stats?.publishedItems ?? 0,
      description: "Live in public gallery showcase",
      icon: <CheckCircleOutlined className="text-xl text-emerald-600" />,
      bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "Published" && !isFeaturedOnly
          ? "border-emerald-600 ring-2 ring-emerald-600/20"
          : "border-emerald-500/30",
      textColor: "text-emerald-700",
      action: () => {
        if (isFeaturedOnly && onToggleFeaturedOnly) onToggleFeaturedOnly();
        onSelectStatus?.("Published");
      },
    },
    {
      id: "Draft",
      title: "Pending Drafts",
      value: stats?.draftItems ?? 0,
      description: "Photos awaiting curation / review",
      icon: <ClockCircleOutlined className="text-xl text-amber-500" />,
      bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "Draft" && !isFeaturedOnly
          ? "border-amber-600 ring-2 ring-amber-600/20"
          : "border-amber-500/30",
      textColor: "text-amber-700",
      action: () => {
        if (isFeaturedOnly && onToggleFeaturedOnly) onToggleFeaturedOnly();
        onSelectStatus?.("Draft");
      },
    },
    {
      id: "featured",
      title: "Featured Spotlight",
      value: stats?.featuredItems ?? 0,
      description: "Highlighted on public homepage",
      icon: <StarFilled className="text-xl text-amber-500" />,
      bgGradient: "from-amber-500/15 via-amber-400/5 to-transparent",
      borderColor: isFeaturedOnly
        ? "border-amber-500 ring-2 ring-amber-500/30"
        : "border-amber-400/40",
      textColor: "text-amber-600",
      action: onToggleFeaturedOnly,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <GlassCard
          key={card.id}
          className={`relative overflow-hidden border p-5 transition-all duration-300 ${
            card.action ? "cursor-pointer hover:-translate-y-1 hover:shadow-md" : ""
          } ${card.borderColor} bg-linear-to-br ${card.bgGradient}`}
          onClick={card.action}
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-navy-700/40 bg-white/80 p-2.5 shadow-xs">
              {card.icon}
            </div>
            <div
              className={`font-display text-2xl font-bold tracking-tight ${card.textColor}`}
            >
              {loading ? "..." : card.value}
            </div>
          </div>

          <div className="mt-3">
            <h4 className="font-display text-sm font-bold text-cloud-100">
              {card.title}
            </h4>
            <p className="mt-0.5 text-xs text-mist-500">{card.description}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
