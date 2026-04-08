# UI Redesign — Scavenger (Campus Food Finder)

## Goal
Redesign the entire UI to feel modern, mobile-first, and “consumer app quality.”
Prioritize clarity, speed, and a delightful experience.

## Scope (Pages)
Redesign these pages/components:
1) Landing page (/)
2) Feed page (/feed)
3) Upload flyer page (/upload)
4) Event detail page (/events/[id]) (if exists; otherwise create minimal)
5) Shared layout: header/nav, spacing, typography, empty states, loading states

## Brand + Style Direction
- Vibe: clean, modern, slightly playful (student-friendly), high trust
- Mobile-first, works great on iPhone widths
- Use Tailwind; avoid heavy new UI libraries unless already used
- Typography: clear hierarchy (big headlines, readable body)
- Layout: card-based feed, generous spacing, strong CTAs
- Use subtle motion (hover/press states) but keep it lightweight
- Design target: “simple, clean, modern UI similar to Stripe/Linear-level spacing and hierarchy, but slightly playful for students.”

## IA / UX Requirements
### Global
- Sticky top nav with:
  - Logo/name (“Food Finder”)
  - Primary actions: Feed, Upload
- Consistent page max width (e.g., max-w-3xl) and padding
- Skeleton loaders for async content
- Empty states that tell user what to do next
- Error states that are human-readable

### Landing Page (/)
Goal: convert to “Open feed” or “Upload flyer”
Sections:
- Hero: clear one-liner + CTA buttons
- How it works: 3-step explanation
- Social proof / stats (placeholder)
- Callout: “Help your campus waste less food”
- Footer

### Feed (/feed)
- Search bar (MVP: client-side filter ok)
- Event cards show:
  - title
  - time window (or “Today”/“Now” if available)
  - location
  - “verified/confidence” badge if available (placeholder ok)
  - thumbnail image
- Filter chips: Today / This Week / All (UI only is fine)
- Tapping a card goes to event detail page

### Upload (/upload)
- Simple, guided flow:
  1) Upload photo
  2) Show preview
  3) Confirm + submit
- Show upload progress
- After upload success: link to feed + show "recent uploads"

### Event Detail (/events/[id])
- Large title
- Key info: location, time, description
- Flyer image
- “Report inaccurate” link (UI only ok)

## Component Rules
- Build reusable components:
  - <PageHeader />
  - <PrimaryButton />
  - <EventCard />
  - <EmptyState />
  - <SkeletonCard />
- Keep components in /components and logic in /services or /lib

## Acceptance Criteria
- UI looks consistent across all pages
- Mobile experience is excellent
- Clear navigation between pages
- Feed and upload flows feel simple and obvious
- Loading + empty + error states exist everywhere needed
- No broken routes
- No scope creep beyond UI (don’t change backend logic unless required to support UI)
