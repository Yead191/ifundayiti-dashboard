import type { ReactNode } from "react";
import { Avatar, Button, Modal } from "antd";
import {
  MailOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleFilled,
  BankOutlined,
  AimOutlined,
  CrownOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import type { ApiUser, UserAccountStatus } from "@/redux/features/users/users.types";
import {
  subscriptionStatusToneMap,
  userStatusLabelMap,
  userStatusToneMap,
} from "../statusMaps";
import { UserStatusSelect } from "./UserStatusSelect";

export function UserProfileModal({
  user,
  open,
  updating,
  onClose,
  onStatusChange,
  onDelete,
}: {
  user: ApiUser | null;
  open: boolean;
  updating?: boolean;
  onClose: () => void;
  onStatusChange: (status: UserAccountStatus) => void;
  onDelete: (user: ApiUser) => void;
}) {
  if (!user) return null;

  const subscription = user.subscription;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      destroyOnHidden
      styles={{
        body: { padding: 0 },
        container: {
          overflow: "hidden",
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
        },
      }}
    >
      <div className="relative overflow-hidden px-6 pb-6 pt-7 md:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-violet-600/25 blur-[80px]" />
          <div className="absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-violet-900/30 blur-[70px]" />
        </div>

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="rounded-2xl bg-gradient-to-br from-violet-600/50 to-violet-900/40 p-[2px] shadow-[0_12px_40px_-12px_rgba(129,49,240,0.65)]">
              <Avatar
                src={getImageUrl(user.image)}
                icon={<UserOutlined />}
                size={88}
                className="!rounded-[14px] !bg-navy-800"
                shape="square"
              />
            </div>
            {user.verified && (
              <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-navy-700 bg-info/20 text-info shadow-lg">
                <CheckCircleFilled className="text-sm" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-cloud-100">
                  {user.name}
                </h2>
                <p className="mt-1 text-sm text-mist-400">
                  {user.role}
                  {user.company ? ` · ${user.company}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <StatusTag tone={userStatusToneMap[user.status]}>
                  {userStatusLabelMap[user.status]}
                </StatusTag>
                {subscription && (
                  <StatusTag tone="gold" icon={<CrownOutlined />}>
                    {subscription.name}
                  </StatusTag>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${user.email}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-600/70 bg-navy-800/60 px-3 py-1.5 text-xs text-mist-300 transition hover:border-violet-600/40 hover:text-cloud-100"
              >
                <MailOutlined /> {user.email}
              </a>
              {user.verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-3 py-1.5 text-xs text-info">
                  <CheckCircleFilled /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={<BankOutlined />} label="Company" value={user.company || "—"} />
          <Metric icon={<AimOutlined />} label="Interest" value={user.interest || "—"} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Field label="Joined" value={formatDate(user.createdAt)} />
          <Field label="Last updated" value={formatDate(user.updatedAt)} />
        </div>

        {subscription ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#f5b544]/25 bg-gradient-to-br from-[#f5b544]/10 to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5b544]/15 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5b544]/15 text-[#f5b544]">
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
                <StatusTag tone={subscriptionStatusToneMap[subscription.status] ?? "neutral"}>
                  {subscription.status}
                </StatusTag>
                <span className="font-display text-base font-semibold text-[#f5b544]">
                  {formatCurrency(subscription.price)}
                  <span className="text-xs font-normal text-mist-400">/{subscription.recuring}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 py-3.5 text-sm">
              <div className="flex items-center gap-2 text-mist-300">
                <CalendarOutlined className="text-mist-600" />
                <div>
                  <div className="text-[11px] text-mist-600">Starts</div>
                  <div className="font-medium text-cloud-100">{formatDate(subscription.start_date)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-mist-300">
                <CalendarOutlined className="text-mist-600" />
                <div>
                  <div className="text-[11px] text-mist-600">Ends</div>
                  <div className="font-medium text-cloud-100">{formatDate(subscription.end_date)}</div>
                </div>
              </div>
            </div>

            {!!subscription.features?.length && (
              <div className="border-t border-[#f5b544]/15 px-4 py-3.5">
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
            <p className="mt-2 text-sm text-mist-400">No subscription package on this account.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-mist-600">
            Account status
          </div>
          <UserStatusSelect
            size="middle"
            value={user.status}
            disabled={updating}
            onChange={onStatusChange}
          />
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Button onClick={onClose}>Close</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(user)}>
            Delete user
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-mist-600">
        <span className="text-violet-glow/80">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 truncate font-display text-sm font-semibold text-cloud-100">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/35 p-3.5">
      <div className="text-xs text-mist-600">{label}</div>
      <div className="mt-0.5 font-medium text-cloud-100">{value}</div>
    </div>
  );
}
