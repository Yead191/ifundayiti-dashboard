import { Input, Select, Button, Tooltip } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";

interface EventFiltersBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  formatType: string;
  onFormatChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  pricingType: string;
  onPricingTypeChange: (val: string) => void;
  onRefresh?: () => void;
  isFetching?: boolean;
}

export function EventFiltersBar({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  formatType,
  onFormatChange,
  status,
  onStatusChange,
  pricingType,
  onPricingTypeChange,
  onRefresh,
  isFetching = false,
}: EventFiltersBarProps) {
  return (
    <GlassCard className="p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search input */}
        <div className="relative w-full lg:max-w-xs">
          <Input
            prefix={<SearchOutlined className="text-mist-400 mr-1" />}
            placeholder="Search event title, venue, city..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            className="h-10 rounded-xl"
          />
        </div>

        {/* Right: Filter dropdowns and "+ Create Event" button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <Select
            value={category}
            onChange={onCategoryChange}
            className="h-10 min-w-36"
            options={[
              { value: "all", label: "All Categories" },
              { value: "gala", label: "Gala & Banquet" },
              { value: "fundraiser", label: "Fundraiser" },
              { value: "pitch-night", label: "Pitch Night" },
              { value: "workshop", label: "Workshop" },
            ]}
          />

          {/* Format / Type Dropdown */}
          <Select
            value={formatType}
            onChange={onFormatChange}
            className="h-10 min-w-34"
            options={[
              { value: "all", label: "All Formats" },
              { value: "physical", label: "In-Person" },
              { value: "virtual", label: "Virtual Stream" },
              { value: "hybrid", label: "Hybrid" },
            ]}
          />

          {/* Pricing Dropdown */}
          <Select
            value={pricingType}
            onChange={onPricingTypeChange}
            className="h-10 min-w-30"
            options={[
              { value: "all", label: "All Pricing" },
              { value: "free", label: "Free RSVP" },
              { value: "paid", label: "Paid Tickets" },
            ]}
          />

          {/* Status Dropdown */}
          <Select
            value={status}
            onChange={onStatusChange}
            className="h-10 min-w-32"
            options={[
              { value: "all", label: "All Status" },
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />

          {/* Refresh Tooltip & Button */}
          {onRefresh && (
            <Tooltip title="Refresh event records">
              <Button
                icon={<ReloadOutlined className={isFetching ? "animate-spin" : ""} />}
                onClick={onRefresh}
                className="h-10 w-10 rounded-xl"
              />
            </Tooltip>
          )}

          {/* Create New Event CTA Button */}
          <Link to="/events/new">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="h-10 rounded-xl bg-[#0B3D2E] hover:bg-[#082b20] font-semibold px-4 shadow-sm border-0"
            >
              + Create New Event
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
