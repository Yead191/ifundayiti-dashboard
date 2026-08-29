import { Tabs, Badge, Input, Select, Button, Segmented, Tooltip } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
  CrownOutlined,
  TeamOutlined,
  HeartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { TeamStats } from "@/redux/features/team/team.types";

interface TeamFiltersBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  stats?: TeamStats;
  onAddMember: () => void;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export function TeamFiltersBar({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  stats,
  onAddMember,
  onRefresh,
  isFetching = false,
}: TeamFiltersBarProps) {
  const pendingCount = stats?.totalVolunteersPending ?? 0;

  const tabItems = [
    {
      key: "all",
      label: (
        <span className="flex items-center gap-2 py-1 px-1 font-semibold">
          <span>All Team</span>
          {stats && (
            <Badge
              count={
                (stats.totalDirectors || 0) +
                (stats.totalMembers || 0) +
                (stats.totalVolunteers || 0)
              }
              showZero
              style={{
                backgroundColor:
                  activeTab === "all" ? "#7c3aed" : "rgba(124, 58, 237, 0.08)",
                color: activeTab === "all" ? "#fff" : "#7c3aed",
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
      key: "director",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <CrownOutlined className="text-amber-500" />
          <span>Directors</span>
          {stats?.totalDirectors !== undefined && (
            <Badge
              count={stats.totalDirectors}
              showZero
              style={{
                backgroundColor:
                  activeTab === "director" ? "#d97706" : "rgba(217, 119, 6, 0.1)",
                color: activeTab === "director" ? "#fff" : "#d97706",
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
      key: "member",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <TeamOutlined className="text-emerald-500" />
          <span>Core Members</span>
          {stats?.totalMembers !== undefined && (
            <Badge
              count={stats.totalMembers}
              showZero
              style={{
                backgroundColor:
                  activeTab === "member" ? "#059669" : "rgba(5, 150, 105, 0.1)",
                color: activeTab === "member" ? "#fff" : "#059669",
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
      key: "volunteer",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <HeartOutlined className="text-violet-500" />
          <span>Volunteers</span>
          {stats?.totalVolunteers !== undefined && (
            <Badge
              count={stats.totalVolunteers}
              showZero
              style={{
                backgroundColor:
                  activeTab === "volunteer" ? "#7c3aed" : "rgba(124, 58, 237, 0.1)",
                color: activeTab === "volunteer" ? "#fff" : "#7c3aed",
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
      key: "pending_volunteers",
      label: (
        <span className="flex items-center gap-1.5 py-1 px-1 font-semibold">
          <ClockCircleOutlined className="text-rose-500" />
          <span>Volunteer Applicants</span>
          {pendingCount > 0 && (
            <Badge
              count={pendingCount}
              style={{
                backgroundColor: "#e11d48",
                color: "#fff",
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
    <GlassCard flat padded={false} className="overflow-hidden border border-navy-700/60 shadow-xs">
      {/* Category Tabs */}
      <div className="border-b border-navy-700/40 bg-linear-to-b from-navy-800/10 to-transparent px-4 pt-2 md:px-5">
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={tabItems}
          className="applications-tabs"
        />
      </div>

      {/* Filter Tools & Actions */}
      <div className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center md:p-5">
        {/* Search & Status Filter */}
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
          <div>
            <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-mist-500">
              Search Team
            </div>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-mist-400" />}
              placeholder="Search name, focus area, location..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-xl border-navy-700/60 py-1.5 focus:border-violet-600 hover:border-violet-600"
            />
          </div>

          <div>
            <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-mist-500">
              Status Filter
            </div>
            <Select
              className="w-full rounded-xl"
              value={statusFilter}
              onChange={onStatusFilterChange}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active Only", value: "active" },
                { label: "Pending Only", value: "pending" },
                { label: "Rejected", value: "rejected" },
                { label: "Blocked", value: "blocked" },
              ]}
            />
          </div>
        </div>

        {/* View Switcher & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          {onRefresh && (
            <Tooltip title="Refresh team directory">
              <Button
                icon={<ReloadOutlined spin={isFetching} />}
                onClick={onRefresh}
                className="rounded-xl border-navy-700/60 hover:border-violet-600 hover:text-violet-600"
              />
            </Tooltip>
          )}

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
            className="rounded-xl border border-navy-700/60 bg-white/60 p-0.5"
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddMember}
            className="btn-linear rounded-xl border-0 shadow-sm"
          >
            Add Member
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
