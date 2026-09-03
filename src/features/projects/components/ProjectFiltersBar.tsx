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
  FolderOpenOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  PROJECT_CATEGORIES,
  type ProjectStats,
} from "@/redux/features/projects/project.types";

interface ProjectFiltersBarProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  stats?: ProjectStats;
  onCreateProject: () => void;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export function ProjectFiltersBar({
  activeStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  viewMode,
  onViewModeChange,
  stats,
  onCreateProject,
  onRefresh,
  isFetching = false,
}: ProjectFiltersBarProps) {
  const tabItems = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2 py-1 px-1 font-semibold">
          <FolderOpenOutlined />
          <span>All Projects</span>
          {stats?.totalProjects !== undefined && (
            <Badge
              count={stats.totalProjects}
              showZero
              style={{
                backgroundColor:
                  activeStatus === "all" ? "#0b3d2e" : "rgba(11, 61, 46, 0.08)",
                color: activeStatus === "all" ? "#fff" : "#0b3d2e",
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
          {stats?.publishedProjects !== undefined && (
            <Badge
              count={stats.publishedProjects}
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
          {stats?.draftProjects !== undefined && (
            <Badge
              count={stats.draftProjects}
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
          <InboxOutlined className="text-slate-500" />
          <span>Archived</span>
          {stats?.archivedProjects !== undefined && (
            <Badge
              count={stats.archivedProjects}
              showZero
              style={{
                backgroundColor:
                  activeStatus === "Archived"
                    ? "#64748b"
                    : "rgba(100, 116, 139, 0.1)",
                color: activeStatus === "Archived" ? "#fff" : "#64748b",
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

  return (
    <GlassCard className="border border-navy-700/60 p-4 shadow-xs">
      {/* Top row: Status Tabs */}
      <div className="border-b border-navy-700/50 pb-2">
        <Tabs
          activeKey={activeStatus}
          onChange={onStatusChange}
          items={tabItems}
          className="team-filter-tabs [&_.ant-tabs-nav]:mb-0"
        />
      </div>

      {/* Bottom row: Search, Category Filter, View Mode, Refresh & CTA */}
      <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Input
              prefix={<SearchOutlined className="text-mist-400" />}
              placeholder="Search by project name, description, location, or founder..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              allowClear
              className="h-10 w-full rounded-xl border-navy-700/70 bg-white/90 text-sm shadow-2xs hover:border-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Category Dropdown */}
          <Select
            value={categoryFilter}
            onChange={onCategoryFilterChange}
            className="h-10 w-full sm:w-56"
            popupMatchSelectWidth={false}
            options={[
              { value: "all", label: "All Categories" },
              ...PROJECT_CATEGORIES.map((cat) => ({
                value: cat,
                label: cat,
              })),
            ]}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2.5 sm:justify-end">
          {/* Grid vs Table View Mode */}
          <Segmented
            value={viewMode}
            onChange={(val) => onViewModeChange(val as "grid" | "table")}
            options={[
              {
                value: "grid",
                icon: (
                  <Tooltip title="Grid Card View">
                    <AppstoreOutlined />
                  </Tooltip>
                ),
              },
              {
                value: "table",
                icon: (
                  <Tooltip title="Data Table View">
                    <UnorderedListOutlined />
                  </Tooltip>
                ),
              },
            ]}
            className="rounded-xl border border-navy-700/60 bg-white/70 p-1"
          />

          {/* Refresh Data */}
          {onRefresh && (
            <Tooltip title="Refresh directory data">
              <Button
                icon={<ReloadOutlined spin={isFetching} />}
                onClick={onRefresh}
                className="h-10 w-10 rounded-xl border-navy-700/70 bg-white/80 p-0 text-mist-500 hover:border-emerald-600 hover:text-emerald-700"
              />
            </Tooltip>
          )}

          {/* Create New Project Primary Button */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateProject}
            className="btn-linear flex h-10 items-center gap-1.5 rounded-xl border-0 px-4 font-semibold text-white shadow-xs"
          >
            New Project
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
