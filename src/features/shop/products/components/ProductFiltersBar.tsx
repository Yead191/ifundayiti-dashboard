import { Input, Select, Segmented, Tooltip } from "antd";
import {
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ProductCategory } from "@/redux/features/shop/product.types";
import { GENDERS } from "@/redux/features/shop/product.types";

interface ProductFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: ProductCategory[];
  genderFilter: string;
  onGenderChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  statusCounts?: {
    all?: number;
    active?: number;
    draft?: number;
    inactive?: number;
    archived?: number;
  };
}

export function ProductFiltersBar({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  genderFilter,
  onGenderChange,
  statusFilter,
  onStatusChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  statusCounts,
}: ProductFiltersBarProps) {
  const statusOptions = [
    { label: `All (${statusCounts?.all ?? "—"})`, value: "all" },
    { label: `Active (${statusCounts?.active ?? "—"})`, value: "active" },
    { label: `Draft (${statusCounts?.draft ?? "—"})`, value: "draft" },
    { label: `Inactive (${statusCounts?.inactive ?? "—"})`, value: "inactive" },
    { label: `Archived (${statusCounts?.archived ?? "—"})`, value: "archived" },
  ];

  const sortOptions = [
    { label: "Newest Arrivals", value: "-createdAt" },
    { label: "Best Sellers", value: "-sold" },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
  ];

  return (
    <div className="space-y-3">
      {/* Top Filter Bar: Search, Category, Gender, Sort, View */}
      <GlassCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search and Category */}
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
              <Input
                prefix={<SearchOutlined className="text-mist-400" />}
                placeholder="Search by title, tags, fabric..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                allowClear
                className="h-10 rounded-xl border-navy-700/60"
              />
            </div>

            <Select
              value={categoryFilter}
              onChange={onCategoryChange}
              className="h-10 min-w-[180px] rounded-xl"
              options={[
                { label: "All Categories", value: "all" },
                ...categories.map((c) => ({
                  label: c.name,
                  value: c._id,
                })),
              ]}
            />

            {/* Gender Filter */}
            <Select
              value={genderFilter}
              onChange={onGenderChange}
              className="h-10 min-w-[130px] rounded-xl"
              options={[
                { label: "All Genders", value: "all" },
                ...GENDERS.map((g) => ({
                  label: g.label,
                  value: g.value,
                })),
              ]}
            />
          </div>

          {/* Sort and View Mode */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-mist-500">Sort:</span>
              <Select
                value={sort}
                onChange={onSortChange}
                className="h-10 w-44 rounded-xl"
                options={sortOptions}
              />
            </div>

            <Segmented
              value={viewMode}
              onChange={(val) => onViewModeChange(val as "grid" | "table")}
              options={[
                {
                  value: "grid",
                  icon: (
                    <Tooltip title="Grid View">
                      <AppstoreOutlined />
                    </Tooltip>
                  ),
                },
                {
                  value: "table",
                  icon: (
                    <Tooltip title="Table View">
                      <BarsOutlined />
                    </Tooltip>
                  ),
                },
              ]}
              className="h-10 p-1 rounded-xl bg-gray-100 border border-gray-200"
            />
          </div>
        </div>
      </GlassCard>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusOptions.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-[#0B3D2E] text-white shadow-xs"
                  : "bg-white/80 text-mist-700 hover:bg-white hover:text-cloud-100 border border-gray-200/80 shadow-2xs"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
