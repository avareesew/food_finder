# Changelog: Scavenger Platform

**Format:** Keep entries concise. Link to commits when relevant.
**Audience:** Team members and future contributors

---

## [0.6.1] - 2026-04-07 — Demo Data: Club Link + Expectations

### Demo Seeding
- Created `scripts/seed-demo-fields.ts` — patches `clubSignupLink` and `participationExpectations` on the CPG Sales event in Firestore
- CPG Sales event now shows "Join & participate" section with Sales Society link and attendance expectations
- Both fields already supported end-to-end: type definition, AI extraction prompts, event detail UI

### UI Polish
- Enhanced "Join & participate" card in both EventDetailModal and event detail page — gradient card, inline icons for expectations and club link, "Visit club page" link with external-link icon

---

## [0.6.0] - 2026-04-07 — Vercel Deployment + UI Fixes

### Deployment
- Deployed to Vercel production: `food-finder-avareesew-5233s-projects.vercel.app`
- Set cron schedules to daily (`0 9 * * *`) — free tier limit (was `*/5 * * * *`)
- Disabled Vercel deployment protection so app is publicly accessible

### UI Fixes
- Fixed mobile search bar overflow on home page — button now stacks below input on mobile, inline on `sm:+`
- Added campus expectations notice banner to home page (participation context for food events)

### Presentation
- Updated `final/final-presentation.html` — copy revisions, added live QR code pointing to Vercel URL

---

## [0.5.1] - 2026-04-07 — Final Readiness Pass

### Structured Logging
- Finished structured logging coverage for all **21 API routes** plus the shared admin helper and Gmail ingest pipeline
- Added start/success/failure events for admin user management, admin flyer cleanup, and Gmail cron entrypoints
- Added per-message Gmail failure logs and final Gmail ingest summary logs for the test → log → fix loop

### Documentation
- Added `ai/context.md` as the AI bookshelf entrypoint for new sessions
- Updated README, `CLAUDE.md`, `aiDocs/context.md`, `aiDocs/architecture.md`, `aiDocs/mvp.md`, and the active roadmap to reflect the current repo structure and teammate-owned deployment handoff
- Removed stale references to the deleted roadmap tracker path in active docs

### Verification
- Added `scripts/scan-secrets.sh` to scan tracked files and git history while ignoring documented placeholders in `env.example`
- Repaired the local dependency state with `npm install` so `googleapis` resolves again during production builds
- Switched `scripts/test.sh` back to the stable webpack build path after Turbopack stalled on the current admin/Gmail-heavy app build
- `logs/secrets-20260407-161820.log` confirms the tracked files + git history scan found no likely committed secrets
- `logs/test-20260407-163109.log` confirms lint + production build succeeded on the readiness-pass branch and enumerated the full 21-route API surface
- `logs/slack-ingest-20260407-163207.log` captures the config-error branch (`exit 2`) of `scripts/test-slack-ingest.sh` when a separate shell could not reach the local dev server

---

## [0.5.0] - 2026-04-06 — Technical Process Final Sprint

### Structured Logging
- Expanded `src/lib/logger.ts` structured logger across the API surface that existed on April 6 plus key backend pipeline files
- Zero `console.error` calls remain in `src/` — every error path uses `logger.error` with event name and structured details
- Added `logger.info` for key operations: upload-start, slack-ingest-start/complete, flyer-processing-start/success, openai-extract-start/success
- Added `logger.warn` for rejected flyers and unauthorized admin access attempts

### Test Scripts
- Fixed `scripts/test.sh`: removed invalid `--webpack` flag, added explicit exit codes (0/1/2), added config checks
- Created `scripts/test-slack-ingest.sh` for testing Slack ingestion pipeline with structured log capture

### Documentation
- Rewrote `aiDocs/context.md` with bookshelf pattern — each key doc gets a 1-2 sentence description for quick orientation
- Updated `aiDocs/coding-style.md` to reflect actual codebase: real data models (ExtractedEvent, Flyer), real API routes, structured logging examples, removed stale JSDoc mandate
- Added MCP config patterns to `.gitignore` per rubric requirements

### Git Workflow
- Created 5 feature branches with individual PRs for clean git workflow evidence
- PRs: #1 gitignore, #2 structured-logging, #3 test-scripts, #4 debug-loop, #5 docs

---

## [0.4.0] - 2026-04-06 — Post-Pivot Documentation & Round 2 Interviews

### Documentation Cleanup
- **Archived** `aiDocs/prd.md` → `aiDocs/archived/prd-v1-flyer-era.md`
- **Archived** `aiDocs/mvp.md` → `aiDocs/archived/mvp-v1-flyer-era.md`
- **Archived** all original phase0–4 roadmap files → `ai/roadmaps/archived/`
- **Rewrote** `aiDocs/prd.md` (v2.0) — reflects pivot to email/Slack automation, sub-associations as go-to-market, new feature fields (Requirements, Club Link, Scarcity), updated personas and assumptions
- **Rewrote** `aiDocs/mvp.md` (v2.0) — reflects what was actually built, April 8 demo flow, post-pivot build priorities
- **Created** `ai/roadmaps/2026-04-06-current-roadmap.md` — single current-state roadmap replacing all old phase files
- **Created** `CLAUDE.md` — project behavioral guidance for AI context
- **Updated** `aiDocs/architecture.md` — added Slack ingestion endpoints, email ingestion path, updated Event data model
- **Removed** `ai/` from `.gitignore` — ai/ folder is now tracked in git

### Round 2 Customer Interviews
**Interviews:** Michael Nichols (Sales Society President), Molly Wakefield (Finance Society VP), Abigail Armstrong (Women of Accountancy President)
Full notes: `ai/notes/interviews/2026-04-06-round2-club-interviews.md`

Key findings:
- **Automation validated at 9.7/10 average** — zero-effort ingestion from official channels is THE reason club leaders adopt. Ratings: 10/10, 9/10, 10/10.
- **Professionalism tension confirmed (2/3)** — Sales Society and Finance Society worry about food hunters; Marriott "professional manners" initiative adds institutional pressure.
- **Sub-associations are the best early adopter segment** — smaller budgets, higher food frequency, less marketing bandwidth.
- **Slack is not universal** — Finance Society and Women of Accountancy don't use Slack. Email is the more universal first-class path.
- **Flyer assumption fully falsified** — all 3 Round 2 clubs rely on email + Instagram as primary channels.

---

## [0.3.0] - 2026-04-01 — Documentation Alignment

- **Retroactive audit:** Reconciled all aiDocs with actual codebase state as of commit `62b543e`
- **Updated `aiDocs/context.md`:** Status changed from "Pre-Development" to "Active Development — Phase 1 Substantially Complete"
- **Updated `aiDocs/architecture.md`:** Version 2.0 — rewrote file structure, API endpoints, data models, data flow diagrams
- **Updated the then-active roadmap tracker** (now archived as `ai/roadmaps/archived/roadmap-tracker-v1.md`): checked off completed Phase 0 and Phase 1 items, documented divergences

### Key Divergences Documented
- **AI Provider:** Original plan was Gemini-only; actual uses OpenAI gpt-4o-mini as primary, Gemini as secondary
- **Data Model:** Original `Post` model replaced by `Flyer`, `Event`, and `Extraction` collections
- **API Routes:** Original `/api/extract-flyer` and `/api/posts` replaced by `/api/flyers/*`, `/api/events`, `/api/upload/*`, `/api/local/*`
- **Features Beyond Scope:** Campus building maps, explore page, dark mode, weekly calendar, dual backend mode, about page

### Testing & Logs
- `scripts/test.sh` runs lint + build, pipes structured output into `logs/test-<timestamp>.log`
- `logs/test-20260223-205538.log` captured TurbopackInternalError — justified moving to webpack builds
- `logs/test-20260223-210044.log` captured `getaddrinfo ENOTFOUND fonts.googleapis.com` — fixed by removing `next/font` imports
- `logs/test-20260223-210144.log` proves the updated pipeline succeeded (lint + webpack build)

---

## [0.2.0] - 2026-03-15 — Core Development Sprint

### Added — Full Application Build
- **Flyer Upload & AI Extraction** — Full pipeline: photo → OpenAI gpt-4o-mini extraction → validation → Firestore storage
- **Gemini 2.0 Flash** available as secondary extraction path via `/api/flyers/[flyerId]/extract`
- **Feed Page** — Grid of event cards with responsive layout, mock data fallback
- **Event Detail View** — Full event page with flyer image, status badges, location, host
- **Event Detail Modal** — Inline modal for quick event preview
- **Home Page** — Hero section, weekly event calendar, discover preview, campus map CTA, testimonials
- **Explore Page** — Campus buildings explorer with interactive Leaflet map, building data, week navigation
- **Upload Page** — Drag-and-drop upload with extraction results and recent uploads list
- **About Page** — Mission, problem statement, how it works, values
- **Dark Mode** — Toggle with persistent theme, system-preference detection
- **Campus Building Data** — 20 BYU buildings with lat/lng, aliases, building code matching
- **Dual Backend Mode** — Firebase (production) and local filesystem (development) via `NEXT_PUBLIC_BACKEND_MODE`
- **Extraction Validation** — Auto-rejects flyers missing date, time, or place
- **Event Timing Utilities** — Campus timezone handling, date coercion, expiry detection, 12h formatting
- **Auth System** — Firebase Auth with BYU email enforcement, canUpload permission gate, admin panel
- **Slack Ingestion Pipeline** — Cron-triggered, reads club channels, image + text messages, deduplication, multi-workspace

### Technical Decisions
- Switched from Gemini-only to OpenAI gpt-4o-mini as primary AI (better structured JSON output)
- Added `firebase-admin` for server-side writes (bypasses client Firestore rules)
- Implemented local filesystem fallback for zero-Firebase development

---

## [0.1.0] - 2026-02-16 — Project Foundation

### Added
- Initial project structure and git repository
- Comprehensive market research analysis (41% food insecurity rate, competitive landscape)
- Product Requirements Document (PRD) with user personas and success metrics
- MVP Demo Specification (2-3 week build timeline)
- System architecture document (Next.js + Firestore + Gemini 2.0 Flash)
- Coding style guide (TypeScript, React patterns, Tailwind CSS)
- Project context document (mission, status, tech stack)
- `.gitignore` configuration for Next.js/Firebase projects
- GitHub repository initialized at `avareesew/food_finder`
- 2 club president interviews (Kendall Castellaw, Carson Fellows)

### Key Decisions
- BYU Campus as pilot — on-campus team, service-oriented culture
- Flyer scanning as MVP focus (later falsified and pivoted)
- No user accounts in MVP — reduces friction, anonymous browsing
- Serverless architecture — Vercel + Firebase for zero DevOps

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| v0.6.1 | 2026-04-07 | Demo data seeding — club link + expectations on CPG Sales event |
| v0.6.0 | 2026-04-07 | Vercel deployment, mobile UI fixes, presentation update |
| v0.5.1 | 2026-04-07 | Final readiness pass — logging coverage, AI bookshelf, verification |
| v0.5.0 | 2026-04-06 | Technical process final sprint — logging, scripts, docs |
| v0.4.0 | 2026-04-06 | Post-pivot documentation cleanup + Round 2 interviews |
| v0.3.0 | 2026-04-01 | Documentation alignment — reconciled docs with codebase |
| v0.2.0 | 2026-03-15 | Core development — full application build |
| v0.1.0 | 2026-02-16 | Project foundation, documentation, planning |

---

**Update this file with every significant change. Keep entries brief but informative.**
