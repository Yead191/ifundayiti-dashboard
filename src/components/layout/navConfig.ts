import {
  DashboardOutlined,
  CalendarOutlined,
  BookOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TagOutlined,
  RollbackOutlined,
  HistoryOutlined,
  TeamOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import type { ComponentType } from "react";

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ComponentType;
  children?: NavItem[];
  badgeKey?: "pendingVendors" | "reportedPosts" | "pendingPartners";
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "overview",
    label: "Overview",
    path: "/",
    icon: DashboardOutlined,
  },
  {
    key: "periods",
    label: "Grant Cycles",
    path: "/periods",
    icon: CalendarOutlined,
  },
  {
    key: "applications",
    label: "Applications",
    path: "/applications",
    icon: BookOutlined,
  },
  {
    key: "projects",
    label: "Projects",
    path: "/projects",
    icon: ProjectOutlined,
  },
  // {
  //   key: "store",
  //   label: "Store",
  //   path: "/store",
  //   icon: ShopOutlined,
  //   children: [
  //     {
  //       key: "store-catalog",
  //       label: "Catalog",
  //       path: "/store",
  //       icon: ShopOutlined,
  //     },
  //     {
  //       key: "store-orders",
  //       label: "Manage orders",
  //       path: "/store/orders",
  //       icon: ShoppingOutlined,
  //     },
  //     {
  //       key: "store-coupons",
  //       label: "Discount coupons",
  //       path: "/store/coupons",
  //       icon: TagOutlined,
  //     },
  //     {
  //       key: "store-refunds",
  //       label: "Refunds",
  //       path: "/store/refunds",
  //       icon: RollbackOutlined,
  //     },
  //   ],
  // },
  // {
  //   key: "events",
  //   label: "Events",
  //   path: "/events",
  //   icon: CalendarOutlined,
  // },
  // {
  //   key: "donations",
  //   label: "Finances & Donations",
  //   path: "/donations",
  //   icon: HistoryOutlined,
  // },
  {
    key: "team",
    label: "Team & Volunteers",
    path: "/team",
    icon: TeamOutlined,
  },
];
