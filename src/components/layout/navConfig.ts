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
  PictureOutlined,
  AppstoreOutlined,
  SkinOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
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
import { DISCLAIMER_PAGES } from "@/features/disclaimer/disclaimerConfig";

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
  {
    key: "gallery",
    label: "Community Gallery",
    path: "/gallery",
    icon: PictureOutlined,
  },
  {
    key: "shop",
    label: "Shop",
    path: "/shop/products",
    icon: ShopOutlined,
    children: [
      {
        key: "shop-products",
        label: "Store",
        path: "/shop/products",
        icon: SkinOutlined,
      },
      {
        key: "shop-categories",
        label: "Product Category",
        path: "/shop/categories",
        icon: AppstoreOutlined,
      },
      {
        key: "shop-orders",
        label: "Orders",
        path: "/shop/orders",
        icon: ShoppingOutlined,
      },
    ],
  },
  {
    key: "team",
    label: "Team & Volunteers",
    path: "/team",
    icon: TeamOutlined,
  },
  {
    key: "partners",
    label: "Partners",
    path: "/partners",
    icon: SafetyCertificateOutlined,
    badgeKey: "pendingPartners",
  },
  {
    key: "disclaimer",
    label: "Disclaimer",
    path: "/disclaimer/user-terms",
    icon: FileTextOutlined,
    children: DISCLAIMER_PAGES.map((page) => ({
      key: `disclaimer-${page.type}`,
      label: page.label,
      path: page.path,
      icon: page.icon,
    })),
  },
];
