import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Skeleton, Button } from "antd";
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { toFileUrl } from "@/config";
import {
  useGetPartnerQuery,
  useUpdatePartnerMutation,
  useChangePartnerStatusMutation,
  useDeletePartnerMutation,
} from "@/redux/features/partners/partnersApi";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";
import { buildPartnerUpdateFormData } from "@/redux/features/partners/buildPartnerFormData";
import { getErrorMessage } from "./partnerHelpers";
import { PartnerDetailHeader } from "./components/PartnerDetailHeader";
import { PartnerDetailView } from "./components/PartnerDetailView";
import { PartnerDetailEditForm } from "./components/PartnerDetailEditForm";
import { PartnerDetailSidebar } from "./components/PartnerDetailSidebar";
import { PartnerStatusModal } from "./components/PartnerStatusModal";

export default function PartnerDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: partnerResponse, isLoading, isError } = useGetPartnerQuery(id, {
    skip: !id,
  });
  const [updatePartner, { isLoading: isUpdating }] = useUpdatePartnerMutation();
  const [changePartnerStatus, { isLoading: isChangingStatus }] =
    useChangePartnerStatusMutation();
  const [deletePartner, { isLoading: isDeleting }] = useDeletePartnerMutation();

  const partner = partnerResponse?.data;

  // View vs Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Editable Form Fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editOffers, setEditOffers] = useState<string[]>([]);
  const [customOfferInput, setCustomOfferInput] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  // Synchronize state when partner data changes
  useEffect(() => {
    if (partner) {
      setEditName(partner.name || "");
      setEditDescription(partner.description || "");
      setEditWebsite(partner.website || "");
      setEditContactEmail(partner.contactEmail || "");
      setEditContactPhone(partner.contactPhone || "");
      setEditFeatured(Boolean(partner.featured));
      setEditOffers(partner.offers || []);
      setNewImageFile(null);
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
        setNewImagePreview(null);
      }
    }
  }, [partner]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 1 }} className="max-w-xs" />
        <GlassCard>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton.Node active className="h-64! w-full! rounded-2xl! col-span-1" />
            <div className="space-y-4 col-span-2">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (isError || !partner) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<SafetyCertificateOutlined className="text-5xl text-mist-400" />}
          title="Partner Not Found"
          description="The requested partner could not be found or may have been deleted."
          actionLabel="Back to Partners"
          onAction={() => navigate("/partners")}
        />
      </div>
    );
  }

  // Image Upload Handlers
  const handleImageChange = (file: File) => {
    setNewImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setNewImagePreview(objectUrl);
    return false;
  };

  const handleRemoveNewImage = () => {
    setNewImageFile(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(null);
    }
  };

  // Offers Handlers
  const handleAddCustomOffer = () => {
    const trimmed = customOfferInput.trim();
    if (!trimmed) return;
    if (!editOffers.includes(trimmed)) {
      setEditOffers((prev) => [...prev, trimmed]);
    }
    setCustomOfferInput("");
  };

  const handleToggleSuggestedOffer = (offer: string) => {
    if (editOffers.includes(offer)) {
      setEditOffers((prev) => prev.filter((item) => item !== offer));
    } else {
      setEditOffers((prev) => [...prev, offer]);
    }
  };

  const handleRemoveOffer = (offerToRemove: string) => {
    setEditOffers((prev) => prev.filter((item) => item !== offerToRemove));
  };

  // Status & Feature Actions
  const handleQuickApprove = async () => {
    try {
      await changePartnerStatus({
        id: partner._id,
        status: PARTNER_STATUS.APPROVED,
      }).unwrap();
      toast.success("Partner Approved", {
        description: `${partner.name} is now approved and live on public storefront.`,
      });
    } catch (error) {
      toast.error("Failed to approve partner", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleToggleFeatured = async () => {
    try {
      const nextFeatured = !partner.featured;
      const formData = buildPartnerUpdateFormData({ featured: nextFeatured });
      await updatePartner({ id: partner._id, body: formData }).unwrap();
      toast.success(
        nextFeatured ? "Added to Featured Partners" : "Removed from Featured Partners",
        {
          description: nextFeatured
            ? `${partner.name} will now appear in high-priority carousels.`
            : `${partner.name} was unstarred from featured placements.`,
        }
      );
    } catch (error) {
      toast.error("Failed to toggle featured status", {
        description: getErrorMessage(error),
      });
    }
  };

  // Save Edits
  const handleSaveEdits = async () => {
    if (!editName.trim()) {
      toast.error("Organization Name Required", {
        description: "Please provide a name for this partner.",
      });
      return;
    }

    try {
      const formData = buildPartnerUpdateFormData({
        name: editName,
        description: editDescription,
        website: editWebsite,
        contactEmail: editContactEmail,
        contactPhone: editContactPhone,
        featured: editFeatured,
        offers: editOffers,
        image: newImageFile,
      });

      await updatePartner({ id: partner._id, body: formData }).unwrap();

      toast.success("Partner Details Saved", {
        description: `Modifications to ${editName} were successfully updated.`,
      });

      setIsEditing(false);
      handleRemoveNewImage();
    } catch (error) {
      toast.error("Failed to save modifications", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (partner) {
      setEditName(partner.name || "");
      setEditDescription(partner.description || "");
      setEditWebsite(partner.website || "");
      setEditContactEmail(partner.contactEmail || "");
      setEditContactPhone(partner.contactPhone || "");
      setEditFeatured(Boolean(partner.featured));
      setEditOffers(partner.offers || []);
    }
    handleRemoveNewImage();
  };

  // Delete Partner
  const handleDelete = async () => {
    try {
      await deletePartner(partner._id).unwrap();
      toast.success("Partner Deleted", {
        description: `${partner.name} was permanently removed.`,
      });
      navigate("/partners");
    } catch (error) {
      toast.error("Failed to delete partner", {
        description: getErrorMessage(error),
      });
    }
  };

  const logoSrc = newImagePreview || toFileUrl(partner.image);

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <Link
          to="/partners"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist-500 transition hover:text-[#0B3D2E]"
        >
          <ArrowLeftOutlined />
          <span>Back to Partner Management</span>
        </Link>
      </div>

      {/* Top Banner Header */}
      <PartnerDetailHeader
        partner={partner}
        logoSrc={logoSrc}
        isEditing={isEditing}
        isUpdating={isUpdating}
        isChangingStatus={isChangingStatus}
        isDeleting={isDeleting}
        onEditClick={() => setIsEditing(true)}
        onCancelEdit={handleCancelEdit}
        onSaveEdits={handleSaveEdits}
        onQuickApprove={handleQuickApprove}
        onOpenStatusModal={() => setStatusModalOpen(true)}
        onToggleFeatured={handleToggleFeatured}
        onDelete={handleDelete}
      />

      {/* Rejection Feedback Callout (if rejected) */}
      {partner.status === PARTNER_STATUS.REJECTED && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <CloseCircleOutlined className="text-xl text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-rose-900 text-sm">
                  Application Declined / Rejected
                </h4>
                <Button
                  size="small"
                  onClick={() => setStatusModalOpen(true)}
                  className="rounded-lg text-xs"
                >
                  Re-evaluate Decision
                </Button>
              </div>
              <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                {partner.rejectionReason ||
                  "No written explanation was provided when declining this application."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Edit Form or Read View */}
        <div className="space-y-6 lg:col-span-2">
          {isEditing ? (
            <PartnerDetailEditForm
              partner={partner}
              isUpdating={isUpdating}
              name={editName}
              description={editDescription}
              website={editWebsite}
              contactEmail={editContactEmail}
              contactPhone={editContactPhone}
              featured={editFeatured}
              offers={editOffers}
              customOfferInput={customOfferInput}
              newImageFile={newImageFile}
              newImagePreview={newImagePreview}
              onNameChange={setEditName}
              onDescriptionChange={setEditDescription}
              onWebsiteChange={setEditWebsite}
              onContactEmailChange={setEditContactEmail}
              onContactPhoneChange={setEditContactPhone}
              onFeaturedChange={setEditFeatured}
              onCustomOfferInputChange={setCustomOfferInput}
              onAddCustomOffer={handleAddCustomOffer}
              onToggleSuggestedOffer={handleToggleSuggestedOffer}
              onRemoveOffer={handleRemoveOffer}
              onImageChange={handleImageChange}
              onRemoveNewImage={handleRemoveNewImage}
              onCancel={handleCancelEdit}
              onSave={handleSaveEdits}
            />
          ) : (
            <PartnerDetailView
              partner={partner}
              onEditClick={() => setIsEditing(true)}
            />
          )}
        </div>

        {/* Right Column: Status Governance & Application Origin */}
        <div>
          <PartnerDetailSidebar
            partner={partner}
            isChangingStatus={isChangingStatus}
            onOpenStatusModal={() => setStatusModalOpen(true)}
            onQuickApprove={handleQuickApprove}
            onToggleFeatured={handleToggleFeatured}
          />
        </div>
      </div>

      {/* Status Review Modal */}
      <PartnerStatusModal
        open={statusModalOpen}
        partner={partner}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
}
