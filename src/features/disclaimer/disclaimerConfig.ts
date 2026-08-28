import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import type { DisclaimerType } from "@/redux/features/disclaimer/disclaimer.types";

export interface DisclaimerPageConfig {
  type: DisclaimerType;
  path: string;
  label: string;
  title: string;
  subtitle: string;
  icon: typeof UserOutlined;
}

export const DISCLAIMER_PAGES: DisclaimerPageConfig[] = [
  {
    type: "user-terms",
    path: "/disclaimer/user-terms",
    label: "User Terms & Conditions",
    title: "User Terms & Conditions",
    subtitle: "Legal terms shown to users on the Hubology website",
    icon: UserOutlined,
  },
  {
    type: "vendor-terms",
    path: "/disclaimer/vendor-terms",
    label: "Vendor Terms & Conditions",
    title: "Vendor Terms & Conditions",
    subtitle: "Terms and obligations for vendors on the platform",
    icon: TeamOutlined,
  },
  {
    type: "privacy",
    path: "/disclaimer/privacy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    subtitle: "How Hubology collects, uses, and protects personal data",
    icon: SafetyCertificateOutlined,
  },
  {
    type: "refund",
    path: "/disclaimer/refund",
    label: "Refund Policy",
    title: "Refund Policy",
    subtitle: "Refund rules and eligibility for purchases and services",
    icon: DollarOutlined,
  },
];

export function getDisclaimerConfig(type: string | undefined): DisclaimerPageConfig | undefined {
  return DISCLAIMER_PAGES.find((page) => page.type === type);
}

export function isDisclaimerType(value: string | undefined): value is DisclaimerType {
  return DISCLAIMER_PAGES.some((page) => page.type === value);
}
