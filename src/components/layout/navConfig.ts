import {
  DashboardOutlined,
  CalendarOutlined,
  BookOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TagOutlined,
  TeamOutlined,
  ProjectOutlined,
  PictureOutlined,
  AppstoreOutlined,
  SkinOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  HeartOutlined,
  CreditCardOutlined,
  UserOutlined,
  QrcodeOutlined,
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
    key: "users",
    label: "Users",
    path: "/users",
    icon: UserOutlined,
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
    key: "donations",
    label: "Donations & Fund",
    path: "/donations",
    icon: HeartOutlined,
  },
  {
    key: "transactions",
    label: "Transactions",
    path: "/transactions",
    icon: CreditCardOutlined,
  },
  {
    key: "projects",
    label: "Projects",
    path: "/projects",
    icon: ProjectOutlined,
  },
  {
    key: "gallery",
    label: "Gallery",
    path: "/gallery",
    icon: PictureOutlined,
  },
  {
    key: "events",
    label: "Events & Tickets",
    path: "/events",
    icon: CalendarOutlined,
    children: [
      {
        key: "events-all",
        label: "All Events",
        path: "/events",
        icon: CalendarOutlined,
      },
      {
        key: "events-bookings",
        label: "Bookings & Tickets",
        path: "/event-bookings",
        icon: TeamOutlined,
      },
      {
        key: "events-checkin",
        label: "Live Check-In",
        path: "/event-checkin",
        icon: QrcodeOutlined,
      },
    ],
  },
  {
    key: "blogs",
    label: "Blogs",
    path: "/blogs",
    icon: FileTextOutlined,
    children: [
      {
        key: "blogs-all",
        label: "All Articles",
        path: "/blogs",
        icon: FileTextOutlined,
      },
      {
        key: "blogs-create",
        label: "Write Article",
        path: "/blogs/create",
        icon: EditOutlined,
      },
      {
        key: "blogs-categories",
        label: "Categories",
        path: "/blogs/categories",
        icon: TagOutlined,
      },
    ],
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
    key: "faq",
    label: "FAQ",
    path: "/faq",
    icon: QuestionCircleOutlined,
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
