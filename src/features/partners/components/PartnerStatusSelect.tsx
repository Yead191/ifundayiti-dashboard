import { Select } from "antd";
import {
  PARTNER_STATUS_OPTIONS,
  type PartnerStatus,
} from "@/redux/features/partners/partners.types";
import { partnerStatusLabelMap } from "../statusMaps";

export function PartnerStatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: PartnerStatus;
  onChange: (status: PartnerStatus) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value}
      disabled={disabled}
      className="min-w-32!"
      options={PARTNER_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: partnerStatusLabelMap[status],
      }))}
      onChange={onChange}
    />
  );
}
