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
    subtitle: "Official platform terms and community guidelines for IFundAyiti contributors, donors, and visitors.",
    icon: UserOutlined,
  },
  {
    type: "privacy",
    path: "/disclaimer/privacy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    subtitle: "How IFundAyiti collects, protects, and transparently manages user and donor data.",
    icon: SafetyCertificateOutlined,
  },
  {
    type: "refund",
    path: "/disclaimer/refund",
    label: "Refund Policy",
    title: "Refund Policy",
    subtitle: "Guidelines and procedures governing donations, grant commitments, and merchandise store orders.",
    icon: DollarOutlined,
  },
];

export function getDisclaimerConfig(
  type: string | undefined,
): DisclaimerPageConfig | undefined {
  return DISCLAIMER_PAGES.find((page) => page.type === type);
}

export function isDisclaimerType(
  value: string | undefined,
): value is DisclaimerType {
  return DISCLAIMER_PAGES.some((page) => page.type === value);
}
