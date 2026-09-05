import {
  ShoppingOutlined,
  DollarOutlined,
  SyncOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { OrderStats } from "@/redux/features/orders/orders.types";
import { formatPrice } from "../orderHelpers";

interface OrderStatsHeaderProps {
  stats?: OrderStats;
  loading?: boolean;
  activeStatusFilter?: string;
  onSelectStatus?: (status: string) => void;
}

export function OrderStatsHeader({
  stats,
  loading = false,
  activeStatusFilter,
  onSelectStatus,
}: OrderStatsHeaderProps) {
  const cards = [
    {
      id: "all",
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      description: "All customer purchases",
      icon: <ShoppingOutlined className="text-xl text-violet-600" />,
      bgGradient: "from-violet-500/10 via-violet-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "all"
          ? "border-violet-600 ring-2 ring-violet-600/20"
          : "border-violet-500/30",
      textColor: "text-violet-700",
      action: () => onSelectStatus?.("all"),
    },
    {
      id: "revenue",
      title: "Sales Volume",
      value: formatPrice(stats?.totalRevenue),
      description: "Gross order payments",
      icon: <DollarOutlined className="text-xl text-emerald-600" />,
      bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-700",
      action: undefined,
    },
    {
      id: "processing",
      title: "Fulfillment Queue",
      value: stats?.inFulfillmentCount ?? 0,
      description: "Confirmed & processing",
      icon: <SyncOutlined spin={loading} className="text-xl text-blue-600" />,
      bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "processing" || activeStatusFilter === "confirmed"
          ? "border-blue-600 ring-2 ring-blue-600/20"
          : "border-blue-500/30",
      textColor: "text-blue-700",
      action: () => onSelectStatus?.("processing"),
    },
    {
      id: "delivered",
      title: "Delivered Orders",
      value: stats?.deliveredCount ?? 0,
      description: "Successfully fulfilled",
      icon: <CheckCircleOutlined className="text-xl text-teal-600" />,
      bgGradient: "from-teal-500/10 via-teal-500/5 to-transparent",
      borderColor:
        activeStatusFilter === "delivered"
          ? "border-teal-600 ring-2 ring-teal-600/20"
          : "border-teal-500/30",
      textColor: "text-teal-700",
      action: () => onSelectStatus?.("delivered"),
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
            <div className={`font-display text-2xl font-bold tracking-tight ${card.textColor}`}>
              {loading ? "..." : card.value}
            </div>
          </div>

          <div className="mt-3">
            <h4 className="font-display text-sm font-bold text-cloud-100">
              {card.title}
            </h4>
            <p className="mt-0.5 text-xs text-mist-500">
              {card.description}
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
