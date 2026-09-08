import { Button, Switch } from "antd";
import { CheckCircleOutlined, UserOutlined } from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type { ApiPartner, PartnerUser } from "@/redux/features/partners/partners.types";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";
import { getPartnerStatusConfig } from "../partnerHelpers";

interface PartnerDetailSidebarProps {
  partner: ApiPartner;
  isChangingStatus: boolean;
  onOpenStatusModal: () => void;
  onQuickApprove: () => void;
  onToggleFeatured: () => void;
}

export function PartnerDetailSidebar({
  partner,
  isChangingStatus,
  onOpenStatusModal,
  onQuickApprove,
  onToggleFeatured,
}: PartnerDetailSidebarProps) {
  const statusConfig = getPartnerStatusConfig(partner.status);
  const userObj =
    typeof partner.user === "object" && partner.user !== null
      ? (partner.user as PartnerUser)
      : null;

  return (
    <div className="space-y-6">
      {/* Card 1: Review & Governance */}
      <GlassCard className="p-6">
        <div className="border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-cloud-100">
            Status & Governance
          </h3>
          <p className="text-xs text-mist-500">
            Partner lifecycle controls and visibility states.
          </p>
        </div>

        <div className="space-y-4">
          {/* Current Status Badge with description */}
          <div
            style={{
              backgroundColor: statusConfig.bgHex,
              borderColor: statusConfig.borderHex,
            }}
            className="rounded-2xl border p-4 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-mist-600">
                Lifecycle State
              </span>
              <span
                style={{ color: statusConfig.colorHex }}
                className="font-bold text-xs"
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-mist-600 leading-relaxed">
              {statusConfig.description}
            </p>
          </div>

          {/* Status Action Buttons */}
          <div className="space-y-2">
            <Button
              block
              onClick={onOpenStatusModal}
              className="rounded-xl h-10 font-medium"
            >
              Review or Transition Status…
            </Button>

            {partner.status !== PARTNER_STATUS.APPROVED && (
              <Button
                block
                type="primary"
                onClick={onQuickApprove}
                loading={isChangingStatus}
                icon={<CheckCircleOutlined />}
                className="rounded-xl h-10 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm"
              >
                Approve Partner Now
              </Button>
            )}
          </div>

          {/* Featured toggle card */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50/80 p-3 border border-gray-100">
            <div>
              <span className="text-xs font-semibold text-cloud-100 block">
                Featured Partner
              </span>
              <span className="text-[11px] text-mist-500">
                Shown in homepage carousel
              </span>
            </div>
            <Switch
              checked={partner.featured}
              onChange={onToggleFeatured}
              className="bg-gray-300"
            />
          </div>
        </div>
      </GlassCard>

      {/* Card 2: Applicant Information */}
      <GlassCard className="p-6">
        <div className="border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-cloud-100">
            Application Origin
          </h3>
        </div>

        {userObj ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold overflow-hidden">
                {userObj.image ? (
                  <img
                    src={toFileUrl(userObj.image)}
                    alt={userObj.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserOutlined className="text-lg" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-cloud-100 block">
                  {userObj.name}
                </span>
                <span className="text-xs text-mist-500 block">
                  {userObj.email}
                </span>
                {userObj.phone && (
                  <span className="text-xs text-mist-500 block">
                    {userObj.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-100 text-xs text-emerald-900">
              <span className="font-semibold block">
                Community Submission
              </span>
              <span className="text-[11px] text-emerald-800 leading-normal">
                Submitted through the public partner application form (`/partner/apply`).
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100 text-xs text-mist-600">
            <span className="font-semibold text-cloud-100 block">
              Direct Admin Creation
            </span>
            <span className="text-[11px] text-mist-500 mt-0.5 block leading-relaxed">
              This partner was directly created and onboarded from the Admin Dashboard.
            </span>
          </div>
        )}
      </GlassCard>

      {/* Card 3: System & Public Sync Info */}
      <GlassCard className="p-6">
        <div className="border-b border-gray-100 pb-3 mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-mist-500">
            API Identifier & Public Link
          </h4>
        </div>

        <div className="space-y-3 text-xs text-mist-600">
          <div>
            <span className="text-mist-500 block text-[11px] mb-1">
              Database Record ID
            </span>
            <code className="block rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-[11px] text-cloud-100 select-all border border-gray-200/70">
              {partner._id}
            </code>
          </div>

          <div>
            <span className="text-mist-500 block text-[11px] mb-1">
              Public Website Profile Route
            </span>
            <code className="block rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-[11px] text-cloud-100 border border-gray-200/70">
              /partners/{partner._id}
            </code>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
