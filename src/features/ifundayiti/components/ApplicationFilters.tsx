import { Input, Select, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import type { ApplicationPeriod } from "../types";

const { RangePicker } = DatePicker;

export interface AmountRange {
  min: number;
  max: number;
}

export interface ApplicationFilterValues {
  search: string;
  periodId: string;
  amountKey: string;
  dateRange: [Dayjs, Dayjs] | null;
}

export const AMOUNT_RANGES: { key: string; label: string; range: AmountRange | null }[] = [
  { key: "all", label: "Any amount", range: null },
  { key: "0-250", label: "$0 – $250", range: { min: 0, max: 250 } },
  { key: "251-500", label: "$251 – $500", range: { min: 251, max: 500 } },
  { key: "501-750", label: "$501 – $750", range: { min: 501, max: 750 } },
  { key: "751-1000", label: "$751 – $1000", range: { min: 751, max: 1000 } },
];

export const DEFAULT_FILTERS: ApplicationFilterValues = {
  search: "",
  periodId: "all",
  amountKey: "all",
  dateRange: null,
};

/** Search + period + amount + submission-date filter bar for applications. */
export function ApplicationFilters({
  value,
  periods,
  onChange,
}: {
  value: ApplicationFilterValues;
  periods: ApplicationPeriod[];
  onChange: (next: ApplicationFilterValues) => void;
}) {
  const set = <K extends keyof ApplicationFilterValues>(key: K, val: ApplicationFilterValues[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      <Input
        allowClear
        prefix={<SearchOutlined className="text-mist-600" />}
        placeholder="Search name, project, tracking ID…"
        value={value.search}
        onChange={(e) => set("search", e.target.value)}
      />
      <Select
        value={value.periodId}
        onChange={(v) => set("periodId", v)}
        options={[
          { label: "All periods", value: "all" },
          ...periods.map((p) => ({ label: p.title, value: p.id })),
        ]}
      />
      <Select
        value={value.amountKey}
        onChange={(v) => set("amountKey", v)}
        options={AMOUNT_RANGES.map((r) => ({ label: r.label, value: r.key }))}
      />
      <RangePicker
        className="!w-full"
        value={value.dateRange}
        onChange={(range) => set("dateRange", (range as [Dayjs, Dayjs] | null) ?? null)}
        placeholder={["From", "To"]}
      />
    </div>
  );
}
