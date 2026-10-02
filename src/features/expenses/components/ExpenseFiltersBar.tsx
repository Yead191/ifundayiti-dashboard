import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Input, Segmented, Select, DatePicker, Button, Tooltip } from "antd";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  CATEGORY_LABELS,
  CATEGORY_SUBCATEGORIES_MAP,
  SUBCATEGORY_LABELS,
  type ExpenseCategory,
  type ExpensePaymentStatus,
  type ExpenseSubcategory,
} from "@/redux/features/expenses/expenses.types";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface ExpenseFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ExpensePaymentStatus | "all";
  onStatusChange: (status: ExpensePaymentStatus | "all") => void;
  categoryFilter: ExpenseCategory | "all";
  onCategoryChange: (category: ExpenseCategory | "all") => void;
  subcategoryFilter: ExpenseSubcategory | "all";
  onSubcategoryChange: (subcat: ExpenseSubcategory | "all") => void;
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  onDateRangeChange: (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => void;
  selectedCount: number;
  onBatchDelete: () => void;
  onOpenRecordModal: () => void;
  onExportCSV: () => void;
  onRefresh: () => void;
  isFetching?: boolean;
}

export function ExpenseFiltersBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  subcategoryFilter,
  onSubcategoryChange,
  dateRange,
  onDateRangeChange,
  selectedCount,
  onBatchDelete,
  onOpenRecordModal,
  onExportCSV,
  onRefresh,
  isFetching = false,
}: ExpenseFiltersBarProps) {
  // Available subcategories based on chosen category
  const availableSubcategories: ExpenseSubcategory[] =
    categoryFilter !== "all"
      ? CATEGORY_SUBCATEGORIES_MAP[categoryFilter] || []
      : (Object.keys(SUBCATEGORY_LABELS) as ExpenseSubcategory[]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    subcategoryFilter !== "all" ||
    Boolean(dateRange);

  const handleResetFilters = () => {
    onSearchChange("");
    onStatusChange("all");
    onCategoryChange("all");
    onSubcategoryChange("all");
    onDateRangeChange(null);
  };

  return (
    <GlassCard className="p-3.5 2xl:p-4 space-y-3">
      {/* Top row: Search, Status tabs, Batch actions, and Primary buttons */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-72 xl:w-80">
          <Input
            prefix={<SearchOutlined className="text-gray-400 mr-1" />}
            placeholder="Search title, reference #, notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            className="h-10 rounded-xl bg-gray-50/70 hover:bg-white focus:bg-white text-xs"
          />
        </div>

        {/* Status segmented tabs */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
          <Segmented
            value={statusFilter}
            onChange={(val) => onStatusChange(val as any)}
            className="p-1 rounded-xl bg-gray-100 font-medium text-xs"
            options={[
              { value: "all", label: "All Statuses" },
              {
                value: "paid",
                label: (
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Paid</span>
                  </span>
                ),
              },
              {
                value: "unpaid",
                label: (
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Unpaid</span>
                  </span>
                ),
              },
              {
                value: "cancelled",
                label: (
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    <span>Cancelled</span>
                  </span>
                ),
              },
            ]}
          />

          {/* Batch Delete Trigger */}
          {selectedCount > 0 && (
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              onClick={onBatchDelete}
              className="h-9 rounded-xl bg-rose-600! hover:bg-rose-700! font-semibold px-3.5 shadow-xs border-0 animate-in fade-in"
            >
              Delete Selected ({selectedCount})
            </Button>
          )}
        </div>

        {/* Action buttons: Record, CSV, Refresh */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenRecordModal}
            className="h-10 px-4 rounded-xl font-semibold bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! shadow-xs border-0"
          >
            Record Expense
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={onExportCSV}
            className="h-10 rounded-xl font-medium border-gray-200 hover:border-[#0B3D2E] text-xs"
          >
            Export CSV
          </Button>

          <Tooltip title="Refresh expenses and fund stats">
            <Button
              icon={
                <ReloadOutlined className={isFetching ? "animate-spin" : ""} />
              }
              onClick={onRefresh}
              className="h-10 w-10 rounded-xl border-gray-200"
            />
          </Tooltip>
        </div>
      </div>

      {/* Bottom row: Category, Subcategory, DateRange filter pills */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-gray-100">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
          <FilterOutlined className="text-gray-400" />
          <span>Filters:</span>
        </span>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onChange={(val) => {
            onCategoryChange(val);
            onSubcategoryChange("all");
          }}
          className="h-8.5 rounded-xl min-w-36 text-xs"
          options={[
            { value: "all", label: "All Categories" },
            { value: "business", label: "Business Operations" },
            { value: "event", label: "Events & Gatherings" },
            { value: "program", label: "Programs & Grants" },
            { value: "other", label: "Other Expenditures" },
          ]}
        />

        {/* Subcategory Filter */}
        <Select
          value={subcategoryFilter}
          onChange={onSubcategoryChange}
          className="h-8.5 rounded-xl min-w-44 text-xs"
          disabled={availableSubcategories.length === 0}
          options={[
            { value: "all", label: "All Subcategories" },
            ...availableSubcategories.map((subcat) => ({
              value: subcat,
              label: SUBCATEGORY_LABELS[subcat] || subcat,
            })),
          ]}
        />

        {/* Date Range Filter */}
        <RangePicker
          value={dateRange}
          onChange={(dates) =>
            onDateRangeChange(
              dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
            )
          }
          className="h-8.5 rounded-xl text-xs bg-gray-50/70"
          placeholder={["Start Date", "End Date"]}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={handleResetFilters}
            className="text-xs text-gray-500 hover:text-rose-600 rounded-lg"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </GlassCard>
  );
}
