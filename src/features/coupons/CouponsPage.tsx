import { useEffect, useState } from "react";
import { Button, Pagination, Skeleton, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusTag } from "@/components/ui/StatusTag";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatDate } from "@/lib/utils";
import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponsQuery,
  useUpdateCouponMutation,
} from "@/redux/features/coupons/couponsApi";
import type { ApiCoupon, CouponPayload } from "@/redux/features/coupons/coupons.types";
import {
  formatCouponDiscount,
  formatCouponStatus,
  getCouponStatus,
  getCouponUsage,
} from "./couponUtils";
import { CouponFormModal } from "./components/CouponFormModal";
import { CouponDetailModal } from "./components/CouponDetailModal";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

const STATUS_TONE = {
  active: "success",
  inactive: "warning",
  expired: "neutral",
} as const;

export default function CouponsPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCoupon | null>(null);
  const [viewing, setViewing] = useState<ApiCoupon | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data, isFetching, isLoading } = useGetCouponsQuery({
    page,
    limit,
    searchTerm,
  });

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const coupons = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiCoupon>(async (record) => {
    const promise = deleteCoupon(record._id)
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: `Removing ${record.coupon_code}…`,
      success: `Coupon ${record.coupon_code} was deleted.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (coupon: ApiCoupon) => {
    setEditing(coupon);
    setFormOpen(true);
    setViewing(null);
  };

  const handleSubmit = async (payload: CouponPayload) => {
    try {
      if (editing) {
        await updateCoupon({ id: editing._id, body: payload }).unwrap();
        toast.success("Coupon updated", {
          description: `${payload.coupon_code} has been saved.`,
        });
      } else {
        await createCoupon(payload).unwrap();
        toast.success("Coupon created", {
          description: `${payload.coupon_code} is ready to use.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update coupon" : "Couldn't create coupon", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <TagOutlined className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">Discount coupons</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Create and manage promo codes with percentage or fixed discounts, usage limits, and
              active date ranges.
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
          New coupon
        </Button>
      </div>

      <GlassCard flat className="mb-4">
        <SearchInput
          placeholder="Search by code or campaign name…"
          value={search}
          onChange={setSearch}
          className="sm:w-80!"
        />
      </GlassCard>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 4 }} />
          ))}
        </div>
      ) : !isFetching && coupons.length === 0 ? (
        <GlassCard flat>
          <EmptyState
            icon={<TagOutlined />}
            title="No coupons yet"
            description={
              searchTerm
                ? "No coupons match your search."
                : "Create your first discount code for the store."
            }
            actionLabel="New coupon"
            onAction={openCreate}
          />
        </GlassCard>
      ) : (
        <>
          <div
            className={cn(
              "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
              isFetching && "opacity-70 transition-opacity"
            )}
          >
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              const usage = getCouponUsage(coupon);

              return (
                <article
                  key={coupon._id}
                  className="group relative overflow-hidden rounded-2xl border border-navy-700/70 bg-linear-to-b from-[#171b3a] to-[#10132c] p-5 transition hover:border-violet-600/35 hover:shadow-[0_16px_40px_-28px_rgba(129,49,240,0.45)]"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-600/10 blur-2xl transition group-hover:bg-violet-600/20" />

                  <div className="relative">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <StatusTag tone={STATUS_TONE[status]}>{formatCouponStatus(status)}</StatusTag>
                      <div className="flex shrink-0 gap-0.5">
                        <Tooltip title="View">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => setViewing(coupon)}
                          />
                        </Tooltip>
                        <Tooltip title="Edit">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(coupon)}
                          />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteFlow.request(coupon)}
                          />
                        </Tooltip>
                      </div>
                    </div>

                    <p className="font-mono text-xs tracking-wider text-violet-glow">{coupon.coupon_code}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-cloud-100">{coupon.name}</h3>
                    <p className="mt-2 font-display text-2xl font-bold text-cloud-100">
                      {formatCouponDiscount(coupon)}
                      <span className="ml-1 text-sm font-medium text-mist-500">off</span>
                    </p>

                    <div className="mt-4 space-y-2 border-t border-navy-700/60 pt-4 text-xs text-mist-500">
                      <div className="flex justify-between gap-2">
                        <span>Usage</span>
                        <span className="text-mist-300">
                          {usage.used} / {usage.max}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Valid until</span>
                        <span className="text-mist-300">{formatDate(coupon.end_date)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {pagination && pagination.totalPage > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                current={page}
                pageSize={limit}
                total={pagination.total}
                showSizeChanger
                pageSizeOptions={[9, 12, 18, 24]}
                onChange={(nextPage, nextLimit) => {
                  setPage(nextPage);
                  setLimit(nextLimit);
                }}
              />
            </div>
          )}
        </>
      )}

      <CouponFormModal
        open={formOpen}
        initial={editing}
        loading={isCreating || isUpdating}
        onCancel={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <CouponDetailModal
        coupon={viewing}
        open={!!viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onDelete={(coupon) => {
          setViewing(null);
          deleteFlow.request(coupon);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title="Delete this coupon?"
        description="Customers won't be able to use this code anymore. This can't be undone."
        confirmLabel="Delete coupon"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
