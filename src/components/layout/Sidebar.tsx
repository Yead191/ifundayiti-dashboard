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

export function Sidebar({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: dashboardRes } = useGetDashboardOverviewQuery();
  const { data: reportedRes } = useGetPostsQuery({ status: "reported", page: 1, limit: 1 });
  const { data: pendingPartnersRes } = useGetPartnersQuery({
    status: PARTNER_STATUS.PENDING,
    page: 1,
    limit: 1,
  });

  const pendingVendors = dashboardRes?.data?.pendingVendors ?? 0;
  const reportedPosts = reportedRes?.pagination?.total ?? 0;
  const pendingPartners = pendingPartnersRes?.pagination?.total ?? 0;

  const badgeCount = (key?: "pendingVendors" | "reportedPosts" | "pendingPartners") => {
    if (key === "pendingVendors") return pendingVendors;
    if (key === "reportedPosts") return reportedPosts;
    if (key === "pendingPartners") return pendingPartners;
    return 0;
  };

  const isPathActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isChildActive = (parent: NavItem, child: NavItem) =>
    location.pathname === child.path ||
    (child.path !== parent.path && location.pathname.startsWith(`${child.path}/`));

  const isGroupActive = (item: NavItem) => {
    if (!item.children?.length) return isPathActive(item.path);
    return item.children.some((child) => isChildActive(item, child)) || isPathActive(item.path);
  };

  const activeGroupKeys = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!item.children?.length) return false;
      return (
        item.children.some(
          (child) =>
            location.pathname === child.path ||
            (child.path !== item.path && location.pathname.startsWith(`${child.path}/`))
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
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  return (
    <div className={cn("flex h-full w-full flex-col border-r border-navy-700/60 bg-navy-850", mobile ? "" : "")}>
      <div className="flex flex-col items-center gap-2.5 px-5 pb-2 pt-6">
        <img src="/logo-hubology.svg" alt="Hubology" className="h-8 w-auto shrink-0" />
      </div>

      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.children?.length) {
              const open = openKeys.includes(item.key);
              const groupActive = isGroupActive(item);

              return (
                <div
                  key={item.key}
                  className={cn(
                    "overflow-hidden rounded-xl transition-colors duration-300",
                    open && "bg-white/2.5",
                    groupActive && open && "bg-violet-600/6"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.key)}
                    aria-expanded={open}
                    className={cn(
                      "surface-hover flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors duration-200",
                      groupActive
                        ? "text-cloud-100"
                        : "text-mist-400 hover:bg-white/4 hover:text-cloud-100"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                        groupActive
                          ? "bg-linear-to-br from-[#8131F0]/35 to-[#4A1C8A]/40 text-violet-glow"
                          : "bg-navy-800/80 text-mist-500"
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
                          backgroundColor: groupActive ? "#8131F0" : "#23274f",
                          color: groupActive ? "#fff" : "#c9cee8",
                        }}
                      />
                    )}
                    <DownOutlined
                      className={cn(
                        "text-[10px] text-mist-600 transition-transform duration-300 ease-out",
                        open && "rotate-180 text-violet-glow/80"
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="relative ml-5 space-y-0.5 border-l border-navy-600/50 py-1 pl-3 pr-1">
                        {open && (
                          <span className="pointer-events-none absolute -left-px top-2 bottom-2 w-px bg-linear-to-b from-violet-600/50 via-violet-600/20 to-transparent" />
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
        "surface-hover flex w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13.5px] font-medium transition-colors duration-200 pl-5",
        compact ? "py-1.5" : "py-2.5",
        active
          ? "bg-linear-to-r from-[#8131F0]/25 to-[#4A1C8A]/20 text-cloud-100 gradient-ring"
          : "text-mist-400 hover:bg-white/4 hover:text-cloud-100"
      )}
    >
      <Icon />
      <span className="flex-1 truncate">{label}</span>
      {!!badge && (
        <Badge
          count={badge}
          size="small"
          style={{ backgroundColor: active ? "#8131F0" : "#23274f", color: active ? "#fff" : "#c9cee8" }}
        />
      )}
    </button>
  );
}
