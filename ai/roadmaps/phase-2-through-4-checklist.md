# Phase 2–4 Roadmap Tracker

Use this checklist to show Casey how documents drive the implementation. Keep each task updated with the completion date, git commit, and responsible teammate.

## Phase 2 — Flyer Upload (MVP)

| Task | Description | Acceptance Criteria | Status / Commit |
| --- | --- | --- | --- |
| Upload UI basics | Build the `/upload` page with CTA, drag & drop zone, preview, and guided form copy from the PRD. | Mobile-first form renders, file picker works, preview appears, CTA/button states match design. | |
| Upload progress & validation | Show progress, disable submit while uploading, validate JPEG/PNG <= 10MB, and surface errors. | Upload button disabled during upload, size validation error shown, progress indication visible. | |
| Backend upload + Firestore | Implement `/api/upload` route that stores in Firebase Storage + Firestore document. | File lands in Firebase Storage, Firestore `flyers` doc created with required fields, route returns flyerId. | |
| Recent uploads list | Display last 10 uploads on upload page with thumbnails, status, timestamps. | UI shows 10 items sorted by newest, real Firestore data populates list, fallback message for empty state. | |

## Phase 3 — Landing Page Interactive Fullness

| Task | Description | Acceptance Criteria | Status / Commit |
| --- | --- | --- | --- |
| Navigation & hero CTAs | Create floating nav pill with name and CTAs + hero copy with gradient “nearby” word and support text. | Nav shows brand name, upload/feed buttons; hero text, badge, and CTA buttons match spec. | |
| Hero visual preview | Build the interactive preview block with card frame, skeleton feed cards, floating chips, and drop shadows. | Card with gradient, skeleton content, floating chips animating (respects `prefers-reduced-motion`), background dots present. | |
| Microinteractions | Add hover/presseffects for buttons, cards, and chips while keeping motion lightweight. | Buttons scale on hover/active, cards lift with shadow, chips have gentle float animation. | |
| Accessibility/quality | Respect `prefers-reduced-motion`, ensure color contrast, no layout shifts, mobile-first layout. | Animations disabled when requested, contrast ratio >= 4.5:1, mobile view looks polished on 375px width. | |

## Phase 4 — UI Redesign Across Pages

| Task | Description | Acceptance Criteria | Status / Commit |
| --- | --- | --- | --- |
| Landing page refresh | Redesign hero + sections (how it works, stats, callout) per UI guidelines (max-w, spacing). | Landing page matches new layout, sections stacked with clean cards, CTA buttons copy updated. | |
| Feed page redesign | Build search bar, filter chips, event cards w/ status/datetime, link to event detail view placeholder. | Event cards show required info, filter chips render, cards link to detail page, map view button present. | |
| Upload flow polish | Retool upload page into guided three-step flow with success state and recent uploads reminders. | Flow matches spec (upload → preview → confirm), success message with link to feed, recent uploads list showing 10 items. | |
| Event detail prototype | Build minimal event detail page/modal with flyer image, location/time, “report inaccurate” UI. | Detail page displays image, info, CTA, and has a back link. | |
| Shared components & states | Add reusable `<PageHeader>`, `<PrimaryButton>`, `<EmptyState>`, `<SkeletonCard>`, consistent spacing, nav. | Components live in `/components`, reused across pages, skeletons show while loading, empty states match spec. | |
| Loading / error handling | Provide skeleton loaders and friendly error messages across landing/feed/upload routes. | Each async fetch shows skeleton/loader, error state displays user-facing message, logging captures failures. | |
