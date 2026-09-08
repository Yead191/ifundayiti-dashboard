import { Button, Input, Switch, Upload, Tag, Space } from "antd";
import {
  UploadOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import type { ApiPartner } from "@/redux/features/partners/partners.types";
import { SUGGESTED_OFFERS } from "../partnerHelpers";

const { TextArea } = Input;

interface PartnerDetailEditFormProps {
  partner: ApiPartner;
  isUpdating: boolean;
  name: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  featured: boolean;
  offers: string[];
  customOfferInput: string;
  newImageFile: File | null;
  newImagePreview: string | null;
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onWebsiteChange: (val: string) => void;
  onContactEmailChange: (val: string) => void;
  onContactPhoneChange: (val: string) => void;
  onFeaturedChange: (val: boolean) => void;
  onCustomOfferInputChange: (val: string) => void;
  onAddCustomOffer: () => void;
  onToggleSuggestedOffer: (offer: string) => void;
  onRemoveOffer: (offer: string) => void;
  onImageChange: (file: File) => boolean;
  onRemoveNewImage: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function PartnerDetailEditForm({
  partner,
  isUpdating,
  name,
  description,
  website,
  contactEmail,
  contactPhone,
  featured,
  offers,
  customOfferInput,
  newImageFile,
  newImagePreview,
  onNameChange,
  onDescriptionChange,
  onWebsiteChange,
  onContactEmailChange,
  onContactPhoneChange,
  onFeaturedChange,
  onCustomOfferInputChange,
  onAddCustomOffer,
  onToggleSuggestedOffer,
  onRemoveOffer,
  onImageChange,
  onRemoveNewImage,
  onCancel,
  onSave,
}: PartnerDetailEditFormProps) {
  return (
    <GlassCard className="p-6 space-y-5">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-cloud-100">
          Edit Partner Information
        </h3>
        <p className="text-xs text-mist-500">
          Update organization details, logo image, scope of partnership, and contact channels.
        </p>
      </div>

      {/* Logo Replacement */}
      <div>
        <label className="text-xs font-semibold text-mist-700 block mb-2">
          Partner Logo
        </label>
        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-xs">
            {newImagePreview ? (
              <img
                src={newImagePreview}
                alt="New preview"
                className="h-full w-full object-contain"
              />
            ) : partner.image ? (
              <img
                src={toFileUrl(partner.image)}
                alt="Current logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <SafetyCertificateOutlined className="text-2xl text-mist-400" />
            )}
          </div>
          <div>
            <Upload
              beforeUpload={onImageChange}
              showUploadList={false}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
            >
              <Button icon={<UploadOutlined />} className="rounded-xl">
                {newImageFile ? "Change File" : "Replace Logo File"}
              </Button>
            </Upload>
            {newImageFile && (
              <Button
                type="link"
                danger
                onClick={onRemoveNewImage}
                className="p-0 text-xs ml-3"
              >
                Revert to original
              </Button>
            )}
            <p className="text-[11px] text-mist-500 mt-1">
              SVG, PNG, or WEBP with transparent background recommended.
            </p>
          </div>
        </div>
      </div>

      {/* Name & Website */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-mist-700 block mb-1">
            Organization Name <span className="text-rose-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Organization Name"
            className="rounded-xl h-10"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-mist-700 block mb-1">
            Official Website
          </label>
          <Input
            prefix={<GlobalOutlined className="text-mist-400" />}
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            placeholder="https://example.org"
            className="rounded-xl h-10"
          />
        </div>
      </div>

      {/* Contact Email & Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-mist-700 block mb-1">
            Contact Email
          </label>
          <Input
            prefix={<MailOutlined className="text-mist-400" />}
            value={contactEmail}
            onChange={(e) => onContactEmailChange(e.target.value)}
            placeholder="contact@example.org"
            className="rounded-xl h-10"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-mist-700 block mb-1">
            Contact Phone
          </label>
          <Input
            prefix={<PhoneOutlined className="text-mist-400" />}
            value={contactPhone}
            onChange={(e) => onContactPhoneChange(e.target.value)}
            placeholder="+1 (555) 019-2834"
            className="rounded-xl h-10"
          />
        </div>
      </div>

      {/* Featured Switch */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50/70 p-3.5 border border-gray-100">
        <div>
          <span className="text-xs font-semibold text-mist-700 block">
            Featured Placement
          </span>
          <span className="text-xs text-mist-500">
            Display prominently on the public homepage logo carousel
          </span>
        </div>
        <Switch
          checked={featured}
          onChange={onFeaturedChange}
          className="bg-gray-300"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-mist-700 block mb-1">
          Organization Overview & Description
        </label>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Provide details about the partner's background, collaboration history, or active initiatives..."
          className="rounded-xl text-xs"
        />
      </div>

      {/* Offers Management */}
      <div>
        <label className="text-xs font-semibold text-mist-700 block mb-1">
          Partnership Scope & Services Offered
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 rounded-xl border border-gray-100 bg-gray-50/50 min-h-10 items-center">
          {offers.length === 0 && (
            <span className="text-xs text-mist-400 italic">
              No offers configured yet
            </span>
          )}
          {offers.map((offer) => (
            <Tag
              key={offer}
              closable
              onClose={() => onRemoveOffer(offer)}
              className="rounded-lg bg-emerald-50 text-emerald-800 border-emerald-200 px-2 py-0.5 text-xs font-medium"
            >
              {offer}
            </Tag>
          ))}
        </div>

        {/* Suggested Quick Select */}
        <div className="flex flex-wrap items-center gap-1 mb-2">
          <span className="text-[11px] font-semibold text-mist-500 mr-1">
            Quick Add:
          </span>
          {SUGGESTED_OFFERS.map((sug) => {
            const isSelected = offers.includes(sug);
            return (
              <button
                key={sug}
                type="button"
                onClick={() => onToggleSuggestedOffer(sug)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                  isSelected
                    ? "bg-[#0B3D2E] text-white border-[#0B3D2E]"
                    : "bg-white text-mist-600 border-gray-200 hover:border-emerald-700"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {sug}
              </button>
            );
          })}
        </div>

        {/* Custom Offer Input */}
        <Space.Compact className="w-full">
          <Input
            size="small"
            placeholder="Add custom scope (e.g. Scholarship Matching, Warehouse Space)"
            value={customOfferInput}
            onChange={(e) => onCustomOfferInputChange(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault();
              onAddCustomOffer();
            }}
            className="rounded-l-lg text-xs"
          />
          <Button
            size="small"
            onClick={onAddCustomOffer}
            className="rounded-r-lg text-xs"
          >
            Add
          </Button>
        </Space.Compact>
      </div>

      {/* Bottom Action buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
        <Button
          onClick={onCancel}
          disabled={isUpdating}
          className="rounded-xl h-10"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={onSave}
          loading={isUpdating}
          icon={<SaveOutlined />}
          className="rounded-xl h-10 px-6 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm"
        >
          Save Modifications
        </Button>
      </div>
    </GlassCard>
  );
}
