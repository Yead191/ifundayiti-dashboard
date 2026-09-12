import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Drawer } from "antd";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_META: { match: (path: string) => boolean; title: string; subtitle?: string }[] = [
  // Overview
  { match: (p) => p === "/", title: "Overview", subtitle: "Micro grant program overview and analytics" },

  // Grant Cycles & Applications
  { match: (p) => p.startsWith("/applications/"), title: "Application details", subtitle: "Review applicant submission, project proposal, and grant status" },
  { match: (p) => p === "/applications", title: "Applications", subtitle: "Manage every application through its full lifecycle" },
  { match: (p) => p === "/periods", title: "Grant Cycles", subtitle: "Create and manage application periods and funding windows" },

  // Donations
  { match: (p) => p === "/donations", title: "Donations", subtitle: "Monitor donations to the IFundAyiti Program Fund" },

  // Community Projects
  { match: (p) => p.startsWith("/projects/"), title: "Project details", subtitle: "Inspect project overview, narrative, and media" },
  { match: (p) => p === "/projects", title: "Community Projects", subtitle: "Publish and spotlight funded community projects" },

  // Gallery & Albums
  { match: (p) => p.startsWith("/gallery/folder/") || (p.startsWith("/gallery/") && p !== "/gallery"), title: "Album Gallery", subtitle: "Browse and manage photos in this album" },
  { match: (p) => p === "/gallery", title: "Gallery", subtitle: "Organize photos into categorized album folders" },

  // Editorial & Blogs
  { match: (p) => p === "/blogs/create", title: "Write Article", subtitle: "Craft an editorial article with rich formatted text and media" },
  { match: (p) => p.startsWith("/blogs/edit/"), title: "Edit Article", subtitle: "Update article narrative, cover photo, and publishing settings" },
  { match: (p) => p === "/blogs/categories", title: "Blog Categories", subtitle: "Organize articles and field stories into thematic categories" },
  { match: (p) => p.startsWith("/blogs/") && p !== "/blogs", title: "Article Details", subtitle: "Preview story layout, reading metrics, and editorial settings" },
  { match: (p) => p === "/blogs" || p === "/blog", title: "Editorial & Blogs", subtitle: "Publish and moderate field stories, dispatches, and updates" },

  // Shop & Merchandise
  { match: (p) => p.startsWith("/shop/orders/"), title: "Order details", subtitle: "Inspect items, customer delivery destination, and fulfillment" },
  { match: (p) => p === "/shop/orders" || p === "/store/orders", title: "Store Orders", subtitle: "Monitor customer purchases, payment receipts, and pre-order batches" },
  { match: (p) => p.startsWith("/shop/products/"), title: "Product details", subtitle: "Inspect inventory, pricing, variants, and product media" },
  { match: (p) => p === "/shop/products" || p === "/shop", title: "Products Catalog", subtitle: "Manage merchandise, digital assets, and apparel inventory" },
  { match: (p) => p === "/shop/categories", title: "Product Categories", subtitle: "Organize merchandise into browsable shop categories" },

  // Store legacy / support routes
  { match: (p) => p.startsWith("/store/refunds/"), title: "Refund review", subtitle: "Inspect the request, evidence, and issue a decision" },
  { match: (p) => p === "/store/refunds", title: "Refund requests", subtitle: "Review and action customer refund requests" },
  { match: (p) => p === "/store/coupons", title: "Discount coupons", subtitle: "Create promo codes with percentage or fixed discounts" },
  { match: (p) => p === "/store", title: "Store catalog", subtitle: "Curate digital downloads and office essentials" },

  // Team & Volunteers
  { match: (p) => p === "/team", title: "Team & Volunteers", subtitle: "Moderate volunteer applicants and manage the core team" },

  // Partners
  { match: (p) => p.startsWith("/partners/") || p.startsWith("/partner/"), title: "Partner details", subtitle: "Review partner organization profile, collaboration status, and credentials" },
  { match: (p) => p === "/partners" || p === "/partner", title: "Partners", subtitle: "Manage verified partners, NGO collaborations, and institutional alliances" },

  // Events
  { match: (p) => p.startsWith("/events/"), title: "Event details", subtitle: "Review schedule, media, and organization details" },
  { match: (p) => p === "/events", title: "Events", subtitle: "Publish and manage workshops, meetups, and conferences" },

  // FAQ Management
  { match: (p) => p === "/faq" || p.startsWith("/faq"), title: "FAQ Management", subtitle: "Manage categorized questions and answers displayed across the storefront" },

  // Legal & Disclaimers
  { match: (p) => p.startsWith("/disclaimer/"), title: "Legal & Disclaimers", subtitle: "Edit terms of service, privacy policy, and public disclosures" },

  // Profile
  { match: (p) => p === "/profile", title: "Your profile", subtitle: "Update your name, photo, and account password" },
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
