import { Button, Image, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  GlobalOutlined,
  StarFilled,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDateTime } from "@/lib/utils";
import type { ApiPartner } from "@/redux/features/partners/partners.types";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";
import { getPartnerStatusConfig } from "../partnerHelpers";

interface PartnerDetailHeaderProps {
  partner: ApiPartner;
  logoSrc?: string;
  isEditing: boolean;
  isUpdating: boolean;
  isChangingStatus: boolean;
  isDeleting: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
  onSaveEdits: () => void;
  onQuickApprove: () => void;
  onOpenStatusModal: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
}

export function PartnerDetailHeader({
  partner,
  logoSrc,
  isEditing,
  isUpdating,
  isChangingStatus,
  isDeleting,
  onEditClick,
  onCancelEdit,
  onSaveEdits,
  onQuickApprove,
  onOpenStatusModal,
  onToggleFeatured,
  onDelete,
}: PartnerDetailHeaderProps) {
  const statusConfig = getPartnerStatusConfig(partner.status);

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          {/* Large Logo */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm ring-1 ring-gray-100">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={partner.name}
                className="h-full w-full object-contain"
                preview={{ mask: "Zoom" }}
              />
            ) : (
              <SafetyCertificateOutlined className="text-3xl text-emerald-800" />
            )}
          </div>

          {/* Title & Status Bar */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Official Partner Profile
              </span>
              <span className="text-mist-400">/</span>
              {/* Status Pill */}
              <span
                style={{
                  backgroundColor: statusConfig.bgHex,
                  color: statusConfig.colorHex,
                  borderColor: statusConfig.borderHex,
                }}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
              >
                {partner.status === PARTNER_STATUS.APPROVED && <CheckCircleOutlined />}
                {partner.status === PARTNER_STATUS.PENDING && <ClockCircleOutlined />}
                {partner.status === PARTNER_STATUS.REJECTED && <CloseCircleOutlined />}
                {statusConfig.label}
              </span>

              {/* Featured Star Badge */}
              {partner.featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <StarFilled className="text-amber-500" />
                  Featured Partner
                </span>
              )}
            </div>

            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-cloud-100">
              {partner.name}
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-mist-500">
              <span className="flex items-center gap-1">
                <CalendarOutlined className="text-[11px]" />
                Submitted: {partner.createdAt ? formatDateTime(partner.createdAt) : "—"}
              </span>
              {partner.updatedAt && (
                <>
                  <span>·</span>
                  <span>Updated: {formatDateTime(partner.updatedAt)}</span>
                </>
              )}
              {partner.website && (
                <>
                  <span>·</span>
                  <a
                    href={
                      partner.website.startsWith("http")
                        ? partner.website
                        : `https://${partner.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#0B3D2E] hover:underline font-medium"
                  >
                    <GlobalOutlined />
                    {partner.website.replace(/^https?:\/\//, "")}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isEditing ? (
            <>
              <Button
                onClick={onCancelEdit}
                disabled={isUpdating}
                className="h-10 rounded-xl"
                icon={<CloseOutlined />}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={onSaveEdits}
                loading={isUpdating}
                icon={<SaveOutlined />}
                className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium px-5 shadow-sm"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {/* Quick 1-click Approve if pending */}
              {partner.status === PARTNER_STATUS.PENDING && (
                <Button
                  type="primary"
                  onClick={onQuickApprove}
                  loading={isChangingStatus}
                  icon={<CheckCircleOutlined />}
                  className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm"
                >
                  Approve Partner
                </Button>
              )}

              {/* Status Decision Trigger */}
              <Button
                onClick={onOpenStatusModal}
                className="h-10 rounded-xl font-medium"
              >
                Change Status
              </Button>

              {/* Featured Toggle Button */}
              <Button
                onClick={onToggleFeatured}
                icon={
                  partner.featured ? (
                    <StarFilled className="text-amber-500" />
                  ) : (
                    <StarOutlined />
                  )
                }
                className="h-10 rounded-xl font-medium"
              >
                {partner.featured ? "Unfeature" : "Feature"}
              </Button>

              {/* Edit Button */}
              <Button
                onClick={onEditClick}
                icon={<EditOutlined />}
                className="h-10 rounded-xl font-medium hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
              >
                Edit Partner
              </Button>

              {/* Delete Popconfirm */}
              <Popconfirm
                title="Delete this partner?"
                description={`Are you sure you want to permanently remove "${partner.name}"? This action cannot be undone.`}
                onConfirm={onDelete}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: isDeleting }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  className="h-10 rounded-xl font-medium"
                >
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
