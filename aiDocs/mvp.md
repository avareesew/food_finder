# MVP Specification: Scavenger
## What Was Built + What the Demo Shows

**Version:** 2.0 (Post-Pivot)
**Date:** April 6, 2026
**Status:** Phase 1 Complete — Final Sprint Demo

---

## What's Built and Working

The following is the actual state of the codebase as of April 6, 2026. This is not a wishlist — this is what exists.

### Core Pipeline (End-to-End Working)
1. **Flyer / image upload** — Drag-and-drop UI, Firebase Storage or local filesystem
2. **OpenAI gpt-4o-mini extraction** — Extracts title, host, location, date, time, food from image
3. **Validation** — Rejects extractions missing date, time, or place
4. **Firestore storage** — Valid extractions stored in `flyers` collection
5. **Feed display** — Event cards on `/feed`, sorted with active events first
6. **Event detail** — Full detail view at `/events/[id]` with flyer image, badges, food info

### Slack Ingestion (Backend Built, No Frontend Yet)
- `src/backend/slack/runSlackIngest.ts` — Full Slack channel ingestion pipeline
- `src/backend/slack/slackClient.ts` — Slack API client
- `src/backend/slack/slackDedupe.ts` — Deduplication logic
- `src/backend/openai/extractEventsFromSlackText.ts` — Text → event extraction
- `src/app/api/cron/slack-ingest/route.ts` — Cron-triggered ingestion
- **Missing:** UI for club leaders to connect their Slack channel

### Auth System (Built)
- Login page (`/login`), register/me/sync-profile API routes
- `AuthProvider`, user profiles in Firestore, bearer token verification
- Admin page (`/admin`) with user management

### Pages
- `/` — Home: hero, weekly calendar, discover preview, map CTA
- `/feed` — Event feed with card grid
- `/upload` — Flyer upload with `UploadAuthGate`
- `/events/[id]` — Event detail
- `/explore` — Campus buildings explorer
- `/about` — Mission and how it works
- `/admin` — Admin user management (auth-gated)

### UI Components
- `EventCard`, `LocalEventCard`, `EventDetailModal`
- `CampusBuildingMap`, `CampusBuildingsExplorer`
- `WeeklyEventCalendar`
- `UploadForm` (full drag-and-drop, extraction display, validation feedback)
- `UploadAuthGate` (requires auth for upload)
- `ThemeToggle` (dark/light mode)
- `Navbar`

### Utilities
- `matchByuBuilding.ts` — Fuzzy building name matching
- `eventTiming.ts` — Campus timezone, date coercion, expiry detection
- `validateFlyerExtraction.ts` — Required field validation
- `foodEmoji.ts` — Food category → emoji mapping
- `homeDiscoverPreview.ts` — Flyer → preview card conversion
- `slackIngestEnv.ts` — Slack config helpers

---

## What's NOT Built Yet

| Feature | Why It Matters | Priority |
|---------|---------------|----------|
| "Mark as Gone" UI | Stale data = ghost chases = trust loss | Pre-alpha blocker |
| Email ingestion UI | The #1 validated feature (9.7/10 avg) | High |
| Real-time `onSnapshot` | Feed doesn't update without refresh | Pre-alpha blocker |
| Confirmation/edit form for AI output | Users can't correct bad extractions | Pre-alpha blocker |
| Vercel production deployment | Required for alpha testing | Pre-alpha blocker |
| Requirements / Expectations field on pins | Requested by 2/3 Round 2 clubs | Next build |
| Club Link field on pins | Requested by 2/3 Round 2 clubs | Next build |
| Scarcity note on pins | Requested by Women of Accountancy | Next build |

---

## April 8 Demo Flow

The demo shows the **pivot story** — not the original flyer-scanning concept.

### Demo Narrative
> "At midterm, we thought students would scan physical flyers. We learned clubs communicate digitally and the real customer is club presidents who want zero-effort automation. So we pivoted to email/text ingestion with AI, and added map + filtering as our differentiator over GroupMe."

### Live Demo Steps

**Step 1 — Show the student view:**
- Open `/feed` on mobile
- Show event cards: food type, location, time, active badges
- Tap a card → event detail modal
- Open `/explore` → campus building map with event pins

**Step 2 — Show the club leader view (upload):**
- Navigate to `/upload`
- Upload a flyer image (have 2–3 prepared)
- Show AI extraction running
- Show the extracted event appear in the feed

**Step 3 — Tell the automation story (even if not fully built):**
- Show the Slack ingestion backend code (`src/backend/slack/`)
- Explain: "This is already built on the backend. When a club posts in Slack, this runs automatically."
- Show what a zero-effort pin creation looks like

### Demo Prep Checklist
- [ ] 2–3 real flyer images ready to upload
- [ ] Feed pre-seeded with 3–5 events (not all from today)
- [ ] App running on mobile (not just desktop)
- [ ] Fallback screenshots if live demo fails
- [ ] `npm run dev` starts clean with no errors

---

## What the Demo Answers

- ✅ Can AI extract event details from a flyer accurately?
- ✅ Is the mobile UX intuitive?
- ✅ Does the map + filter approach beat GroupMe for discoverability?
- ✅ Do club leaders understand the zero-effort value prop?

## What the Demo Doesn't Answer (Requires Alpha)

- ❌ Will club leaders actually connect their channels?
- ❌ Will students browse consistently?
- ❌ How quickly does stale data become a problem?

---

## Next Build Priorities (Post-April 8)

1. "Mark as Gone" toggle (status update on event detail page)
2. Email ingestion UI (club leader connects email → events auto-ingest)
3. Real-time `onSnapshot` on feed
4. Requirements and Club Link fields on event pins
5. Vercel production deployment + custom domain
6. Recruit 5–10 sub-association leaders for alpha testing
