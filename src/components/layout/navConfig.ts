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
    key: "services",
    label: "Services",
    path: "/services",
    icon: AppstoreOutlined,
    children: [
      {
        key: "services-manage",
        label: "Manage services",
        path: "/services",
        icon: SettingOutlined,
      },
      {
        key: "services-bookings",
        label: "Service bookings",
        path: "/services/bookings",
        icon: BookOutlined,
      },
    ],
  },
  {
    key: "vendors",
    label: "Vendors",
    path: "/vendors",
    icon: TeamOutlined,
    badgeKey: "pendingVendors",
  },
  {
    key: "users",
    label: "Users",
    path: "/users",
    icon: UserOutlined,
  },
  // {
  //   key: "ifundayiti",
  //   label: "IFundAyiti",
  //   path: "/ifundayiti",
  //   icon: HeartOutlined,
  //   children: [
  //     { key: "ifundayiti-overview", label: "Overview", path: "/ifundayiti", icon: PieChartOutlined },
  //     { key: "ifundayiti-applications", label: "Applications", path: "/ifundayiti/applications", icon: FileSearchOutlined },
  //     { key: "ifundayiti-periods", label: "Application Periods", path: "/ifundayiti/periods", icon: CalendarOutlined },
  //     { key: "ifundayiti-donations", label: "Donations", path: "/ifundayiti/donations", icon: DollarOutlined },
  //   ],
  // },
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
    key: "membership",
    label: "Membership",
    path: "/membership",
    icon: CrownOutlined,
    children: [
      {
        key: "membership-plans",
        label: "Manage plans",
        path: "/membership",
        icon: CrownOutlined,
      },
      {
        key: "membership-faq",
        label: "Manage FAQ",
        path: "/membership/faq",
        icon: QuestionCircleOutlined,
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
    key: "forum",
    label: "Forum moderation",
    path: "/forum",
    icon: MessageOutlined,
    badgeKey: "reportedPosts",
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
    key: "partners",
    label: "Partners",
    path: "/partners",
    icon: ApartmentOutlined,
    badgeKey: "pendingPartners",
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
