# CLAUDE.md — Scavenger / Food Finder

## What This Project Is

**Scavenger** is a BYU campus food discovery platform. Club leaders post food events to their official Slack or email channels; Scavenger automatically ingests those posts and pins them to a live campus map. Students find free food anonymously, no login required.

**Current state (April 2026):** Final sprint. Presentations April 8, 13, 15. Phase 1 (core pipeline) complete. Building demo and alpha prep.

---

## Documentation Structure

| Folder | Purpose | Tracked in Git? |
|--------|---------|-----------------|
| `aiDocs/` | Source of truth — architecture, PRD, MVP, changelog, coding style | ✅ Yes |
| `ai/notes/` | Interview notes, sprint plans, brainstorming | ✅ Yes |
| `ai/roadmaps/` | Current roadmap, roadmap tracker | ✅ Yes |
| `ai/roadmaps/archived/` | Old flyer-era phase plans (pre-pivot) | ✅ Yes |
| `ai/guides/` | API docs, market research | ✅ Yes |

**Always update `aiDocs/changelog.md` and `ai/roadmaps/roadmap-tracker.md` after significant changes.**

---

## Key Docs to Read First

1. `aiDocs/context.md` — project overview, current status, key learnings
2. `aiDocs/prd.md` — product requirements (v2.0, post-pivot)
3. `aiDocs/architecture.md` — tech stack, file structure, API endpoints, data models
4. `ai/roadmaps/2026-04-06-current-roadmap.md` — where we are and what's next
5. `ai/notes/2026-04-06-round2-club-interviews.md` — most recent customer research

---

## Code Principles

- **No over-engineering.** Build the minimum that works. Don't design for hypothetical future requirements.
- **No legacy compatibility shims.** If something is unused, delete it. Don't add `// removed` comments or backwards-compat wrappers.
- **No cruft.** Don't add docstrings, comments, or type annotations to code you didn't change.
- **Validate at boundaries only.** Trust internal code. Only validate user input and external API responses.
- **No premature abstraction.** Three similar lines of code is better than a helper function used once.

---

## Tech Stack (Quick Reference)

- **Framework:** Next.js 16 (App Router), React 19, Tailwind 4
- **Database:** Firestore (Firebase Admin SDK server-side, client SDK for reads)
- **AI (Primary):** OpenAI gpt-4o-mini via Responses API (raw fetch, no SDK)
- **AI (Secondary):** Gemini 2.0 Flash (`@google/generative-ai`)
- **Maps:** Leaflet (no API key needed)
- **Auth:** Firebase Auth + Firestore user profiles
- **Hosting:** Vercel

---

## Ingestion Paths (Priority Order)

1. **Slack** — `src/backend/slack/` — cron-triggered, reads official club channels
2. **Email/text paste** — manual entry form (not yet built as of April 6)
3. **Flyer image upload** — `src/components/UploadForm.tsx` → OpenAI vision extraction

---

## Pre-Alpha Blockers

Before alpha testing, these must be built:
- "Mark as Gone" UI (status toggle on event detail page)
- Real-time `onSnapshot` on feed
- Confirmation/edit form for AI-extracted data
- Vercel production deployment

---

## Campus Details

- **Campus:** BYU Provo, UT
- **Timezone:** `America/Denver`
- **Building data:** `src/data/byuBuildings.ts`
- **Building matching:** `src/lib/matchByuBuilding.ts` (fuzzy matching from AI text output)
