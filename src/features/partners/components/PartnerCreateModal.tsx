import { useState, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Upload,
  Tag,
  Space,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  StarFilled,
  DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useCreatePartnerMutation } from "@/redux/features/partners/partnersApi";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";
import { buildPartnerFormData } from "@/redux/features/partners/buildPartnerFormData";
import { SUGGESTED_OFFERS, getErrorMessage } from "../partnerHelpers";

const { TextArea } = Input;

interface PartnerCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PartnerCreateModal({
  open,
  onClose,
  onSuccess,
}: PartnerCreateModalProps) {
  const [form] = Form.useForm();
  const [createPartner, { isLoading }] = useCreatePartnerMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [offers, setOffers] = useState<string[]>([
    "Co-marketing",
    "Community Outreach",
  ]);
  const [customOfferInput, setCustomOfferInput] = useState("");

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return false; // Prevent automatic antd upload
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleAddCustomOffer = () => {
    const trimmed = customOfferInput.trim();
    if (!trimmed) return;
    if (!offers.includes(trimmed)) {
      setOffers((prev) => [...prev, trimmed]);
    }
    setCustomOfferInput("");
  };

  const handleToggleSuggestedOffer = (offer: string) => {
    if (offers.includes(offer)) {
      setOffers((prev) => prev.filter((item) => item !== offer));
    } else {
      setOffers((prev) => [...prev, offer]);
    }
  };

  const handleRemoveOffer = (offerToRemove: string) => {
    setOffers((prev) => prev.filter((item) => item !== offerToRemove));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedFile) {
        toast.error("Organization Logo Required", {
          description: "Please upload an official partner logo or emblem.",
        });
        return;
      }

      const formData = buildPartnerFormData({
        name: values.name,
        description: values.description,
        website: values.website,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        status: values.status ?? PARTNER_STATUS.APPROVED,
        featured: values.featured ?? false,
        offers,
        image: selectedFile,
      });

      await createPartner(formData).unwrap();

      toast.success("Partner Created Successfully", {
        description: `${values.name} has been added to official partners.`,
      });

      form.resetFields();
      handleRemoveImage();
      setOffers(["Co-marketing", "Community Outreach"]);
      onSuccess?.();
      onClose();
    } catch (error) {
      if ((error as any)?.errorFields) return; // Antd validation error
      toast.error("Failed to create partner", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={680}
      title={
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#062118] text-white shadow-sm">
            <PlusOutlined className="text-lg" />
          </div>
          <div>
            <h3 className="text-base font-bold text-cloud-100">Add New Official Partner</h3>
            <p className="text-xs text-mist-500 font-normal">
              Directly onboard an organization, sponsor, or institutional ally.
            </p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: PARTNER_STATUS.APPROVED,
          featured: false,
        }}
        className="pt-2 space-y-4"
      >
        {/* Logo Upload Section */}
        <div>
          <label className="text-xs font-semibold text-mist-700 block mb-1.5">
            Partner Logo / Emblem <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-2 shadow-xs transition hover:border-[#0B3D2E]">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition hover:opacity-100 rounded-2xl"
                  >
                    <DeleteOutlined className="text-lg" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <UploadOutlined className="text-2xl text-mist-400" />
                  <span className="mt-1 block text-[10px] text-mist-500">
                    No logo
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <Upload
                beforeUpload={handleFileChange}
                showUploadList={false}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
              >
                <Button icon={<UploadOutlined />} className="rounded-xl">
                  {previewUrl ? "Change Logo" : "Upload Official Logo"}
                </Button>
              </Upload>
              <p className="text-xs text-mist-500 mt-1.5 leading-relaxed">
                PNG, WEBP, SVG, or JPG recommended (transparent background looks best on public carousels).
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Name & Website */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-mist-700">Organization Name</span>}
            rules={[{ required: true, message: "Please enter organization name" }]}
          >
            <Input
              placeholder="e.g. Hope for Haiti Foundation"
              className="rounded-xl h-10"
            />
          </Form.Item>

          <Form.Item
            name="website"
            label={<span className="text-xs font-semibold text-mist-700">Official Website</span>}
          >
            <Input
              prefix={<GlobalOutlined className="text-mist-400" />}
              placeholder="https://example.org"
              className="rounded-xl h-10"
            />
          </Form.Item>
        </div>

        {/* Row 2: Contact Email & Phone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="contactEmail"
            label={<span className="text-xs font-semibold text-mist-700">Contact Email</span>}
            rules={[{ type: "email", message: "Enter a valid email address" }]}
          >
            <Input
              prefix={<MailOutlined className="text-mist-400" />}
              placeholder="contact@example.org"
              className="rounded-xl h-10"
            />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label={<span className="text-xs font-semibold text-mist-700">Contact Phone</span>}
          >
            <Input
              prefix={<PhoneOutlined className="text-mist-400" />}
              placeholder="+1 (555) 019-2834"
              className="rounded-xl h-10"
            />
          </Form.Item>
        </div>

        {/* Row 3: Initial Status & Featured */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl bg-gray-50/70 p-4 border border-gray-100">
          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold text-mist-700">Initial Status</span>}
            className="mb-0"
          >
            <Select
              className="h-10 w-full"
              options={[
                { label: "Approved (Active Immediately)", value: PARTNER_STATUS.APPROVED },
                { label: "Pending (Draft / In Review)", value: PARTNER_STATUS.PENDING },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="featured"
            valuePropName="checked"
            label={<span className="text-xs font-semibold text-mist-700">Promote as Featured</span>}
            className="mb-0"
          >
            <div className="flex items-center gap-2.5 pt-1">
              <Switch />
              <span className="text-xs text-mist-600 flex items-center gap-1">
                <StarFilled className="text-amber-500" />
                Highlight on homepage carousel
              </span>
            </div>
          </Form.Item>
        </div>

        {/* Description */}
        <Form.Item
          name="description"
          label={<span className="text-xs font-semibold text-mist-700">Organization Overview & Mission</span>}
        >
          <TextArea
            rows={3}
            placeholder="Describe the organization's mission, relationship with IFundAyiti, or partnership scope..."
            className="rounded-xl text-xs"
          />
        </Form.Item>

        {/* Offers / Services Tag Manager */}
        <div>
          <label className="text-xs font-semibold text-mist-700 block mb-1">
            Partnership Scope & Offers
          </label>
          <p className="text-xs text-mist-500 mb-2">
            Select standard categories or add custom areas of collaboration:
          </p>

          {/* Active Offers Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 rounded-xl border border-gray-100 bg-gray-50/50 min-h-10 items-center">
            {offers.length === 0 && (
              <span className="text-xs text-mist-400 italic">No offers added yet</span>
            )}
            {offers.map((offer) => (
              <Tag
                key={offer}
                closable
                onClose={() => handleRemoveOffer(offer)}
                className="rounded-lg bg-emerald-50 text-emerald-800 border-emerald-200 px-2 py-0.5 text-xs font-medium"
              >
                {offer}
              </Tag>
            ))}
          </div>

          {/* Suggested Quick Select */}
          <div className="flex flex-wrap items-center gap-1 mb-2">
            <span className="text-[11px] font-semibold text-mist-500 mr-1">Quick Add:</span>
            {SUGGESTED_OFFERS.map((sug) => {
              const isSelected = offers.includes(sug);
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleToggleSuggestedOffer(sug)}
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
              placeholder="Add custom offer (e.g. Medical Supplies, Solar Equipment)"
              value={customOfferInput}
              onChange={(e) => setCustomOfferInput(e.target.value)}
              onPressEnter={(e) => {
                e.preventDefault();
                handleAddCustomOffer();
              }}
              className="rounded-l-lg text-xs"
            />
            <Button
              size="small"
              onClick={handleAddCustomOffer}
              className="rounded-r-lg text-xs"
            >
              Add
            </Button>
          </Space.Compact>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button onClick={onClose} disabled={isLoading} className="rounded-xl h-9">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isLoading}
            className="rounded-xl h-9 px-6 bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm"
          >
            Create Partner
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
