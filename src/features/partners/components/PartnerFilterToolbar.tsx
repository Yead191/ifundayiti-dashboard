import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";

interface PartnerFilterToolbarProps {
  statusFilter: string;
  featuredFilter: string;
  searchTerm: string;
  onStatusChange: (status: string) => void;
  onFeaturedChange: (featured: string) => void;
  onSearchChange: (search: string) => void;
}

export function PartnerFilterToolbar({
  statusFilter,
  featuredFilter,
  searchTerm,
  onStatusChange,
  onFeaturedChange,
  onSearchChange,
}: PartnerFilterToolbarProps) {
  const tabs = [
    { label: "All Statuses", value: "ALL" },
    { label: "Pending", value: PARTNER_STATUS.PENDING },
    { label: "Approved", value: PARTNER_STATUS.APPROVED },
    { label: "Rejected", value: PARTNER_STATUS.REJECTED },
  ];

  return (
    <GlassCard className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#0B3D2E] text-white shadow-xs"
                    : "bg-gray-100/80 text-mist-600 hover:bg-gray-200/80 hover:text-cloud-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search and Featured dropdown */}
        <div className="flex items-center gap-2.5">
          <Select
            value={featuredFilter}
            onChange={onFeaturedChange}
            className="w-36 h-9"
            options={[
              { label: "All Placements", value: "ALL" },
              { label: "Featured Only", value: "FEATURED" },
              { label: "Standard Only", value: "STANDARD" },
            ]}
          />

          <Input
            prefix={<SearchOutlined className="text-mist-400" />}
            placeholder="Search by name or description…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            className="h-9 w-60 rounded-xl"
          />
        </div>
      </div>
    </GlassCard>
  );
}
