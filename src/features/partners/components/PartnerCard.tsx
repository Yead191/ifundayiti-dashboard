import { useNavigate } from "react-router-dom";
import { Button, Tooltip, Popconfirm } from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  StarFilled,
  StarOutlined,
  DeleteOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type {
  ApiPartner,
  PartnerUser,
} from "@/redux/features/partners/partners.types";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";
import { getPartnerStatusConfig } from "../partnerHelpers";

interface PartnerCardProps {
  partner: ApiPartner;
  onToggleFeatured: (partner: ApiPartner, e: React.MouseEvent) => void;
  onQuickApprove: (partner: ApiPartner, e: React.MouseEvent) => void;
  onOpenStatusModal: (partner: ApiPartner) => void;
  onDelete: (partner: ApiPartner) => void;
}

export function PartnerCard({
  partner,
  onToggleFeatured,
  onQuickApprove,
  onOpenStatusModal,
  onDelete,
}: PartnerCardProps) {
  const navigate = useNavigate();
  const statusConfig = getPartnerStatusConfig(partner.status);
  const userObj =
    typeof partner.user === "object" && partner.user !== null
      ? (partner.user as PartnerUser)
      : null;
  const logoUrl = toFileUrl(partner.image);

  return (
    <GlassCard className="flex flex-col justify-between p-5 transition-all duration-200 hover:shadow-md hover:border-emerald-700/30 group">
      <div>
        {/* Card Header: Logo, Name, Featured toggle */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-start gap-3 min-w-0">
            {/* Logo Preview */}
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-2xs">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={partner.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <SafetyCertificateOutlined className="text-2xl text-emerald-800" />
              )}
            </div>

            {/* Name & Origin */}
            <div className="min-w-0 flex-1">
              <h3
                onClick={() => navigate(`/partners/${partner._id}`)}
                className="font-bold text-base text-cloud-100 truncate cursor-pointer hover:text-[#0B3D2E] transition-colors"
              >
                {partner.name}
              </h3>

              {userObj ? (
                <span className="flex items-center gap-1 text-[11px] text-mist-500 truncate mt-0.5">
                  <UserOutlined className="text-[10px]" />
                  By {userObj.name}
                </span>
              ) : (
                <span className="text-[11px] text-mist-500 mt-0.5 block">
                  Direct Admin Onboard
                </span>
              )}
            </div>
          </div>

          {/* Featured star toggle */}
          <Tooltip
            title={
              partner.featured
                ? "Featured on homepage. Click to unfeature."
                : "Click to feature on homepage."
            }
          >
            <button
              type="button"
              onClick={(e) => onToggleFeatured(partner, e)}
              className={`p-1.5 rounded-xl border transition-all ${
                partner.featured
                  ? "bg-amber-50 border-amber-300 text-amber-500 hover:bg-amber-100"
                  : "bg-gray-50 border-gray-200 text-mist-400 hover:text-amber-500 hover:bg-white"
              }`}
            >
              {partner.featured ? (
                <StarFilled className="text-base text-amber-500" />
              ) : (
                <StarOutlined className="text-base" />
              )}
            </button>
          </Tooltip>
        </div>

        {/* Status Pill & Rejection warning */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            style={{
              backgroundColor: statusConfig.bgHex,
              color: statusConfig.colorHex,
              borderColor: statusConfig.borderHex,
            }}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
          >
            {partner.status === PARTNER_STATUS.APPROVED && (
              <CheckCircleOutlined />
            )}
            {partner.status === PARTNER_STATUS.PENDING && (
              <ClockCircleOutlined />
            )}
            {partner.status === PARTNER_STATUS.REJECTED && (
              <CloseCircleOutlined />
            )}
            {statusConfig.label}
          </span>

          {partner.website && (
            <a
              href={
                partner.website.startsWith("http")
                  ? partner.website
                  : `https://${partner.website}`
              }
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] text-[#0B3D2E] hover:underline"
            >
              <GlobalOutlined />
              Website
            </a>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-mist-600 line-clamp-2 mb-3 min-h-8 leading-relaxed">
          {partner.description || "No description provided."}
        </p>

        {/* Offers Chips */}
        {partner.offers && partner.offers.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {partner.offers.slice(0, 3).map((offer, i) => (
              <span
                key={i}
                className="rounded-md bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 border border-emerald-200/80"
              >
                {offer}
              </span>
            ))}
            {partner.offers.length > 3 && (
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-mist-600">
                +{partner.offers.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
        <div className="flex items-center gap-1.5">
          {/* Quick review trigger */}
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenStatusModal(partner);
            }}
            className="rounded-lg text-xs"
          >
            Status…
          </Button>

          {/* Quick approve if pending */}
          {partner.status === PARTNER_STATUS.PENDING && (
            <Button
              size="small"
              type="primary"
              onClick={(e) => onQuickApprove(partner, e)}
              className="rounded-lg text-xs bg-[#0B3D2E]! hover:bg-[#082e23]! text-white!"
            >
              Approve
            </Button>
          )}

          {/* Delete button */}
          <Popconfirm
            title="Delete partner?"
            description={`Remove "${partner.name}"?`}
            onConfirm={() => onDelete(partner)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="rounded-lg text-xs"
            />
          </Popconfirm>
        </div>

        {/* Details link */}
        <Button
          type="link"
          onClick={() => navigate(`/partners/${partner._id}`)}
          className="flex items-center gap-1 text-xs font-semibold text-[#0B3D2E] p-0 hover:underline"
        >
          View Details
          <ArrowRightOutlined className="text-[10px]" />
        </Button>
      </div>
    </GlassCard>
  );
}
