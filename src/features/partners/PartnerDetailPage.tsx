import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar, Button, Skeleton, Tag } from "antd";
import {
  ArrowLeftOutlined,
  ApartmentOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  StarFilled,
  UserOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useChangePartnerStatusMutation,
  useCreatePartnerMutation,
  useDeletePartnerMutation,
  useGetPartnerQuery,
  useUpdatePartnerMutation,
} from "@/redux/features/partners/partnersApi";
import { savePartner } from "./savePartner";
import {
  PARTNER_STATUS,
  type ApiPartner,
  type PartnerFormPayload,
  type PartnerStatus,
} from "@/redux/features/partners/partners.types";
import {
  normalizePartnerStatus,
  partnerStatusLabelMap,
  partnerStatusToneMap,
} from "./statusMaps";
import { PartnerFormModal } from "./components/PartnerFormModal";
import { PartnerStatusSelect } from "./components/PartnerStatusSelect";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function PartnerDetailPage() {
  const { partnerId = "" } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetPartnerQuery(partnerId, { skip: !partnerId });
  const [createPartner] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: isUpdating }] = useUpdatePartnerMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangePartnerStatusMutation();
  const [deletePartner] = useDeletePartnerMutation();
  const [formOpen, setFormOpen] = useState(false);

  const partner = data?.data;
  const status = normalizePartnerStatus(partner?.status);
  const isPending = status === PARTNER_STATUS.PENDING;

  const deleteFlow = useConfirmDelete<ApiPartner>(async (record) => {
    const promise = deletePartner(record._id)
      .unwrap()
      .then(() => navigate("/partners"));

    toast.promise(promise, {
      loading: `Removing ${record.name}…`,
      success: `${record.name} was removed.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const handleSubmit = async (payload: PartnerFormPayload) => {
    if (!partner) return;
    try {
      await savePartner(payload, {
        partnerId: partner._id,
        createPartner: createPartner,
        updatePartner: updatePartner,
      });
      toast.success("Partner updated", { description: `${payload.name} has been saved.` });
      setFormOpen(false);
    } catch (error) {
      toast.error("Couldn't update partner", { description: getErrorMessage(error) });
    }
  };

  const applyStatus = async (nextStatus: PartnerStatus, successMessage: string) => {
    if (!partner) return;
    const promise = changeStatus({ id: partner._id, status: nextStatus }).unwrap();
    toast.promise(promise, {
      loading: "Updating status…",
      success: successMessage,
      error: (err) => getErrorMessage(err),
    });
    await promise.catch(() => undefined);
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 1 }} className="mb-6 max-w-xs" />
        <GlassCard flat>
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </GlassCard>
      </div>
    );
  }

  if (isError || !partner) {
    return (
      <div>
        <Link
          to="/partners"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
        >
          <ArrowLeftOutlined />
          Back to partners
        </Link>
        <GlassCard flat>
          <EmptyState
            icon={<ApartmentOutlined />}
            title="Partner not found"
            description="This profile may have been removed, or the link is invalid."
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/partners"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
      >
        <ArrowLeftOutlined />
        Back to partners
      </Link>

      <div className="aurora-field glass-panel mb-6 overflow-hidden">
        <div className="relative p-6 md:p-7">
          <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full bg-info/15 blur-[60px]" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-linear-to-br from-violet-600/40 to-violet-900/30 p-[2px] shadow-[0_12px_32px_-12px_rgba(129,49,240,0.55)]">
                <Avatar
                  src={getImageUrl(partner.image)}
                  icon={<ApartmentOutlined />}
                  size={80}
                  shape="square"
                  className="rounded-[14px]! bg-navy-800!"
                />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusTag tone={partnerStatusToneMap[status]}>
                    {partnerStatusLabelMap[status]}
                  </StatusTag>
                  {partner.featured && (
                    <StatusTag tone="gold" icon={<StarFilled />}>
                      Featured
                    </StatusTag>
                  )}
                </div>
                <h2 className="font-display text-2xl font-semibold text-cloud-100 md:text-3xl">
                  {partner.name}
                </h2>
                {partner.user && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-mist-400">
                    <Avatar
                      src={getImageUrl(partner.user.image)}
                      icon={<UserOutlined />}
                      size={24}
                      className="bg-violet-600/25! text-violet-glow!"
                    />
                    <span>{partner.user.name}</span>
                    <span className="text-mist-700">·</span>
                    <span className="text-mist-500">{partner.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isPending && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={isChangingStatus}
                    className="btn-gradient border-0!"
                    onClick={() =>
                      applyStatus(PARTNER_STATUS.APPROVED, `${partner.name} is now approved.`)
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={isChangingStatus}
                    onClick={() =>
                      applyStatus(PARTNER_STATUS.REJECTED, `${partner.name} was rejected.`)
                    }
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button icon={<EditOutlined />} onClick={() => setFormOpen(true)}>
                Edit
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={() => deleteFlow.request(partner)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard flat className="lg:col-span-2">
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
            About
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-300">
            {partner.description}
          </p>

          {(partner.offers?.length ?? 0) > 0 && (
            <div className="mt-5">
              <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
                Offers
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {partner.offers.map((offer) => (
                  <Tag
                    key={offer}
                    className="m-0! border-violet-600/30! bg-violet-600/15! text-violet-glow!"
                  >
                    {offer}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        <div className="space-y-4">
          <GlassCard flat>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
              Status
            </h3>
            <PartnerStatusSelect
              value={status}
              disabled={isChangingStatus}
              onChange={(nextStatus) =>
                applyStatus(nextStatus, `${partner.name} is now ${partnerStatusLabelMap[nextStatus].toLowerCase()}.`)
              }
            />
            <p className="mt-2 text-xs text-mist-600">
              Change status manually — pending applications usually come from the website.
            </p>
          </GlassCard>

          <GlassCard flat>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
              Contact
            </h3>
            <div className="space-y-3 text-sm">
              <DetailRow icon={<GlobalOutlined />} label="Website" value={partner.website} />
              <DetailRow icon={<MailOutlined />} label="Email" value={partner.contactEmail} />
              <DetailRow icon={<PhoneOutlined />} label="Phone" value={partner.contactPhone} />
            </div>
          </GlassCard>

          <GlassCard flat>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-mist-500">
              Timeline
            </h3>
            <div className="space-y-3 text-sm">
              <DetailRow
                icon={<ApartmentOutlined />}
                label="Submitted"
                value={partner.createdAt ? formatDateTime(partner.createdAt) : "—"}
              />
              <DetailRow
                icon={<ApartmentOutlined />}
                label="Last updated"
                value={partner.updatedAt ? formatDate(partner.updatedAt) : "—"}
              />
            </div>
          </GlassCard>
        </div>
      </div>

      <PartnerFormModal
        open={formOpen}
        initial={partner}
        loading={isUpdating}
        onCancel={() => {
          if (isUpdating) return;
          setFormOpen(false);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete ${deleteFlow.target?.name}?`}
        description="This permanently removes the partner profile from Hubology. This can't be undone."
        confirmLabel="Delete partner"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const isUrl = value.startsWith("http://") || value.startsWith("https://");

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/15 text-violet-glow">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-mist-600">{label}</div>
        {isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-violet-glow transition hover:underline"
          >
            {value}
          </a>
        ) : (
          <div className="break-all text-cloud-100">{value}</div>
        )}
      </div>
    </div>
  );
}
