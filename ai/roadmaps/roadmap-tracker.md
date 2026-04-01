# Food Finder MVP Roadmap Tracker
## 7-Week Implementation Roadmap

**Date Created:** February 16, 2026
**Last Updated:** April 1, 2026
**Purpose:** Track progress across all phases of MVP development
**Status:** Phase 0 Complete · Phase 1 Substantially Complete · Phase 2-4 Not Started

> **Note (2026-04-01):** Development moved faster than this tracker was updated.
> This retroactive update reconciles the tracker with actual codebase state as of commit `62b543e`.
> Several features were built that weren't in the original plan (campus maps, explore page, dark mode, weekly calendar).
> The AI provider shifted from Gemini-only to a dual OpenAI + Gemini setup.

---

## Quick Reference

| Phase | Timeline | Focus | Plan Document | Status |
|-------|----------|-------|---------------|--------|
| Phase 0 | Week 1 | Setup & Validation | `phase0-week1-setup-validation.md` | ✅ Complete |
| Phase 1 | Weeks 2-4 | Core Development | `phase1-weeks2-4-core-development.md` | ✅ Substantially Complete |
| Phase 2 | Week 5 | Alpha Testing | `phase2-week5-alpha-testing.md` | ⏸️ Not Started |
| Phase 3 | Week 6 | Beta & Polish | `phase3-week6-beta-polish.md` | ⏸️ Not Started |
| Phase 4 | Week 7 | Public Launch | `phase4-week7-public-launch.md` | ⏸️ Not Started |

**Status Key:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Complete
- ⚠️ Blocked
- ❌ Failed
- 🔀 Diverged (built differently than planned)

---

## Phase 0: Setup & Validation (Week 1)

**Goal:** Confirm all assumptions before writing code

### Critical Checkpoints

| Checkpoint | Status | Notes |
|-----------|--------|-------|
| Can we deploy to production? | ✅ Complete | Next.js 16 + Firebase initialized; local dev working |
| Do BYU clubs print physical flyers? | ⚠️ At Risk | Tanner/Marriott prohibits flyers (Interview 1). Non-Tanner clubs do use flyers (Interview 2). Mixed results. |
| Can AI extract data accurately? | 🔀 Diverged | Gemini AND OpenAI both integrated. OpenAI gpt-4o-mini is the primary extraction path; Gemini 2.0 Flash available as secondary. |
| Does Firestore real-time sync work? | ✅ Complete | Firestore reads/writes working via Admin SDK. Client reads via API routes. Real-time `onSnapshot` not yet wired (polling via `getDocs`). |

### Key Deliverables

- [x] Firebase project set up (`src/lib/firebase.ts` initialized)
- [x] Next.js project created and running locally (upgraded to Next.js 16 + React 19)
- [x] AI API keys obtained — both `OPENAI_API_KEY` and `GEMINI_API_KEY`
- [ ] Next.js deployed to Vercel (not confirmed)
- [ ] 20-30 BYU flyers photographed (not confirmed)
- [x] 3-5 club president interviews — 2/3+ complete (Kendall Castellaw 2026-02-24, Carson Fellows 2026-02-25; see `ai/notes/week1-club-interviews.md`)
- [x] AI extraction accuracy tested — OpenAI gpt-4o-mini with validation pipeline working
- [x] Firestore read/write verified
- [ ] Formal GO/NO-GO decision made (development proceeded without formal gate)

**Actual Completion:** ~Late February 2026
**Decision:** GO (implicit — development continued into Phase 1)

---

## Phase 1: Core Development (Weeks 2-4)

**Goal:** Build "flyer → feed → gone" pipeline

### Week 2: Upload & Extraction

**Key Milestones:**
- [x] Upload form component built (`src/components/UploadForm.tsx` — drag-and-drop, preview, error/success states)
- [x] Firebase Storage upload working (`src/app/api/upload/route.ts` + `src/backend/flyers/storageAdminUpload.ts`)
- [x] Firestore document creation on upload (`src/services/flyers.ts`, `src/backend/flyers/processUploadedFlyer.ts`)
- [x] AI extraction integrated — OpenAI gpt-4o-mini via Responses API (`src/backend/openai/extractEventFromFlyer.ts`)
- [x] Gemini extraction also available (`src/backend/gemini/extractFlyer.ts`, `/api/flyers/[flyerId]/extract`)
- [x] Extraction validation pipeline (`src/lib/validateFlyerExtraction.ts` — requires date, time, place)
- [ ] Confirmation form (user edits AI output before submit) — NOT built as a separate form; extraction is auto-accepted if valid

**Actual Completion:** ~Early-Mid March 2026

### Week 3: Feed & Display

**Key Milestones:**
- [x] Event card component built (`src/components/ui/EventCard.tsx` — image overlays, active/ended badges, food category highlights)
- [x] Feed page with Firestore query and mock data fallback (`src/app/feed/page.tsx`)
- [x] Event detail view (`src/app/events/[id]/page.tsx` — full flyer image, status badges, location, host, food details)
- [x] Event detail modal (`src/components/ui/EventDetailModal.tsx`)
- [x] Local event card variant (`src/components/ui/LocalEventCard.tsx`)
- [ ] Real-time listener (`onSnapshot`) — still using `getDocs` polling

**Actual Completion:** ~Mid March 2026

### Week 4: Status & Polish

**Key Milestones:**
- [ ] "Mark as gone" feature — NOT built (status field exists in data model but no UI to toggle it)
- [x] Time-based features — PARTIALLY complete (`src/lib/eventTiming.ts` — event expiry detection, relative time formatting, campus timezone handling, smart date coercion)
- [x] UI polished (mobile-first) — responsive 1/2/3 column layouts, dark mode, loading skeletons
- [x] Error states handled — empty states, upload validation errors, extraction rejection feedback
- [x] Core flow end-to-end working — upload → AI extract → validate → store → display in feed

**Additional features built beyond original plan:**
- [x] Dark mode (`src/components/ThemeToggle.tsx`, `src/hooks/useHtmlDarkClass.ts`)
- [x] Campus building map + explorer (`src/components/CampusBuildingMap.tsx`, `src/components/CampusBuildingsExplorer.tsx`)
- [x] BYU building data with lat/lng (`src/data/byuBuildings.ts`)
- [x] Building matching from AI output (`src/lib/matchByuBuilding.ts`)
- [x] Weekly event calendar (`src/components/home/WeeklyEventCalendar.tsx`)
- [x] Explore page (`src/app/explore/page.tsx`)
- [x] About page (`src/app/about/page.tsx`)
- [x] Home page with hero, calendar, discover preview, testimonials (`src/app/page.tsx`)
- [x] Local/offline development mode (`NEXT_PUBLIC_BACKEND_MODE=local`)
- [x] Dual AI provider support (OpenAI primary, Gemini secondary)
- [x] Flyer processing pipeline with auto-rejection of invalid extractions
- [x] Unsplash image caching (`/api/local/cache-image`)

**Actual Completion:** ~Late March 2026

**Checkpoint:** Core flow works end-to-end? **YES** — upload → extract → validate → store → feed display is working.
**Missing:** "Mark as gone" UI, real-time `onSnapshot`, confirmation form for editing AI output.

---

## Phase 2: Alpha Testing (Week 5)

**Goal:** Validate with 5-10 real users

**Status:** ⏸️ Not Started

### Key Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Alpha testers recruited | 5-10 | - | ⏸️ |
| Posts created (total) | 10-15 | - | ⏸️ |
| "Would use regularly" | 70%+ | - | ⏸️ |
| Survey responses | 6+ | - | ⏸️ |
| Critical bugs | 0 | - | ⏸️ |

### Key Deliverables

- [ ] 5-10 testers recruited
- [ ] Production domain live
- [ ] Feedback form created
- [ ] 10-15 posts seeded
- [ ] Alpha results compiled
- [ ] GO/NO-GO for beta

---

## Phase 3: Beta & Polish (Week 6)

**Goal:** Fix issues and expand to 30-50 users

**Status:** ⏸️ Not Started

### Key Deliverables

- [ ] Alpha issues fixed
- [ ] UX improvements implemented
- [ ] 3-5 design partners recruited
- [ ] 30-50 beta users
- [ ] Platform stable
- [ ] Pre-launch checklist complete

---

## Phase 4: Public Launch (Week 7)

**Goal:** Open to all BYU students and hit MVP metrics

**Status:** ⏸️ Not Started

### MVP Success Metrics (Critical!)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Posts per week | 30+ | - | ⏸️ |
| Unique visitors | 150+ | - | ⏸️ |
| Repeat users | 25%+ | - | ⏸️ |
| Ghost chase rate | <5% | - | ⏸️ |
| Organic posts | 5+ | - | ⏸️ |

**Success Threshold:** 3/5 metrics hit

### Key Deliverables

- [ ] Final bug sweep complete
- [ ] Launch assets created
- [ ] Soft launch executed
- [ ] Full launch executed
- [ ] 30+ posts created
- [ ] 150+ visitors reached
- [ ] Launch results compiled
- [ ] Team retrospective done

---

## Decision Points & Actions Taken

### Phase 0 Decision Point (End of Week 1)
**Date:** ~Late February 2026
**Flyer Density:** Mixed — Tanner Building is flyer-free by policy; other buildings still use flyers
**AI Accuracy:** OpenAI gpt-4o-mini tested and working with validation pipeline
**Decision:** GO (implicit)
**Rationale:** Core technical feasibility proven. AI extraction works. Firestore integration works. Flyer density is a risk but not a blocker — the feed can surface during-event food, not just post-event leftovers.
**Actions Taken:** Proceeded to Phase 1 development. Added OpenAI as primary AI provider alongside Gemini.

### Phase 2-4 Decision Points
Not yet reached.

---

## Blockers & Risks

### Active Blockers
| Issue | Phase | Impact | Owner | Status | Resolution |
|-------|-------|--------|-------|--------|------------|
| No "Mark as Gone" UI | Phase 1 | Medium — stale data risk for alpha | Team | Open | Need to build status toggle before alpha |
| No real-time sync | Phase 1 | Low — polling works for now | Team | Open | Wire `onSnapshot` before alpha |
| No confirmation form | Phase 1 | Medium — users can't edit AI output | Team | Open | AI auto-accepts valid extractions; need edit UI |

### Top Risks
| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| AI extraction errors | Medium | High | Validation pipeline rejects bad extractions; need user edit form | Partially mitigated |
| Low flyer density | Medium | High | Pivot to manual entry or digital sources; explore page + calendar add value without flyers | Monitoring |
| Stale data ("ghost chases") | High | High | Need "Mark as gone" UI + auto-expiration logic | Open risk |
| Can't recruit testers | Medium | Medium | Lower threshold, quality over quantity | Phase 2 |

---

## Key Learnings

### Weeks 1-2 Learnings
- Tanner Building prohibits flyers — need to validate building-by-building, not campus-wide
- Club recruitment framing ("get more people to your event") resonates better than waste reduction
- Liability is a non-issue per two independent interviews
- Leftover supply is lower than expected — feed should focus on "food at upcoming events" not just leftovers

### Weeks 3-6 Learnings (Development)
- OpenAI gpt-4o-mini via Responses API works well as primary extractor; no need to be Gemini-only
- Dual backend mode (Firebase vs local) is valuable for development velocity
- Building matching from free-text AI output requires fuzzy logic (`matchByuBuilding.ts`)
- Date handling from AI is messy — needed coercion logic for wrong years, varied formats
- Development moved faster than documentation — need to keep tracker updated going forward

---

## Quick Links

**Planning Documents:**
- High-Level Plan: `2026-02-16-implementation-plan.md`
- Phase 0 Plan: `phase0-week1-setup-validation.md`
- Phase 1 Plan: `phase1-weeks2-4-core-development.md`
- Phase 2 Plan: `phase2-week5-alpha-testing.md`
- Phase 3 Plan: `phase3-week6-beta-polish.md`
- Phase 4 Plan: `phase4-week7-public-launch.md`

**Project Documentation:**
- Context: `aiDocs/context.md`
- PRD: `aiDocs/prd.md`
- MVP Spec: `aiDocs/mvp.md`
- Architecture: `aiDocs/architecture.md`

**Working Notes:**
- Guides: `ai/guides/`
- Week Notes: `ai/notes/`
- Roadmaps: `ai/roadmaps/`

---

## Update Log

| Date | Phase | Update | By |
|------|-------|--------|-----|
| 2026-02-16 | All | Roadmap created | Team |
| 2026-02-24 | Phase 0 | Interview 1 complete, upload form + Firebase working | Team |
| 2026-04-01 | All | Retroactive alignment — reconciled tracker with actual codebase state | Ava + Claude |

---

**Last Updated:** April 1, 2026
**Next Review:** Before starting Phase 2 (Alpha Testing)
