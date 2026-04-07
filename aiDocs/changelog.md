# Changelog: Scavenger Platform

**Format:** Keep entries concise. Link to commits when relevant.  
**Audience:** Team members and future contributors

---

## [Unreleased]

### Documentation Cleanup (2026-04-06)
- **Archived** `aiDocs/prd.md` → `aiDocs/archived/prd-v1-flyer-era.md`
- **Archived** `aiDocs/mvp.md` → `aiDocs/archived/mvp-v1-flyer-era.md`
- **Archived** all original phase0–4 roadmap files → `ai/roadmaps/archived/`
- **Rewrote** `aiDocs/prd.md` (v2.0) — reflects pivot to email/Slack automation, sub-associations as go-to-market, new feature fields (Requirements, Club Link, Scarcity), updated personas and assumptions
- **Rewrote** `aiDocs/mvp.md` (v2.0) — reflects what was actually built, April 8 demo flow, post-pivot build priorities
- **Created** `ai/roadmaps/2026-04-06-current-roadmap.md` — single current-state roadmap replacing all old phase files
- **Created** `CLAUDE.md` — project behavioral guidance for AI context
- **Updated** `aiDocs/architecture.md` — added Slack ingestion endpoints, email ingestion path, updated Event data model with Requirements/ClubLink/ScarcityNote fields
- **Removed** `ai/` from `.gitignore` — ai/ folder is now tracked in git
- **Renamed** `ai/notes/week1-club-interviews.md` → `2026-02-24-round1-club-interviews.md`

### Round 2 Customer Interviews (2026-04-06)
**Interviews:** Michael Nichols (Sales Society President), Molly Wakefield (Finance Society VP), Abigail Armstrong (Women of Accountancy President)
Full notes: `ai/notes/2026-04-06-round2-club-interviews.md`

Key findings:
- **Automation validated at 9.7/10 average** — zero-effort ingestion from official channels is THE reason club leaders adopt. Ratings: 10/10, 9/10, 10/10.
- **Professionalism tension confirmed (2/3)** — Sales Society and Finance Society worry about food hunters; Marriott "professional manners" initiative adds institutional pressure. Women of Accountancy takes opposite view (food as a deliberate bribe).
- **Sub-associations are the best early adopter segment** — smaller budgets, higher food frequency, less marketing bandwidth. Mentioned independently by Sales Society and Finance Society.
- **Slack is not universal** — Finance Society and Women of Accountancy don't use Slack. Email is the more universal first-class path.
- **New features requested:** Requirements / Expectations field (2/3), Club Link / Join button (2/3), Scarcity note — "Food for first X people" (Women of Accountancy).
- **Institutional approval is a real constraint** — Women of Accountancy requires 2-faculty flyer approval. "BYU Official" verification framing helps clubs navigate this.
- **Risk flagged:** Potential BYU mandate to move to Teams + Outlook. Unconfirmed — needs follow-up with BYU club administration.
- **Flyer assumption fully falsified** — all 3 Round 2 clubs rely on email + Instagram as primary channels.



### Documentation Alignment (2026-04-01)
- **Retroactive audit:** Reconciled all aiDocs with actual codebase state as of commit `62b543e`. Development had moved significantly ahead of documentation.
- **Updated `aiDocs/context.md`:** Status changed from "Pre-Development" to "Active Development — Phase 1 Substantially Complete." Updated tech stack (Next.js 16, React 19, OpenAI primary, Gemini secondary), repository structure, product status, assumptions validated, and key learnings.
- **Updated `aiDocs/architecture.md`:** Version 2.0 — rewrote file structure, API endpoints, data models (Flyer/Event/Extraction vs old Post model), data flow diagrams, technology stack, environment variables, and security sections to match actual implementation.
- **Updated `ai/roadmaps/roadmap-tracker.md`:** Checked off completed Phase 0 and Phase 1 items, marked divergences (AI provider shift, features beyond scope), documented active blockers (no "Mark as Gone" UI, no real-time sync, no confirmation form), and added key learnings.

### Key Divergences Documented
- **AI Provider:** Original plan was Gemini-only; actual uses OpenAI gpt-4o-mini as primary, Gemini as secondary
- **Data Model:** Original `Post` model replaced by `Flyer`, `Event`, and `Extraction` collections
- **API Routes:** Original `/api/extract-flyer` and `/api/posts` replaced by `/api/flyers/*`, `/api/events`, `/api/upload/*`, `/api/local/*`
- **Features Beyond Scope:** Campus building maps, explore page, dark mode, weekly calendar, dual backend mode, about page — all built but were listed as "out of scope" or Phase 2+
- **Missing Features:** "Mark as Gone" UI, real-time `onSnapshot`, confirmation/edit form for AI output

### In Progress
- Created `ai/roadmaps/phase-2-through-4-checklist.md` to track roadmap tasks + status for Phase 2/3/4 work items.
- Added `src/lib/logger.ts` and wired structured logging through the upload API, Firestore services, feed page, and upload form so debuggable events are emitted during every flow.
- Extended `scripts/test.sh` to lint/build, pipe output into `logs/test-<timestamp>.log`, and documented how to replay the structured logs in `aiDocs/context.md`.
- Expanded `aiDocs/prd.md` with Customer Focus, Differentiation, and Success/Failure Criteria sections to show Jason our due diligence, metrics, and pivot plans.
- Drafted the customer interaction plan (below) so we can capture at least five touchpoints or falsification experiments and log the learnings in the changelog once complete.

### Customer Discovery

#### ✅ Completed — Interview 1: Kendall Castellaw (2026-02-24)
**Past Finance Society President · Marriott School (Tanner Building)**
Full notes: `ai/notes/week1-club-interviews.md`

Key findings:
- **🚨 Tanner Building is flyer-free by policy.** Marriott School prohibits physical flyer distribution except for large school-wide events. Clubs in Tanner use digital screens, Instagram, and newsletters instead. Puts the “70%+ of events have physical flyers” assumption at risk for the Marriott cluster.
- **Supply-side motivation is nuanced.** Food is funded by member dues, so the instinct is to serve members first. The effective pitch is event *exposure and recruitment* (“get people in the door”), not waste reduction.
- **Liability is a non-issue.** Confirmed: no concerns raised. Validates FDIA framing is sufficient.
- **Food events are frequent.** Every Finance Society event had food; ~80% was company-sponsored.

#### ✅ Completed — Interview 2: Carson Fellows (2026-02-25)
**Current Management Consulting Club President**
Full notes: `ai/notes/week1-club-interviews.md`

Key findings:
- **Non-Tanner clubs do use flyers/email with food callouts.** Carson mentions announcing food on flyers and in emails — partially rehabilitates the flyer-scanning assumption for buildings outside Marriott School.
- **Leftover supply is lower than expected.** Management Consulting intentionally orders less than needed; rarely has leftovers. Both interviews now converge on low/unreliable leftover supply. Feed may need to surface food-available-during-event posts, not just post-event scraps.
- **Recruitment framing confirmed across two independent interviews.** “If it got more people to go to the club, then maybe” — same motivation as Kendall. Waste reduction framing does not resonate; club growth does.
- **Liability: zero concerns** — second independent confirmation. FDIA positioning is sufficient.
- **Low spontaneous posting motivation.** “Wouldn’t go out of their way to post it.” Friction reduction is critical — posting must be near-effortless or supply side won’t participate.

#### Planned Touchpoints (Remaining)
- Interview/ride-along with RA Marcus (Heritage Halls) to validate sustainability messaging and interest in raising floors’ awareness.
- Chat with club recruiter Sarah (Marketing Club) to see how leftover catering is currently handled and confirm the legal/procedural blockers.
- Survey 5+ hungry students in the JFSB or library (Hungry Hustler persona) about their current food discovery channels and willingness to use a feed.
- Interview a campus sustainability advocate about measurable waste metrics to feed into our success criteria dashboards.
- Run a falsifiability check by asking 5 random students whether they would post leftovers anonymously and capturing yes/no plus rationale.

### Testing & Logs
- `bash scripts/test.sh` now runs lint + `next build --webpack`, pipes structured output into `logs/test-<timestamp>.log`, and is referenced in `aiDocs/context.md` for reproducing the test-log-fix loop.
- `logs/test-20260223-205538.log` captured the first failure (TurbopackInternalError: creating new process / binding to a port) so we could justify moving to webpack builds.
- `logs/test-20260223-210044.log` captured the `getaddrinfo ENOTFOUND fonts.googleapis.com` errors from the webpack run; the fix was removing the `next/font` imports and defining font CSS variables locally.
- `logs/test-20260223-210144.log` proves the updated pipeline succeeded (lint + webpack build), so we can show Casey the structured logs plus the CLI commands that produced them.

---

## [0.1.0] - 2026-02-16

### Added - Project Foundation
- ✅ Initial project structure and git repository
- ✅ Comprehensive market research analysis (41% food insecurity rate, competitive landscape)
- ✅ Product Requirements Document (PRD) with user personas and success metrics
- ✅ MVP Demo Specification (2-3 week build timeline)
- ✅ System architecture document (Next.js + Firestore + Gemini 2.0 Flash)
- ✅ Coding style guide (TypeScript, React patterns, Tailwind CSS)
- ✅ Project context document (mission, status, tech stack)
- ✅ `.gitignore` configuration for Next.js/Firebase projects
- ✅ GitHub repository initialized at `avareesew/food_finder`

### Documentation Structure
```
aiDocs/           # Tracked in git (source of truth)
├── context.md    # Project overview and status
├── prd.md        # Product requirements
├── mvp.md        # MVP specification
├── architecture.md # Technical architecture
├── coding-style.md # Code standards
└── changelog.md  # This file

ai/               # Gitignored (working artifacts)
├── guides/       # Market research, library docs
├── roadmaps/     # Task lists (to be created)
└── notes/        # Brainstorming (to be created)
```

### Key Decisions
- **BYU Campus as pilot** — Team is on-campus, tight-knit community, service-oriented culture
- **Flyer scanning as MVP focus** — Gemini 2.0 Flash provides 30x cost advantage
- **No user accounts in MVP** — Reduces friction, anonymous browsing
- **Human-in-the-loop AI verification** — Prevents "ghost chase" errors
- **Serverless architecture** — Vercel + Firebase for zero DevOps

### Reference Documents
- Market Research: `ai/guides/food-finder-market-research.md`
- Gemini Research: `ai/guides/external/marketResearch_gemini.md`

---

## Key Metrics (Goals)

### MVP Phase (Week 7 Target)
- 30+ posts per week
- 150+ unique visitors
- <5% "ghost chase" rate
- 25% repeat usage rate
- 5+ organic posts (non-team)

---

## Next Milestones (as of 2026-04-01)

### Pre-Alpha Blockers
- [ ] Build "Mark as Gone" UI (status toggle on event detail page)
- [ ] Wire real-time `onSnapshot` listeners on feed
- [ ] Build confirmation/edit form for AI-extracted data
- [ ] Confirm Vercel production deployment is live

### Alpha Testing (Phase 2)
- [ ] Deploy to Vercel production
- [ ] Recruit 5-10 alpha testers
- [ ] Seed 10-15 real events
- [ ] Collect feedback and iterate

### Public Launch (Phase 4)
- [ ] Social media announcement
- [ ] Share in BYU ward groups and clubs
- [ ] Monitor metrics
- [ ] Achieve 30+ posts goal

---

## Version History

- **v0.3.0** (2026-04-01): Documentation alignment — reconciled aiDocs with actual codebase state
- **v0.2.0** (~2026-03): Core development — upload pipeline, feed, event detail, explore page, campus maps, dark mode
- **v0.1.0** (2026-02-16): Project foundation, documentation, planning complete
- **v0.0.0** (2026-02-16): Initial commit

---

**Update this file with every significant change. Keep entries brief but informative.**
