import {
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingOutlined,
  CrownOutlined,
  HistoryOutlined,
  MessageOutlined,
  SettingOutlined,
  BookOutlined,
  UserOutlined,
  CommentOutlined,
  FormOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  TagOutlined,
  RollbackOutlined,
  CalendarOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import type { ComponentType } from "react";
import { DISCLAIMER_PAGES } from "@/features/disclaimer/disclaimerConfig";

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ComponentType;
  children?: NavItem[];
  badgeKey?: "pendingVendors" | "reportedPosts" | "pendingPartners";
}

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", path: "/", icon: DashboardOutlined },
  {
    key: "users",
    label: "Users",
    path: "/users",
    icon: UserOutlined,
  },
  {
    key: "store",
    label: "Store",
    path: "/store",
    icon: ShopOutlined,
    children: [
      {
        key: "store-catalog",
        label: "Catalog",
        path: "/store",
        icon: ShopOutlined,
      },
      {
        key: "store-orders",
        label: "Manage orders",
        path: "/store/orders",
        icon: ShoppingOutlined,
      },
      {
        key: "store-coupons",
        label: "Discount coupons",
        path: "/store/coupons",
        icon: TagOutlined,
      },
      {
        key: "store-refunds",
        label: "Refunds",
        path: "/store/refunds",
        icon: RollbackOutlined,
      },
    ],
  },
  {
    key: "transactions",
    label: "Transactions",
    path: "/transactions",
    icon: HistoryOutlined,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    path: "/testimonials",
    icon: CommentOutlined,
  },
  {
    key: "events",
    label: "Events",
    path: "/events",
    icon: CalendarOutlined,
  },
  {
    key: "inquiries",
    label: "Inquiries",
    path: "/inquiries",
    icon: FormOutlined,
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
