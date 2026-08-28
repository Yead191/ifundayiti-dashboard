import { useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  TeamOutlined,
  ShopOutlined,
  FlagFilled,
  ArrowRightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Skeleton } from "antd";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toFileUrl } from "@/config";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useGetDashboardOverviewQuery } from "@/redux/features/dashboard/dashboardApi";
import { useGetVendorsQuery } from "@/redux/features/vendors/vendorsApi";
import { useGetMembershipsQuery } from "@/redux/features/membership/membershipApi";
import { useGetPostsQuery } from "@/redux/features/forum/forumApi";
import { getImageUrl } from "@/lib/getImageUrl";

export default function DashboardOverviewPage() {
  const { data: profile } = useGetProfileQuery();
  const { data: dashboardRes, isLoading: isDashboardLoading } = useGetDashboardOverviewQuery();
  const { data: pendingVendorsRes } = useGetVendorsQuery({ status: "pending", page: 1, limit: 3 });
  const { data: membershipRes } = useGetMembershipsQuery({
    page: 1,
    limit: 5,
    type: "user",
    recurring: "month",
  });
  const { data: reportedRes } = useGetPostsQuery({ status: "reported", page: 1, limit: 3 });
  const navigate = useNavigate();

  const stats = dashboardRes?.data;
  const pendingVendors = pendingVendorsRes?.data ?? [];
  const plans = membershipRes?.data ?? [];
  const reportedPosts = reportedRes?.data ?? [];

  const firstName = profile?.data?.name.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-cloud-100">
            Welcome back, {firstName} 👋
          </h2>
          <p className="mt-1 text-sm text-mist-400">
            Here's what's happening across Hubology today, {formatDate(new Date())}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="btn-gradient border-0!" onClick={() => navigate("/vendors")}>
            Review applications
          </Button>
          <Button onClick={() => navigate("/forum")}>Moderate forum</Button>
        </div>
      </div>

      {isDashboardLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel-flat p-5">
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: "40%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Live services"
            value={stats?.totalServices ?? 0}
            icon={<AppstoreOutlined />}
            tone="violet"
          />
          <StatCard
            label="Approved vendors"
            value={stats?.approvedVendors ?? 0}
            icon={<TeamOutlined />}
            tone="success"
            trend={
              stats?.pendingVendors
                ? { direction: "up", label: `${stats.pendingVendors} pending` }
                : undefined
            }
          />
          <StatCard
            label="Store products"
            value={stats?.totalProducts ?? 0}
            icon={<ShopOutlined />}
            tone="info"
          />
          <StatCard
            label="Reported posts"
            value={stats?.reportedPost ?? 0}
            icon={<FlagFilled />}
            tone="warning"
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-5">
        <GlassCard flat className="xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-cloud-100">Needs your attention</h3>
            <Button
              type="text"
              size="small"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => navigate("/vendors")}
            >
              View all
            </Button>
          </div>

          {pendingVendors.length === 0 && reportedPosts.length === 0 ? (
            <p className="py-8 text-center text-sm text-mist-600">
              You're all caught up — nothing pending review.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingVendors.map((v) => (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => navigate("/vendors")}
                  className="surface-hover flex w-full items-center justify-between gap-3 rounded-xl border border-navy-700/60 bg-navy-800/40 p-3 text-left hover:border-violet-600/40"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={toFileUrl(v.image)} icon={<UserOutlined />} size={36} />
                    <div>
                      <div className="text-sm font-medium text-cloud-100">{v.name}</div>
                      <div className="text-xs text-mist-400">
                        Pending application · {v.vendorProfile?.jobTitle || v.role}
                      </div>
                    </div>
                  </div>
                  <StatusTag tone="warning">Pending</StatusTag>
                </button>
              ))}
              {reportedPosts.slice(0, 3).map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => navigate(`/forum/${p._id}`)}
                  className="surface-hover flex w-full items-center justify-between gap-3 rounded-xl border border-navy-700/60 bg-navy-800/40 p-3 text-left hover:border-violet-600/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={getImageUrl(p.author.image)}
                      icon={<UserOutlined />}
                      size={36}
                      className="bg-warning/15! text-warning!"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-cloud-100">{p.content}</div>
                      <div className="text-xs text-mist-400">
                        Forum post · {p.reportCount ?? 0} report{(p.reportCount ?? 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <StatusTag tone="danger">Reported</StatusTag>
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard flat className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-semibold text-cloud-100">Membership plans</h3>
            <Button
              type="text"
              size="small"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => navigate("/membership")}
            >
              Manage
            </Button>
          </div>
          <div className="space-y-2.5">
            {plans.length === 0 ? (
              <p className="text-sm text-mist-500">No membership plans yet.</p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan._id}
                  className="flex items-center justify-between rounded-xl border border-navy-700/60 bg-navy-800/40 p-3"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-cloud-100">
                      {plan.name}
                      {plan.featured && <StatusTag tone="violet">Featured</StatusTag>}
                    </div>
                    <div className="text-xs text-mist-400">{plan.tagline}</div>
                  </div>
                  <div className="font-display text-sm font-semibold text-cloud-100">
                    {formatCurrency(plan.price)}/{plan.recurring === "year" ? "yr" : "mo"}
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
