import { Button } from "antd";
import {
  EditOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ApiPartner } from "@/redux/features/partners/partners.types";

interface PartnerDetailViewProps {
  partner: ApiPartner;
  onEditClick: () => void;
}

export function PartnerDetailView({
  partner,
  onEditClick,
}: PartnerDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Card 1: Overview & Mission */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-cloud-100">
            Organization Mission & Profile
          </h3>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={onEditClick}
            className="rounded-lg text-xs"
          >
            Edit
          </Button>
        </div>

        <div className="prose prose-sm max-w-none text-mist-700 leading-relaxed whitespace-pre-wrap">
          {partner.description ? (
            partner.description
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-xs text-mist-500">
              No descriptive text has been added for this partner yet.{" "}
              <button
                type="button"
                onClick={onEditClick}
                className="text-[#0B3D2E] font-semibold underline ml-1"
              >
                Add description now
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Card 2: Partnership Scope & Offers */}
      <GlassCard className="p-6">
        <div className="border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-cloud-100">
            Partnership Scope & Services
          </h3>
          <p className="text-xs text-mist-500">
            Collaborative capabilities, resource sharing, or sponsorship areas committed by this partner.
          </p>
        </div>

        {partner.offers && partner.offers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {partner.offers.map((offer, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-2xs"
              >
                <SafetyCertificateOutlined className="text-emerald-700 text-sm" />
                {offer}
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-xs text-mist-500">
            No offers or service categories are registered for this partner.
          </div>
        )}
      </GlassCard>

      {/* Card 3: Contact & Links */}
      <GlassCard className="p-6">
        <div className="border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-cloud-100">
            Contact Channels & Online Presence
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Website */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist-500 mb-1">
              <GlobalOutlined className="text-emerald-700" />
              Website
            </div>
            {partner.website ? (
              <a
                href={
                  partner.website.startsWith("http")
                    ? partner.website
                    : `https://${partner.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#0B3D2E] hover:underline break-all block"
              >
                {partner.website}
              </a>
            ) : (
              <span className="text-xs text-mist-400 italic">Not provided</span>
            )}
          </div>

          {/* Email */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist-500 mb-1">
              <MailOutlined className="text-emerald-700" />
              Contact Email
            </div>
            {partner.contactEmail ? (
              <a
                href={`mailto:${partner.contactEmail}`}
                className="text-xs font-semibold text-[#0B3D2E] hover:underline break-all block"
              >
                {partner.contactEmail}
              </a>
            ) : (
              <span className="text-xs text-mist-400 italic">Not provided</span>
            )}
          </div>

          {/* Phone */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mist-500 mb-1">
              <PhoneOutlined className="text-emerald-700" />
              Contact Phone
            </div>
            {partner.contactPhone ? (
              <a
                href={`tel:${partner.contactPhone}`}
                className="text-xs font-semibold text-[#0B3D2E] hover:underline break-all block"
              >
                {partner.contactPhone}
              </a>
            ) : (
              <span className="text-xs text-mist-400 italic">Not provided</span>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
