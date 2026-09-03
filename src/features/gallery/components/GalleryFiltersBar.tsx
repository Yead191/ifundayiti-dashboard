import { Tabs, Badge, Input, Select, Button, Segmented, Tooltip } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  PictureOutlined,
  StarFilled,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  GALLERY_CATEGORIES,
  type GalleryStats,
} from "@/redux/features/gallery/gallery.types";

interface GalleryFiltersBarProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  stats?: GalleryStats;
  onCreatePhoto: () => void;
  onRefresh?: () => void;
  isFetching?: boolean;
  isFeaturedOnly?: boolean;
  onToggleFeaturedOnly?: () => void;
}

export function GalleryFiltersBar({
  activeStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  viewMode,
  onViewModeChange,
  stats,
  onCreatePhoto,
  onRefresh,
  isFetching = false,
  isFeaturedOnly = false,
  onToggleFeaturedOnly,
}: GalleryFiltersBarProps) {
  const tabItems = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2 py-1 px-1 font-semibold">
          <PictureOutlined />
          <span>All Photos</span>
          {stats?.totalItems !== undefined && (
            <Badge
              count={stats.totalItems}
              showZero
              style={{
                backgroundColor:
                  activeStatus === "all" && !isFeaturedOnly
                    ? "#0b3d2e"
                    : "rgba(11, 61, 46, 0.08)",
                color:
                  activeStatus === "all" && !isFeaturedOnly
                    ? "#fff"
                    : "#0b3d2e",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "Published",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <CheckCircleOutlined className="text-emerald-500" />
          <span>Published</span>
          {stats?.publishedItems !== undefined && (
            <Badge
              count={stats.publishedItems}
              showZero
              style={{
                backgroundColor:
                  activeStatus === "Published"
                    ? "#059669"
                    : "rgba(5, 150, 105, 0.1)",
                color: activeStatus === "Published" ? "#fff" : "#059669",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "Draft",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <ClockCircleOutlined className="text-amber-500" />
          <span>Drafts</span>
          {stats?.draftItems !== undefined && (
            <Badge
              count={stats.draftItems}
              showZero
              style={{
                backgroundColor:
                  activeStatus === "Draft"
                    ? "#d97706"
                    : "rgba(217, 119, 6, 0.1)",
                color: activeStatus === "Draft" ? "#fff" : "#d97706",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
    {
      key: "Archived",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <InboxOutlined className="text-slate-400" />
          <span>Archived</span>
          {stats?.archivedItems !== undefined && (
            <Badge
              count={stats.archivedItems}
              showZero
              style={{
                backgroundColor:
                  activeStatus === "Archived"
                    ? "#475569"
                    : "rgba(71, 85, 105, 0.1)",
                color: activeStatus === "Archived" ? "#fff" : "#475569",
                boxShadow: "none",
                fontSize: "10px",
                height: "18px",
                lineHeight: "18px",
                minWidth: "18px",
                padding: "0 5px",
              }}
            />
          )}
        </span>
      ),
    },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...GALLERY_CATEGORIES.map((cat) => ({
      value: cat,
      label: cat,
    })),
  ];

  return (
    <GlassCard className="space-y-4 border border-navy-700/60 p-4">
      {/* Top Row: Status Tabs & Primary Action */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          activeKey={isFeaturedOnly ? "" : activeStatus}
          onChange={(key) => {
            if (isFeaturedOnly && onToggleFeaturedOnly) {
              onToggleFeaturedOnly();
            }
            onStatusChange(key);
          }}
          items={tabItems}
          className="custom-tabs !m-0"
        />

        <div className="flex items-center gap-2">
          {/* Spotlight Filter Toggle Button */}
          {onToggleFeaturedOnly && (
            <Button
              onClick={onToggleFeaturedOnly}
              className={`rounded-xl border font-medium ${
                isFeaturedOnly
                  ? "border-amber-400/80 bg-amber-500/15 text-amber-700"
                  : "border-navy-700/60 bg-white/80 text-mist-600 hover:border-amber-400"
              }`}
              icon={<StarFilled className={isFeaturedOnly ? "text-amber-500" : "text-mist-400"} />}
            >
              Spotlight Only
            </Button>
          )}

          {/* Primary CTA */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreatePhoto}
            className="btn-gradient rounded-xl px-4 py-2 font-semibold shadow-xs"
          >
            Add New Photo
          </Button>
        </div>
      </div>

      {/* Bottom Row: Search, Category Filter, View Mode, Refresh */}
      <div className="flex flex-col gap-3 border-t border-navy-700/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="w-full sm:w-72">
            <Input
              prefix={<SearchOutlined className="text-mist-400" />}
              placeholder="Search title, location, description..."
              allowClear
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-xl border-navy-700/60 bg-white/80 py-1.5 text-sm"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="w-full sm:w-56">
            <Select
              value={categoryFilter}
              onChange={onCategoryFilterChange}
              options={categoryOptions}
              className="w-full"
              popupClassName="rounded-xl"
            />
          </div>
        </div>

        {/* View Switcher & Refresh */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Segmented
            value={viewMode}
            onChange={(val) => onViewModeChange(val as "grid" | "table")}
            options={[
              {
                value: "grid",
                icon: <AppstoreOutlined />,
                label: "Grid",
              },
              {
                value: "table",
                icon: <UnorderedListOutlined />,
                label: "Table",
              },
            ]}
            className="rounded-xl bg-navy-800/10 p-1"
          />

          {onRefresh && (
            <Tooltip title="Refresh photo catalog">
              <Button
                icon={<ReloadOutlined spin={isFetching} />}
                onClick={onRefresh}
                className="rounded-xl border-navy-700/60 bg-white/80 hover:border-emerald-600"
              />
            </Tooltip>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
