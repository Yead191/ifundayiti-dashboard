import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Drawer } from "antd";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_META: { match: (path: string) => boolean; title: string; subtitle?: string }[] = [
  { match: (p) => p === "/", title: "Overview", subtitle: "Micro grant program overview and analytics" },
  { match: (p) => p.startsWith("/shop/orders/"), title: "Order details", subtitle: "Inspect items, customer delivery destination, and fulfillment" },
  { match: (p) => p === "/shop/orders" || p === "/store/orders", title: "Store Orders", subtitle: "Monitor customer purchases, payment receipts, and pre-order batches" },
  { match: (p) => p.startsWith("/store/refunds/"), title: "Refund review", subtitle: "Inspect the request, evidence, and issue a decision" },
  { match: (p) => p === "/store/refunds", title: "Refund requests", subtitle: "Review and action customer refund requests" },
  { match: (p) => p === "/store/coupons", title: "Discount coupons", subtitle: "Create promo codes with percentage or fixed discounts" },
  { match: (p) => p === "/store", title: "Store catalog", subtitle: "Curate digital downloads and office essentials" },
  { match: (p) => p.startsWith("/events/"), title: "Event details", subtitle: "Review schedule, media, and organization details" },
  { match: (p) => p === "/events", title: "Events", subtitle: "Publish and manage workshops, meetups, and conferences" },
  { match: (p) => p === "/profile", title: "Your profile", subtitle: "Update your name, photo, and account password" },
  { match: (p) => p === "/applications", title: "Applications", subtitle: "Manage every application through its full lifecycle" },
  { match: (p) => p === "/periods", title: "Application periods", subtitle: "Create and manage grant cycles" },
  { match: (p) => p === "/donations", title: "Donations", subtitle: "Monitor donations to the IFundAyiti Program Fund" },
  { match: (p) => p === "/team", title: "Team & Volunteers", subtitle: "Moderate volunteer applicants and manage the core team" },
  { match: (p) => p.startsWith("/projects/"), title: "Project details", subtitle: "Inspect project overview, narrative, and media" },
  { match: (p) => p === "/projects", title: "Community Projects", subtitle: "Publish and spotlight funded community projects" },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const meta = useMemo(() => {
    return (
      PAGE_META.find((m) => m.match(location.pathname)) ?? {
        match: () => false,
        title: "IFundAyiti Admin",
        subtitle: undefined,
      }
    );
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900">
      <aside className="hidden w-63 shrink-0 md:block">
        <Sidebar />
      </aside>

      <Drawer
        placement="left"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        closable={false}
        size={252}
        styles={{ body: { padding: 0 }, content: { background: "transparent" } }}
      >
        <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={meta.title} subtitle={meta.subtitle} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-7 md:py-7">
          <div className="mx-auto w-full max-w-350">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
