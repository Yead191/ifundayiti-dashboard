import type { ReactNode } from "react";
import { Avatar, Button, Modal, Switch, Tooltip } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  LinkedinFilled,
  DeleteOutlined,
  UserOutlined,
  CheckCircleFilled,
  GlobalOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BookOutlined,
  CrownOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toFileUrl } from "@/config";
import type {
  ApiVendor,
  VendorAccountStatus,
} from "@/redux/features/vendors/vendors.types";
import { subscriptionStatusToneMap } from "@/features/users/statusMaps";
import { statusLabelMap, statusToneMap } from "../statusMaps";
import { VendorStatusSelect } from "./VendorStatusSelect";

export function VendorProfileModal({
  vendor,
  open,
  updating,
  visibilityUpdating,
  onClose,
  onStatusChange,
  onVisibilityChange,
  onDelete,
}: {
  vendor: ApiVendor | null;
  open: boolean;
  updating?: boolean;
  visibilityUpdating?: boolean;
  onClose: () => void;
  onStatusChange: (status: VendorAccountStatus) => void;
  onVisibilityChange: (isProfileVisible: boolean) => void;
  onDelete: (vendor: ApiVendor) => void;
}) {
  if (!vendor) return null;

  const profile = vendor.vendorProfile;
  const subscription = vendor.subscription;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
      destroyOnHidden
      styles={{
        body: { padding: 0 },
        container: {
          overflow: "hidden",
          background: "linear-linear(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
        },
      }}
    >
      {/* Hero band */}
      <div className="relative overflow-hidden px-6 pb-6 pt-7 md:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-violet-600/25 blur-[80px]" />
          <div className="absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-violet-900/30 blur-[70px]" />
        </div>

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="rounded-2xl bg-linear-to-br from-violet-600/50 to-violet-900/40 p-0.5 shadow-[0_12px_40px_-12px_rgba(129,49,240,0.65)]">
              <Avatar
                src={toFileUrl(vendor.image)}
                icon={<UserOutlined />}
                size={88}
                className="rounded-[14px]! bg-navy-800!"
                shape="square"
              />
            </div>
            {vendor.verified && (
              <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-navy-700 bg-info/20 text-info shadow-lg">
                <CheckCircleFilled className="text-sm" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-cloud-100">
                  {vendor.name}
                </h2>
                <p className="mt-1 text-sm text-mist-400">
                  {profile?.jobTitle || vendor.role}
                  {vendor.company ? ` · ${vendor.company}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusTag tone={statusToneMap[vendor.status]}>
                  {statusLabelMap[vendor.status]}
                </StatusTag>
                {subscription && (
                  <StatusTag tone="gold" icon={<CrownOutlined />}>
                    {subscription.name}
                  </StatusTag>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.contactNo && (
                <a
                  href={`tel:${profile.contactNo}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-600/70 bg-navy-800/60 px-3 py-1.5 text-xs text-mist-300 transition hover:border-violet-600/40 hover:text-cloud-100"
                >
                  <PhoneOutlined /> {profile.contactNo}
                </a>
              )}
              <a
                href={`mailto:${vendor.email}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-600/70 bg-navy-800/60 px-3 py-1.5 text-xs text-mist-300 transition hover:border-violet-600/40 hover:text-cloud-100"
              >
                <MailOutlined /> {vendor.email}
              </a>
              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-600/70 bg-navy-800/60 px-3 py-1.5 text-xs text-mist-300 transition hover:border-violet-600/40 hover:text-cloud-100"
                >
                  <LinkedinFilled /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric
            icon={<DollarOutlined />}
            label="Hourly rate"
            value={
              profile?.hourlyRate != null
                ? `${formatCurrency(profile.hourlyRate)}/hr`
                : "—"
            }
          />
          <Metric
            icon={<ClockCircleOutlined />}
            label="Availability"
            value={profile?.availability || "—"}
          />
          <Metric
            icon={<BookOutlined />}
            label="Experience"
            value={profile?.yearsExperience || "—"}
          />
          <Metric
            icon={<GlobalOutlined />}
            label="Interest"
            value={vendor.interest || "—"}
          />
        </div>

        {profile?.bio && (
          <Section title="About">
            <p className="text-sm leading-relaxed text-mist-300">
              {profile.bio}
            </p>
          </Section>
        )}

        {subscription ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-warning/25 bg-linear-to-br from-warning/10 to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-warning/15 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning">
                  <CrownOutlined />
                </div>
                <div>
                  <div className="font-display text-sm font-semibold text-cloud-100">
                    {subscription.name}
                  </div>
                  <div className="text-xs capitalize text-mist-400">
                    Billed {subscription.recuring}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusTag
                  tone={
                    subscriptionStatusToneMap[subscription.status] ?? "neutral"
                  }
                >
                  {subscription.status}
                </StatusTag>
                <span className="font-display text-base font-semibold text-warning">
                  {formatCurrency(subscription.price)}
                  <span className="text-xs font-normal text-mist-400">
                    /{subscription.recuring}
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2 text-mist-300">
                <CalendarOutlined className="text-mist-600" />
                <div>
                  <div className="text-[11px] text-mist-600">Starts</div>
                  <div className="font-medium text-cloud-100">
                    {formatDate(subscription.start_date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-mist-300">
                <CalendarOutlined className="text-mist-600" />
                <div>
                  <div className="text-[11px] text-mist-600">Ends</div>
                  <div className="font-medium text-cloud-100">
                    {formatDate(subscription.end_date)}
                  </div>
                </div>
              </div>
            </div>

            {!!subscription.features?.length && (
              <div className="border-t border-warning/15 px-4 py-3.5">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-mist-600">
                  Plan features
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subscription.features.map((feature) => (
                    <StatusTag key={feature} tone="neutral">
                      {feature}
                    </StatusTag>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-navy-600/70 px-4 py-5 text-center">
            <CrownOutlined className="text-lg text-mist-600" />
            <p className="mt-2 text-sm text-mist-400">
              No subscription package on this account.
            </p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Section title="Credentials">
            <div className="space-y-3 rounded-xl border border-navy-700/60 bg-navy-800/35 p-4 text-sm">
              <Field label="Degree" value={profile?.degree || "—"} />
              <Field label="Joined" value={formatDate(vendor.createdAt)} />
              <Field
                label="Last updated"
                value={formatDate(vendor.updatedAt)}
              />
            </div>
          </Section>

          <Section title="Expertise">
            {profile?.expertise?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.expertise.map((e) => (
                  <StatusTag key={e} tone="violet">
                    {e}
                  </StatusTag>
                ))}
              </div>
            ) : (
              <p className="text-sm text-mist-600">No expertise listed.</p>
            )}
            {!!profile?.consultationTypes?.length && (
              <div className="mt-3">
                <div className="mb-1.5 text-xs text-mist-600">
                  Consultation types
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.consultationTypes.map((c) => (
                    <StatusTag key={c} tone="neutral">
                      {c}
                    </StatusTag>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {vendor.status === "rejected" && vendor.rejectionReason && (
          <div className="mt-5 rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide opacity-80">
              Rejection reason
            </div>
            {vendor.rejectionReason}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-mist-600">
              Account status
            </div>
            <VendorStatusSelect
              size="middle"
              value={vendor.status}
              disabled={updating}
              onChange={onStatusChange}
            />
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button onClick={onClose}>Close</Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(vendor)}
            >
              Delete account
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 rounded-xl border border-navy-700/60 bg-navy-800/40 px-4 py-3">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-cloud-100">
              Show on vendor directory
              <Tooltip title="Enable this to make the profile visible on the public vendor page even if they don't have an active subscription.">
                <QuestionCircleOutlined className="text-mist-500" />
              </Tooltip>
            </div>
            <p className="mt-0.5 text-xs text-mist-500">
              Visible even without a subscription.
            </p>
          </div>
          <Switch
            checked={!!profile?.isProfileVisible}
            loading={visibilityUpdating}
            disabled={visibilityUpdating}
            onChange={onVisibilityChange}
          />
        </div>
      </div>
    </Modal>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-mist-600">
        <span className="text-violet-glow/80">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 truncate font-display text-sm font-semibold text-cloud-100">
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2.5 text-xs font-medium uppercase tracking-wide text-mist-600">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-mist-600">{label}</span>
      <span className="truncate text-sm font-medium text-cloud-100">
        {value}
      </span>
    </div>
  );
}
