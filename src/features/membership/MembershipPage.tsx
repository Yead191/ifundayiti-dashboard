import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Skeleton, Tabs, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CrownOutlined,
  TeamOutlined,
  UserOutlined,
  EyeOutlined,
  StarFilled,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { cn, formatCurrency } from "@/lib/utils";
import {
  useCreateMembershipMutation,
  useDeleteMembershipMutation,
  useGetMembershipsQuery,
  useUpdateMembershipMutation,
} from "@/redux/features/membership/membershipApi";
import type {
  ApiMembership,
  MembershipFormPayload,
  MembershipRecurring,
  MembershipType,
} from "@/redux/features/membership/membership.types";
import { membershipTypeLabelMap, recurringLabelMap, recurringShortLabelMap } from "./statusMaps";
import { BillingSegmented, MembershipFormModal } from "./components/MembershipFormModal";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useTypeCount(type: MembershipType) {
  const { data } = useGetMembershipsQuery({ page: 1, limit: 1, type });
  return data?.pagination?.total ?? 0;
}

export default function MembershipPage() {
  const [activeType, setActiveType] = useState<MembershipType>("user");
  const [billing, setBilling] = useState<MembershipRecurring | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiMembership | null>(null);

  const userCount = useTypeCount("user");
  const vendorCount = useTypeCount("vendor");

  const { data, isFetching, isLoading } = useGetMembershipsQuery({
    page: 1,
    limit: 50,
    type: activeType,
    recurring: billing === "all" ? undefined : billing,
  });

  const [createPlan, { isLoading: isCreating }] = useCreateMembershipMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateMembershipMutation();
  const [deletePlan] = useDeleteMembershipMutation();

  const plans = data?.data ?? [];
  const navigate = useNavigate();

  useEffect(() => {
    setEditing(null);
    setFormOpen(false);
  }, [activeType]);

  const deleteFlow = useConfirmDelete<ApiMembership>(async (record) => {
    const promise = deletePlan(record._id).unwrap();
    toast.promise(promise, {
      loading: `Removing ${record.name}…`,
      success: `"${record.name}" is no longer offered.`,
      error: (err) => getErrorMessage(err),
    });
    await promise.catch(() => undefined);
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (plan: ApiMembership) => {
    setEditing(plan);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: MembershipFormPayload) => {
    try {
      if (editing) {
        await updatePlan({ id: editing._id, body: payload }).unwrap();
        toast.success("Plan updated", { description: `"${payload.name}" has been saved.` });
      } else {
        await createPlan(payload).unwrap();
        toast.success("Plan created", {
          description: `"${payload.name}" is now available for ${membershipTypeLabelMap[payload.type].toLowerCase()}s.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update plan" : "Couldn't create plan", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 overflow-hidden p-6 md:p-7">
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -right-8 -top-16 h-44 w-44 rounded-full bg-warning/15 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-36 w-36 rounded-full bg-violet-600/25 blur-[50px]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-warning to-[#c47d12] shadow-[0_8px_24px_-8px_rgba(245,181,68,0.65)]">
              <CrownOutlined className="text-lg text-navy-900" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-cloud-100">Membership plans</h2>
              <p className="mt-1 max-w-xl text-sm text-mist-400">
                Design premium tiers for members and vendors. Manage pricing, billing cadence, and
                who sits under each plan.
              </p>
            </div>
          </div>

          <div className="relative flex gap-2">
            <div className="rounded-2xl border border-violet-600/25 bg-violet-600/10 px-4 py-3 text-sm">
              <div className="font-semibold text-violet-glow">{userCount} user</div>
              <div className="text-xs text-mist-400">Member plans</div>
            </div>
            <div className="rounded-2xl border border-info/25 bg-info/10 px-4 py-3 text-sm">
              <div className="font-semibold text-info">{vendorCount} vendor</div>
              <div className="text-xs text-mist-400">Partner plans</div>
            </div>
          </div>
        </div>
      </div>

      <GlassCard flat padded={false}>
        <div className="flex flex-col gap-3 border-b border-navy-700/60 px-4 pt-2 md:flex-row md:items-center md:justify-between md:px-5">
          <Tabs
            activeKey={activeType}
            onChange={(key) => setActiveType(key as MembershipType)}
            className="mb-0!"
            items={[
              {
                key: "user",
                label: (
                  <span className="flex items-center gap-2">
                    <UserOutlined />
                    User membership
                    <Badge
                      count={userCount}
                      showZero
                      overflowCount={999}
                      style={{
                        backgroundColor: activeType === "user" ? "#8131F0" : "#23274f",
                        color: activeType === "user" ? "#fff" : "#9ca3c9",
                        boxShadow: "none",
                      }}
                    />
                  </span>
                ),
              },
              {
                key: "vendor",
                label: (
                  <span className="flex items-center gap-2">
                    <TeamOutlined />
                    Vendor membership
                    <Badge
                      count={vendorCount}
                      showZero
                      overflowCount={999}
                      style={{
                        backgroundColor: activeType === "vendor" ? "#8131F0" : "#23274f",
                        color: activeType === "vendor" ? "#fff" : "#9ca3c9",
                        boxShadow: "none",
                      }}
                    />
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className="flex flex-col gap-3 border-b border-navy-700/60 p-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <BillingSegmented value={billing} onChange={setBilling} />
          <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
            New {activeType} plan
          </Button>
        </div>

        <div className="p-4 md:p-5">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-navy-700/60 bg-navy-800/30 p-6">
                  <Skeleton active paragraph={{ rows: 6 }} />
                </div>
              ))}
            </div>
          ) : !isFetching && plans.length === 0 ? (
            <EmptyState
              icon={<CrownOutlined />}
              title={`No ${activeType} plans yet`}
              description={`Create the first ${activeType} membership tier to offer on the platform.`}
              actionLabel={`New ${activeType} plan`}
              onAction={openCreate}
            />
          ) : (
            <div
              className={cn(
                "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3",
                isFetching && "opacity-70 transition-opacity"
              )}
            >
              {plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onEdit={() => openEdit(plan)}
                  onDelete={() => deleteFlow.request(plan)}
                  onViewSubscribers={() => navigate(`/membership/${plan._id}/subscribers`)}
                />
              ))}

              <button
                type="button"
                onClick={openCreate}
                className="group flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-navy-600/70 bg-navy-800/20 text-mist-400 transition hover:border-violet-600/45 hover:bg-violet-600/5 hover:text-cloud-100"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-navy-600/60 bg-navy-800/50 text-lg transition group-hover:border-violet-600/40 group-hover:text-violet-glow">
                  <PlusOutlined />
                </span>
                <span className="text-sm font-medium">Add a new {activeType} plan</span>
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      <MembershipFormModal
        open={formOpen}
        type={activeType}
        initial={editing}
        loading={isCreating || isUpdating}
        onCancel={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete "${deleteFlow.target?.name}"?`}
        description="This plan will no longer be offered. Existing subscribers are not automatically cancelled."
        confirmLabel="Delete plan"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onDelete,
  onViewSubscribers,
}: {
  plan: ApiMembership;
  onEdit: () => void;
  onDelete: () => void;
  onViewSubscribers: () => void;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-linear-to-b from-[#171b3a] to-[#10132c] p-6 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-0.5",
        plan.featured
          ? "border-warning/35 shadow-[0_24px_50px_-24px_rgba(245,181,68,0.35)]"
          : "border-navy-700/70 hover:border-violet-600/35"
      )}
    >
      {plan.featured && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,181,68,0.12),transparent_55%)]" />
      )}

      {(plan.highlight || plan.featured) && (
        <div className="relative mb-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-warning to-[#c47d12] px-3 py-1 text-[11px] font-semibold text-navy-900 shadow-lg">
            {plan.featured && <StarFilled className="text-[10px]" />}
            {plan.highlight || "Featured"}
          </span>
        </div>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-display text-lg font-semibold tracking-tight text-cloud-100">{plan.name}</h3>
            <StatusTag tone={plan.type === "user" ? "violet" : "info"}>
              {membershipTypeLabelMap[plan.type]}
            </StatusTag>
            {plan.has_trial && (
              <StatusTag tone="gold">
                {plan.trial_period_days ?? 0}-day trial
              </StatusTag>
            )}
            {plan.is_auto_renew !== false ? (
              <StatusTag tone="success">Auto renew</StatusTag>
            ) : (
              <StatusTag tone="neutral">Manual renew</StatusTag>
            )}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-400">{plan.tagline}</p>
        </div>
        <div className="flex shrink-0 gap-0.5 opacity-80 transition group-hover:opacity-100">
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
          </Tooltip>
        </div>
      </div>

      <div className="relative mt-5 flex items-end gap-1.5">
        <span className="font-display text-4xl font-bold tracking-tight text-cloud-100">
          {formatCurrency(plan.price)}
        </span>
        <span className="pb-1.5 text-sm text-mist-400">
          /{recurringShortLabelMap[plan.recurring] ?? plan.recurring}
        </span>
      </div>
      <div className="relative mt-1 text-xs text-mist-500">
        {recurringLabelMap[plan.recurring] ?? plan.recurring}
        {plan.interval > 1 ? ` · every ${plan.interval} ${plan.recurring}s` : ""}
        {plan.has_trial
          ? ` · ${plan.trial_period_days ?? 0}-day free trial`
          : ""}
        {plan.is_auto_renew === false ? " · no auto renew" : ""}
      </div>

      <ul className="relative mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-mist-300">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-[9px] text-violet-glow">
              <CheckOutlined />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="relative mt-6 border-t border-navy-700/60 pt-4">
        <Button
          type="primary"
          icon={<EyeOutlined />}
          className="btn-gradient border-0!"
          block
          onClick={onViewSubscribers}
        >
          View subscribers
        </Button>
      </div>
    </article>
  );
}
