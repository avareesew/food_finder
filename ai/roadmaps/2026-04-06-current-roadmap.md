# Scavenger — Current Roadmap & Tracker
**Date:** April 7, 2026
**Last Updated:** April 7, 2026
**Status:** 🔄 Final Sprint (April 1–8)

> ⚠️ Avoid over-engineering, cruft, and legacy compatibility shims. This is a clean, fast-moving project. Build the minimum that works. Delete unused code.

---

## Status Key
- ✅ Complete
- 🔄 In Progress
- ⏸️ Not Started
- 🔴 Blocked
- ❌ Cancelled / Falsified

---

## Phase 0: Setup & Validation — ✅ Complete (Feb 2026)

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Firebase + Next.js initialized | ✅ | Next.js 16, React 19 |
| OpenAI + Gemini API keys | ✅ | OpenAI primary, Gemini secondary |
| 5 club president interviews | ✅ | Round 1: Feb 24–25 · Round 2: Apr 6 |
| Flyer assumption validated | ❌ Falsified | Pivot to email/text ingestion confirmed |
| Automation validated | ✅ | 9.7/10 avg across 3 Round 2 interviews |
| Vercel deployment handoff | 🔄 | `vercel.json` exists; teammate owns live rollout |

---

## Phase 1: Core Development — ✅ Substantially Complete (Feb–Mar 2026)

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Flyer upload → OpenAI extraction → Firestore pipeline | ✅ | Full end-to-end working |
| Extraction validation (rejects missing date/time/place) | ✅ | `src/lib/validateFlyerExtraction.ts` |
| Feed page + event cards | ✅ | `src/app/feed/page.tsx` |
| Event detail view + modal | ✅ | `src/app/events/[id]/page.tsx` |
| Home page (hero, calendar, discover preview, map CTA) | ✅ | Beyond original scope |
| Explore page (campus buildings grid) | ✅ | Beyond original scope |
| Campus map + building data + fuzzy matching | ✅ | Beyond original scope |
| Dark mode | ✅ | Beyond original scope |
| Dual backend mode (Firebase + local) | ✅ | `NEXT_PUBLIC_BACKEND_MODE` |
| Slack ingestion pipeline (backend) | ✅ | `src/backend/slack/` — no frontend yet |
| Auth system (login, register, profiles, admin) | ✅ | From April pull |
| Upload auth gate | ✅ | `src/components/UploadAuthGate.tsx` |
| "Mark as Gone" UI | 🔴 Blocked | Status field exists in DB; no UI toggle |
| Real-time `onSnapshot` on feed | 🔴 Blocked | Using `getDocs` polling |
| Confirmation/edit form for AI output | 🔴 Blocked | AI auto-accepts valid extractions |

---

## Final Sprint — 🔄 In Progress (April 1–8)

**Presentations:** April 8, 13, 15

| Deliverable | Owner | Status | Notes |
|-------------|-------|--------|-------|
| Round 2 customer interviews (3 clubs) | Person 1 | ✅ | Michael Nichols, Molly Wakefield, Abigail Armstrong |
| Falsification tests documented | Person 1 | ✅ | See `ai/notes/interviews/2026-04-06-round2-club-interviews.md` |
| Club president submission form (paste text → extract → pin) | Person 2 | ⏸️ | Core demo feature |
| Demo polish + mobile testing | Person 2 | ⏸️ | 2–3 real test inputs prepared |
| CLAUDE.md created | Person 3 | ✅ | Done |
| Documentation cleanup (PRD, MVP, roadmaps) | Person 3 | ✅ | Done |
| Readiness pass: admin/Gmail logging, AI bookshelf, secret scan | Person 3 | 🔄 | Branch `codex/final-readiness-pass` |
| Deployment handoff + environment checklist | Person 4 | 🔄 | Teammate-owned Vercel rollout |
| Presentation slides | Person 4 | ⏸️ | |
| Live demo script + Q&A talking points | Person 4 | ⏸️ | |
| Full team rehearsal | All | ⏸️ | April 7 |
| All materials submitted | All | ⏸️ | April 8 deadline |

---

## Pre-Alpha Blockers

Must be resolved before recruiting alpha testers.

| Blocker | File(s) | Priority | Status |
|---------|---------|----------|--------|
| "Mark as Gone" UI | `src/app/events/[id]/page.tsx` | 🔴 Critical | Open |
| Vercel production deployment handoff | `vercel.json` | 🔴 Critical | Teammate-owned |
| Real-time `onSnapshot` on feed | `src/app/feed/page.tsx` | 🔴 Critical | Open |
| Confirmation/edit form for AI output | `src/components/UploadForm.tsx` | 🟡 High | Open |

---

## Next Phase: Alpha Testing (Post-April 8)

**Target segment:** Sub-association leaders (5–10)
**Why:** Smaller budgets, higher food frequency, least marketing bandwidth — biggest beneficiaries of automation.

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Fix all pre-alpha blockers | ⏸️ | See above |
| Complete Vercel production rollout (teammate-owned) | ⏸️ | |
| Email ingestion UI | ⏸️ | #1 validated feature (9.7/10 avg) |
| Requirements / Expectations field on pins | ⏸️ | Requested by Sales Society + Finance Society |
| Club Link field on pins | ⏸️ | Requested by Finance Society + Women of Accountancy |
| Scarcity note field on pins | ⏸️ | Requested by Women of Accountancy |
| Recruit 5–10 sub-association leaders | ⏸️ | |
| Seed 10–15 real events | ⏸️ | |
| Collect feedback (2-week window) | ⏸️ | |

### Alpha Success Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Club leaders posting | 3+ | — | ⏸️ |
| Events created | 10–15 | — | ⏸️ |
| "Would use regularly" | 70%+ | — | ⏸️ |
| Pre-alpha blockers open | 0 | — | ⏸️ |

---

## Future: Beta + Launch

### Beta (30–50 Users)
| Deliverable | Status |
|-------------|--------|
| Fix alpha issues | ⏸️ |
| Expand to 3–5 design partner clubs | ⏸️ |
| Real-time `onSnapshot` | ⏸️ |
| Teams/Outlook integration (if BYU mandate confirmed) | ⏸️ |
| Rate limiting on upload endpoints | ⏸️ |

### Launch Success Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Posts per week | 30+ | — | ⏸️ |
| Unique visitors | 150+ | — | ⏸️ |
| Repeat users | 25%+ | — | ⏸️ |
| Ghost chase rate | <5% | — | ⏸️ |
| Organic posts (non-team) | 5+ | — | ⏸️ |

---

## Open Risks

| Risk | Likelihood | Impact | Mitigation | Status |
|------|-----------|--------|------------|--------|
| Ghost chases from stale data | High | High | "Mark as Gone" UI before alpha | 🔴 Open |
| Slack not universal | Confirmed | Medium | Email path is first-class; Slack is additive | Monitoring |
| BYU Teams/Outlook mandate | Unknown | Medium | Follow up with BYU club admin; email covers Outlook | 🔴 Needs follow-up |
| Sub-association adoption | Untested | High | Alpha target segment | ⏸️ |

---

## Update Log

| Date | Update | By |
|------|--------|----|
| 2026-02-16 | Roadmap created (original 7-week flyer-era plan) | Team |
| 2026-02-24 | Phase 0 complete — interviews started, Firebase + Next.js working | Team |
| 2026-04-01 | Phase 1 substantially complete — retroactive alignment with codebase | Ava + Claude |
| 2026-04-06 | Round 2 interviews complete · Documentation cleanup · Pivot confirmed · Roadmap rewritten post-pivot | Ava + Claude |
| 2026-04-07 | Final readiness pass started — logging coverage, AI bookshelf, secret scan, verification evidence | Ryan + Codex |
