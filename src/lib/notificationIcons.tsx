import React from "react";
import {
  HeartFilled,
  ShoppingFilled,
  CrownFilled,
  FileTextFilled,
  DollarCircleFilled,
  BellFilled,
  SafetyCertificateFilled,
  ProjectFilled,
  CalendarFilled,
} from "@ant-design/icons";

export interface NotificationVisualMeta {
  icon: React.ReactNode;
  category: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
}

export function getNotificationVisualMeta(title = "", path = ""): NotificationVisualMeta {
  const t = title.toLowerCase();
  const p = path.toLowerCase();

  // 1. Donation / Funds
  if (t.includes("donat") || t.includes("fund") || p.includes("donation")) {
    return {
      icon: <HeartFilled className="text-emerald-600" />,
      category: "Donation",
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-700",
      borderClass: "border-emerald-200/80",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }

  // 2. Orders & Merchandise
  if (t.includes("order") || t.includes("purchas") || p.includes("order") || p.includes("shop")) {
    return {
      icon: <ShoppingFilled className="text-sky-600" />,
      category: "Order",
      bgClass: "bg-sky-50",
      textClass: "text-sky-700",
      borderClass: "border-sky-200/80",
      badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
    };
  }

  // 3. Refunds
  if (t.includes("refund") || p.includes("refund")) {
    return {
      icon: <DollarCircleFilled className="text-rose-600" />,
      category: "Refund",
      bgClass: "bg-rose-50",
      textClass: "text-rose-700",
      borderClass: "border-rose-200/80",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    };
  }

  // 4. Membership / Subscriptions
  if (t.includes("member") || t.includes("subscri") || p.includes("subscri") || p.includes("membership")) {
    return {
      icon: <CrownFilled className="text-amber-600" />,
      category: "Membership",
      bgClass: "bg-amber-50",
      textClass: "text-amber-700",
      borderClass: "border-amber-200/80",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }

  // 5. Grants / Applications
  if (t.includes("grant") || t.includes("appli") || p.includes("application") || p.includes("period")) {
    return {
      icon: <FileTextFilled className="text-purple-600" />,
      category: "Application",
      bgClass: "bg-purple-50",
      textClass: "text-purple-700",
      borderClass: "border-purple-200/80",
      badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    };
  }

  // 6. Projects
  if (t.includes("project") || p.includes("project")) {
    return {
      icon: <ProjectFilled className="text-indigo-600" />,
      category: "Project",
      bgClass: "bg-indigo-50",
      textClass: "text-indigo-700",
      borderClass: "border-indigo-200/80",
      badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
  }

  // 7. Events
  if (t.includes("event") || p.includes("event")) {
    return {
      icon: <CalendarFilled className="text-cyan-600" />,
      category: "Event",
      bgClass: "bg-cyan-50",
      textClass: "text-cyan-700",
      borderClass: "border-cyan-200/80",
      badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };
  }

  // 8. Partners
  if (t.includes("partner") || p.includes("partner")) {
    return {
      icon: <SafetyCertificateFilled className="text-teal-600" />,
      category: "Partner",
      bgClass: "bg-teal-50",
      textClass: "text-teal-700",
      borderClass: "border-teal-200/80",
      badgeClass: "bg-teal-100 text-teal-800 border-teal-200",
    };
  }

  // Fallback: System Notification
  return {
    icon: <BellFilled className="text-[#0B3D2E]" />,
    category: "System",
    bgClass: "bg-emerald-50/70",
    textClass: "text-[#0B3D2E]",
    borderClass: "border-emerald-200/60",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}
