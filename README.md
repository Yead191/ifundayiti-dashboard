# Hubology Admin Dashboard

A premium, dark-themed admin dashboard for managing the Hubology platform — built to match the frontend's design system (deep navy base, violet aurora gradients, glassmorphic panels) using React 19, TypeScript, Tailwind CSS v4, and Ant Design v6.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. You'll land on the login screen.

**Demo login:**
- Email: `admin@hubology.com`
- Password: `hubology2026`

(Click "Autofill" on the login screen to fill these in for you.)

```bash
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## What's included

All data is realistic mock data held in memory (see `src/features/*/mockData.ts`) — nothing persists across a refresh yet, since there's no backend wired up. Every module below is fully functional: create, edit, delete, search, filter, and (where relevant) status workflows all work against this in-memory data.

| Module | Route | What it does |
|---|---|---|
| Overview | `/` | Snapshot stats, pending items needing attention, membership snapshot |
| Services | `/services` | CRUD for consulting service packages shown on the services directory |
| Vendor applications | `/vendors/applications` | Review queue for incoming expert applications — approve or reject with a reason |
| Vendors | `/vendors` | Full vendor directory across all statuses; profile drawer, edit, add, remove; subscription status shown for approved vendors |
| Store | `/store` | Tabbed CRUD for Digital Products and Office Supplies, including product detail drawers with review moderation |
| Membership | `/membership` | Pricing-card management for membership tiers, with a monthly/yearly preview toggle |
| Forum moderation | `/forum` | Queue of community-reported posts — dismiss the report, remove the post, or restore/delete a removed post |

Every list has search/filtering where it matters, every destructive action asks for confirmation first, and toasts (via `sonner`) confirm the result of every action.

## Project structure

```
src/
├─ app/                    # App-wide providers (theme, contexts, toaster)
├─ components/
│  ├─ layout/               # Sidebar, Topbar, DashboardLayout, nav config
│  └─ ui/                   # Reusable primitives: GlassCard, StatusTag, StatCard,
│                            # ConfirmDeleteModal, EmptyState, RatingStars, PageToolbar...
├─ features/
│  ├─ auth/                 # Mock auth context, protected route, login page
│  ├─ dashboard/            # Overview page
│  ├─ services/             # Types, mock data, context, page, form modal
│  ├─ vendors/               # Applications + directory pages, profile drawer,
│  │                          # review (approve/reject) modal, edit form modal
│  ├─ store/                 # Digital products + office supplies, tabs, forms,
│  │                          # shared product detail drawer with review moderation
│  ├─ membership/            # Plan cards, form modal
│  └─ forum/                 # Moderation queue, reported-post drawer
├─ hooks/                    # useConfirmDelete -- shared delete-confirmation flow
├─ lib/                      # utils, shared constants, Ant Design theme tokens
└─ types/                    # Shared cross-feature types
```

Each feature module is self-contained: its own `types.ts`, `mockData.ts`, a React Context that owns the CRUD state, a page component, and a `components/` folder for modals/drawers specific to that feature. This keeps things easy to find and makes it straightforward to swap any feature's mock data source for real API calls later without touching the UI.

## Wiring a real backend later

Every context (`ServicesContext`, `VendorsContext`, `StoreContext`, `MembershipContext`, `ForumContext`) currently seeds `useState` from a local `mockData.ts` and mutates it directly. To connect a real API:

1. Replace the initial `useState(INITIAL_X)` with a data-fetching hook (React Query, SWR, or a simple `useEffect` + `fetch`).
2. Replace each mutator (`addX`, `updateX`, `removeX`, etc.) with an API call, then update local state from the response (or refetch).
3. Everything downstream -- pages, modals, drawers -- reads from context and doesn't know or care where the data comes from, so no other changes are needed.

The vendor **approve/reject** flow and forum **dismiss/remove/restore** flow are the two places with real workflow logic (status transitions + timestamps) -- worth reviewing first since a real backend will likely want to own that logic.

## Design system

Matches the Hubology frontend: deep navy background (`#090B1B`), violet gradient accents (`#8131F0` -> `#4A1C8A`), glassmorphic panels with a 1px gradient hairline border, aurora glow accents used sparingly on hero/overview surfaces, Sora for display type and Manrope for body text. Tokens live in `src/index.css` (Tailwind v4 `@theme`) and `src/lib/theme.ts` (Ant Design component tokens) -- update both together if the palette changes.

## Notes & assumptions

- **Auth** is a mock check against a single hardcoded admin account -- there's no real backend, so treat this as a UI shell for when auth is wired up.
- **File uploads** (e.g. the digital product's PDF) are plain URL fields for now -- swap for a real upload widget once storage is wired up.
- **Reviews** are shown read-only with a moderation-only delete action, since ratings/reviews are meant to originate from the frontend/backend, not be authored by admins.
- iFundAyiti management was intentionally left out of this pass, as noted -- happy to build it as a follow-up whenever you're ready.
