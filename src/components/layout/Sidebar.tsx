import { useEffect, useMemo, useState } from "react";
import { Badge } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS, type NavItem } from "./navConfig";
import { cn } from "@/lib/utils";
import { useGetDashboardOverviewQuery } from "@/redux/features/dashboard/dashboardApi";
import { useGetPostsQuery } from "@/redux/features/forum/forumApi";
import { useGetPartnersQuery } from "@/redux/features/partners/partnersApi";
import { PARTNER_STATUS } from "@/redux/features/partners/partners.types";

export function Sidebar({
  mobile,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: dashboardRes } = useGetDashboardOverviewQuery();
  const { data: reportedRes } = useGetPostsQuery({
    status: "reported",
    page: 1,
    limit: 1,
  });
  const { data: pendingPartnersRes } = useGetPartnersQuery(
    {
      status: PARTNER_STATUS.PENDING,
      page: 1,
      limit: 1,
    },
    { skip: true } // Skip partner badge query since partner module is inactive
  );

  const pendingVendors = (dashboardRes as any)?.data?.pendingVendors ?? 0;
  const reportedPosts = reportedRes?.pagination?.total ?? 0;
  const pendingPartners = pendingPartnersRes?.pagination?.total ?? 0;

  const badgeCount = (
    key?: "pendingVendors" | "reportedPosts" | "pendingPartners",
  ) => {
    if (key === "pendingVendors") return pendingVendors;
    if (key === "reportedPosts") return reportedPosts;
    if (key === "pendingPartners") return pendingPartners;
    return 0;
  };

  const isPathActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const isChildActive = (parent: NavItem, child: NavItem) =>
    location.pathname === child.path ||
    (child.path !== parent.path &&
      location.pathname.startsWith(`${child.path}/`));

  const isGroupActive = (item: NavItem) => {
    if (!item.children?.length) return isPathActive(item.path);
    return (
      item.children.some((child) => isChildActive(item, child)) ||
      isPathActive(item.path)
    );
  };

  const activeGroupKeys = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!item.children?.length) return false;
      return (
        item.children.some(
          (child) =>
            location.pathname === child.path ||
            (child.path !== item.path &&
              location.pathname.startsWith(`${child.path}/`)),
        ) ||
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
      );
    }).map((item) => item.key);
  }, [location.pathname]);

  const [openKeys, setOpenKeys] = useState<string[]>(() => activeGroupKeys);

  useEffect(() => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      activeGroupKeys.forEach((key) => next.add(key));
      return Array.from(next);
    });
  }, [activeGroupKeys]);

  const toggleGroup = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col border-r border-navy-700 bg-linear-to-b from-[#fcfdfc] to-[#f4f7f5] shadow-xs",
        mobile ? "" : "",
      )}
    >
      <div className="flex flex-col items-center px-2 py-2 border-b border-navy-700/60">
        <img
          src="/logo-ifundayiti-nav.png"
          alt="IFundAyiti"
          className="h-12 w-fit object-contain shrink-0"
        />
      </div>

      <nav className="mt-5 flex-1 space-y-6 overflow-y-auto px-4 pb-4 pt-1">
        <div className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            if (item.children?.length) {
              const open = openKeys.includes(item.key);
              const groupActive = isGroupActive(item);

              return (
                <div
                  key={item.key}
                  className={cn(
                    "overflow-hidden rounded-xl transition-all duration-300 border border-transparent",
                    open && "bg-black/1 border-black/[0.01]",
                    groupActive && open && "bg-violet-600/1",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.key)}
                    aria-expanded={open}
                    className={cn(
                      "surface-hover flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-all duration-200",
                      groupActive
                        ? "text-[#0B3D2E] font-semibold"
                        : "text-[#455850] hover:bg-black/3 hover:text-[#0B3D2E]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 shadow-xs",
                        groupActive
                          ? "bg-[#0B3D2E] text-white shadow-sm shadow-[#0b3d2e]/20"
                          : "bg-white border border-[#e2eae6] text-[#455850]",
                      )}
                    >
                      <item.icon />
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {!!badgeCount(item.badgeKey) && (
                      <Badge
                        count={badgeCount(item.badgeKey)}
                        size="small"
                        style={{
                          backgroundColor: groupActive ? "#0B3D2E" : "#E2EAE6",
                          color: groupActive ? "#fff" : "#455850",
                        }}
                      />
                    )}
                    <DownOutlined
                      className={cn(
                        "text-[9px] text-[#8ca399] transition-transform duration-300 ease-out",
                        open && "rotate-180 text-[#0b3d2e]",
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      open
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="relative ml-6.5 space-y-1 border-l border-[#e2eae6] py-1.5 pl-3 pr-1">
                        {open && (
                          <span className="pointer-events-none absolute -left-px top-2 bottom-2 w-px bg-linear-to-b from-[#0B3D2E]/60 via-[#E6D5B8]/30 to-transparent" />
                        )}
                        {item.children.map((child) => {
                          const childActive = isChildActive(item, child);
                          return (
                            <NavLink
                              key={child.key}
                              active={childActive}
                              icon={child.icon}
                              label={child.label}
                              badge={badgeCount(child.badgeKey)}
                              compact
                              onClick={() => {
                                navigate(child.path);
                                onNavigate?.();
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.key}
                active={isPathActive(item.path)}
                icon={item.icon}
                label={item.label}
                badge={badgeCount(item.badgeKey)}
                onClick={() => {
                  navigate(item.path);
                  onNavigate?.();
                }}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function NavLink({
  active,
  icon: Icon,
  label,
  badge,
  compact,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType;
  label: string;
  badge?: number;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "surface-hover relative flex w-full items-center gap-3 rounded-xl px-3 text-left text-[13.5px] font-medium transition-all duration-200 pl-4.5 border border-transparent",
        compact ? "py-2" : "py-2.5",
        active
          ? "bg-linear-to-r from-[#0B3D2E]/8 to-[#E6D5B8]/20 text-[#0B3D2E] font-semibold border-[#0B3D2E]/10 shadow-xs"
          : "text-[#455850] hover:bg-black/3 hover:text-[#0B3D2E]",
      )}
    >
      {active && (
        <span className="absolute left-1 top-2.5 bottom-2.5 w-0.75 rounded-full bg-[#0B3D2E]" />
      )}
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 shadow-xs",
          active
            ? "bg-[#0B3D2E] text-white shadow-sm shadow-[#0b3d2e]/15"
            : "bg-white border border-[#e2eae6] text-[#455850]",
        )}
      >
        <Icon />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {!!badge && (
        <Badge
          count={badge}
          size="small"
          style={{
            backgroundColor: active ? "#0B3D2E" : "#E2EAE6",
            color: active ? "#fff" : "#455850",
          }}
        />
      )}
    </button>
  );
}
