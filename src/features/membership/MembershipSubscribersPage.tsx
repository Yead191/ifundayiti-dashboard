import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Table, Tooltip, type TableProps } from "antd";
import {
  ArrowLeftOutlined,
  CrownOutlined,
  UserOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { SearchInput } from "@/components/ui/SearchInput";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useGetMembershipsQuery,
  useGetSubscribersQuery,
} from "@/redux/features/membership/membershipApi";
import type { ApiSubscriber } from "@/redux/features/membership/membership.types";
import {
  formatSubscriberRecurring,
  recurringLabelMap,
  recurringShortLabelMap,
  subscriberStatusToneMap,
} from "./statusMaps";

export default function MembershipSubscribersPage() {
  const { membershipId = "" } = useParams<{ membershipId: string }>();
  const {
    value: search,
    setValue: setSearch,
    debouncedValue: searchTerm,
  } = useDebouncedSearch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, membershipId]);

  const { data: userPlans } = useGetMembershipsQuery({
    page: 1,
    limit: 100,
    type: "user",
  });
  const { data: vendorPlans } = useGetMembershipsQuery({
    page: 1,
    limit: 100,
    type: "vendor",
  });
  const plan =
    [...(userPlans?.data ?? []), ...(vendorPlans?.data ?? [])].find(
      (p) => p._id === membershipId,
    ) ?? null;

  const { data, isFetching } = useGetSubscribersQuery(
    { id: membershipId, page, limit, searchTerm },
    { skip: !membershipId },
  );

  const subscribers = data?.data ?? [];
  const pagination = data?.pagination;

  const copyId = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()}`);
    }
  };

  const columns: TableProps<ApiSubscriber>["columns"] = [
    {
      title: "Subscriber",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={getImageUrl(record?.user?.image || "")}
            icon={<UserOutlined />}
            size={40}
            className="bg-violet-600/25! text-violet-glow!"
          />
          <div className="min-w-0">
            <div className="font-medium text-cloud-100">{record?.user?.name || "Deleted User"}</div>
            <div className="max-w-56 truncate text-xs text-mist-400">
              {record?.user?.email || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      responsive: ["md"],
      render: (_, record) => (
        <div>
          <div className="font-medium text-cloud-100">
            {record.name || record.plan?.name}
          </div>
          <div className="text-xs text-mist-400">
            {formatSubscriberRecurring(record.recuring)}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <span className="font-display font-semibold text-cloud-100">
          {formatCurrency(record.price)}
          {record.recuring && record.recuring !== "free" && (
            <span className="text-xs font-normal text-mist-500">
              /{record.recuring === "week" ? "wk" : record.recuring === "year" ? "yr" : "mo"}
            </span>
          )}
        </span>
      ),
    },
    {
      title: "Period",
      key: "period",
      responsive: ["lg"],
      render: (_, record) => (
        <div className="text-sm text-mist-300">
          <div>{formatDate(record.start_date)}</div>
          <div className="text-xs text-mist-500">
            to {formatDate(record.end_date)}
          </div>
        </div>
      ),
    },
    {
      title: "Trial",
      key: "trial",
      responsive: ["md"],
      render: (_, record) => {
        if (!record.is_trial) {
          return <span className="text-mist-600">—</span>;
        }
        return (
          <div>
            <StatusTag tone="gold">Trial</StatusTag>
            <div className="mt-1.5 text-xs text-mist-400">
              {record.trial_period_days ?? 0} days
              {record.trial_end_date
                ? ` · ends ${formatDate(record.trial_end_date)}`
                : ""}
            </div>
          </div>
        );
      },
    },
    {
      title: "Auto renew",
      key: "auto_renew",
      responsive: ["lg"],
      render: (_, record) =>
        record.auto_renew ? (
          <StatusTag tone="success">On</StatusTag>
        ) : (
          <StatusTag tone="neutral">Off</StatusTag>
        ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <StatusTag tone={subscriberStatusToneMap[record.status] ?? "neutral"}>
          {record.status}
        </StatusTag>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      responsive: ["xl"],
      render: (_, record) => {
        const id = record.trxId || record.payment_intent_id;
        if (!id) return <span className="text-mist-600">—</span>;
        return (
          <div className="flex max-w-44 items-center gap-1">
            <code className="truncate font-mono text-[11px] text-mist-400">
              {id}
            </code>
            <Tooltip title="Copy ID">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyId(id, "Transaction ID")}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-5">
        <Link
          to="/membership"
          className="inline-flex items-center gap-1.5 text-sm text-mist-400 transition hover:text-violet-glow"
        >
          <ArrowLeftOutlined />
          Back to plans
        </Link>
      </div>

      <div className="aurora-field glass-panel mb-6 overflow-hidden p-6 md:p-7">
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full bg-warning/15 blur-[60px]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-warning to-[#c47d12] shadow-[0_8px_24px_-8px_rgba(245,181,68,0.65)]">
              <CrownOutlined className="text-lg text-navy-900" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-cloud-100">
                  {plan?.name ?? "Plan"} subscribers
                </h2>
                {plan && (
                  <StatusTag tone="gold">
                    {formatCurrency(plan.price)}/
                    {recurringShortLabelMap[plan.recurring] ?? plan.recurring}
                  </StatusTag>
                )}
                {plan && (
                  <StatusTag tone={plan.is_auto_renew !== false ? "success" : "neutral"}>
                    {plan.is_auto_renew !== false ? "Auto renew" : "Manual renew"}
                  </StatusTag>
                )}
              </div>
              <p className="mt-1 max-w-xl text-sm text-mist-400">
                {plan?.tagline ??
                  "Members currently subscribed to this membership plan."}
                {plan
                  ? ` · ${recurringLabelMap[plan.recurring] ?? plan.recurring} billing`
                  : ""}
                {plan?.has_trial
                  ? ` · ${plan.trial_period_days ?? 0}-day trial offered`
                  : ""}
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm">
            <div className="font-semibold text-warning">
              {pagination?.total ?? 0} subscribers
            </div>
            <div className="text-xs text-mist-400">On this plan</div>
          </div>
        </div>
      </div>

      <GlassCard flat className="mb-4">
        <SearchInput
          placeholder="Search by name or email…"
          value={search}
          onChange={setSearch}
          className="sm:w-72!"
        />
      </GlassCard>

      <GlassCard flat padded={false}>
        {!isFetching && subscribers.length === 0 ? (
          <EmptyState
            icon={<UserOutlined />}
            title="No subscribers yet"
            description="When members subscribe to this plan, they’ll appear in this table."
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={subscribers}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `${total} subscribers`,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>
    </div>
  );
}
