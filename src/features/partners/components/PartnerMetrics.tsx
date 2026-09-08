import {
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarFilled,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";

interface PartnerMetricsProps {
  metrics: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    featured: number;
  };
  statusFilter: string;
  featuredFilter: string;
  onSelectStatus: (status: string) => void;
  onSelectFeatured: (featured: string) => void;
}

export function PartnerMetrics({
  metrics,
  statusFilter,
  featuredFilter,
  onSelectStatus,
  onSelectFeatured,
}: PartnerMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {/* Total Partners */}
      <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-mist-500">Total Partners</span>
          <SafetyCertificateOutlined className="text-emerald-700" />
        </div>
        <div className="mt-2 text-2xl font-bold text-cloud-100">{metrics.total}</div>
        <span className="text-[11px] text-mist-500">All registered organizations</span>
      </div>

      {/* Pending Review */}
      <div
        onClick={() => onSelectStatus(PARTNER_STATUS.PENDING)}
        className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
          statusFilter === PARTNER_STATUS.PENDING
            ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-400"
            : "border-gray-100 bg-white/90 hover:border-amber-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800">Pending Review</span>
          <ClockCircleOutlined className="text-amber-600" />
        </div>
        <div className="mt-2 text-2xl font-bold text-amber-700 flex items-center gap-2">
          {metrics.pending}
          {metrics.pending > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </div>
        <span className="text-[11px] text-amber-700">Action needed</span>
      </div>

      {/* Approved */}
      <div
        onClick={() => onSelectStatus(PARTNER_STATUS.APPROVED)}
        className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
          statusFilter === PARTNER_STATUS.APPROVED
            ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500"
            : "border-gray-100 bg-white/90 hover:border-emerald-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800">Approved</span>
          <CheckCircleOutlined className="text-emerald-700" />
        </div>
        <div className="mt-2 text-2xl font-bold text-emerald-800">{metrics.approved}</div>
        <span className="text-[11px] text-emerald-700">Live on public website</span>
      </div>

      {/* Featured */}
      <div
        onClick={() => onSelectFeatured("FEATURED")}
        className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
          featuredFilter === "FEATURED"
            ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300"
            : "border-gray-100 bg-white/90 hover:border-amber-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800">Featured</span>
          <StarFilled className="text-amber-500" />
        </div>
        <div className="mt-2 text-2xl font-bold text-amber-800">{metrics.featured}</div>
        <span className="text-[11px] text-amber-700">In homepage carousel</span>
      </div>

      {/* Rejected */}
      <div
        onClick={() => onSelectStatus(PARTNER_STATUS.REJECTED)}
        className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
          statusFilter === PARTNER_STATUS.REJECTED
            ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-400"
            : "border-gray-100 bg-white/90 hover:border-rose-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-800">Rejected</span>
          <CloseCircleOutlined className="text-rose-600" />
        </div>
        <div className="mt-2 text-2xl font-bold text-rose-700">{metrics.rejected}</div>
        <span className="text-[11px] text-rose-600">Declined submissions</span>
      </div>
    </div>
  );
}
