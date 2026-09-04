import {
  SkinOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  WarningOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ProductStats } from "@/redux/features/shop/product.types";

interface ProductStatsHeaderProps {
  stats?: ProductStats;
  loading?: boolean;
  activeStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
}

export function ProductStatsHeader({
  stats,
  loading = false,
  activeStatusFilter,
  onSelectStatus,
}: ProductStatsHeaderProps) {
  const cards = [
    {
      id: "all",
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      description: "Apparel items in catalog",
      icon: <SkinOutlined className="text-xl text-emerald-600" />,
      bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "all"
          ? "border-[#0B3D2E] ring-2 ring-[#0B3D2E]/20"
          : "border-emerald-500/30",
      textColor: "text-[#0B3D2E]",
      action: () => onSelectStatus?.("all"),
    },
    {
      id: "active",
      title: "Active in Store",
      value: stats?.activeProducts ?? 0,
      description: "Live Products for sale",
      icon: <CheckCircleOutlined className="text-xl text-blue-600" />,
      bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "active"
          ? "border-blue-600 ring-2 ring-blue-600/20"
          : "border-blue-500/30",
      textColor: "text-blue-700",
      action: () => onSelectStatus?.("active"),
    },
    {
      id: "inventory",
      title: "Total Inventory",
      value: (stats?.totalInventoryUnits ?? 0).toLocaleString(),
      description: "Units across all sizes & colors",
      icon: <InboxOutlined className="text-xl text-indigo-600" />,
      bgGradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      borderColor: "border-indigo-500/30",
      textColor: "text-indigo-700",
      action: undefined,
    },
    {
      id: "outOfStock",
      title: "Restock Needed",
      value: stats?.outOfStockVariants ?? 0,
      description: "Out-of-stock size/color SKUs",
      icon: <WarningOutlined className="text-xl text-amber-600" />,
      bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor:
        (stats?.outOfStockVariants ?? 0) > 0
          ? "border-amber-500/40 bg-amber-50/20"
          : "border-amber-500/30",
      textColor: "text-amber-700",
      action: undefined,
    },
    {
      id: "sold",
      title: "Units Sold",
      value: (stats?.totalSold ?? 0).toLocaleString(),
      description: "Lifetime merchandise sales",
      icon: <FireOutlined className="text-xl text-rose-600" />,
      bgGradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      borderColor: "border-rose-500/30",
      textColor: "text-rose-700",
      action: undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <GlassCard
          key={card.id}
          onClick={card.action}
          className={`relative overflow-hidden p-4 transition-all duration-200 ${
            card.borderColor
          } ${
            card.action
              ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
              : ""
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.bgGradient}`}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-mist-600">{card.title}</p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-cloud-100">
                {loading ? "..." : card.value}
              </h3>
              <p className="mt-1 text-[11px] text-mist-500">
                {card.description}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-xs border border-gray-100">
              {card.icon}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
