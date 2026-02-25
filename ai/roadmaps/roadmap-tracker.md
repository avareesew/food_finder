# Scavenger MVP Roadmap Tracker
## 7-Week Implementation Roadmap

**Date Created:** February 16, 2026  
**Last Updated:** February 24, 2026  
**Purpose:** Track progress across all phases of MVP development  
**Status:** Phase 0 In Progress · Phase 1 In Progress

---

## Quick Reference

| Phase | Timeline | Focus | Plan Document | Status |
|-------|----------|-------|---------------|--------|
| Phase 0 | Week 1 | Setup & Validation | `phase0-week1-setup-validation.md` | 🔄 In Progress |
| Phase 1 | Weeks 2-4 | Core Development | `phase1-weeks2-4-core-development.md` | 🔄 In Progress |
| Phase 2 | Week 5 | Alpha Testing | `phase2-week5-alpha-testing.md` | ⏸️ Not Started |
| Phase 3 | Week 6 | Beta & Polish | `phase3-week6-beta-polish.md` | ⏸️ Not Started |
| Phase 4 | Week 7 | Public Launch | `phase4-week7-public-launch.md` | ⏸️ Not Started |

**Status Key:**
- ⏸️ Not Started
- 🔄 In Progress
- ✅ Complete
- ⚠️ Blocked
- ❌ Failed

---

## Phase 0: Setup & Validation (Week 1)

**Goal:** Confirm all assumptions before writing code

### Critical Checkpoints

| Checkpoint | Status | Notes |
|-----------|--------|-------|
| Can we deploy to production? | 🔄 In Progress | Next.js + Firebase initialized; Vercel deploy pending |
| Do BYU clubs print physical flyers? | ⚠️ At Risk | Tanner/Marriott prohibits flyers by policy (Interview 1) — need more data |
| Can Gemini extract data accurately? | ⏸️ | Not yet tested |
| Does Firestore real-time sync work? | 🔄 In Progress | Firebase client initialized; upload API writing to Firestore |

### Key Deliverables

- [x] Firebase project set up (`src/lib/firebase.ts` initialized)
- [x] Next.js project created and running locally
- [ ] Gemini API key obtained
- [ ] Next.js deployed to Vercel
- [ ] 20-30 BYU flyers photographed
- [x] 3-5 club president interviews — 1/3+ complete (Kendall Castlelaw, 2026-02-24; see `ai/notes/week1-club-interviews.md`)
- [ ] Gemini accuracy tested (80%+ target)
- [ ] Firestore real-time verified
- [ ] GO/NO-GO decision made

**Expected Completion:** [Date]  
**Actual Completion:** [Date]  
**Decision:** [GO / NO-GO / MODIFY]

---

## Phase 1: Core Development (Weeks 2-4)

**Goal:** Build "flyer → feed → gone" pipeline

### Week 2: Upload & Extraction

**Key Milestones:**
- [x] Upload form component built (`src/components/UploadForm.tsx` — drag-and-drop, preview, error/success states)
- [x] Firebase Storage upload working (`src/app/api/upload/route.ts`)
- [x] Firestore document creation on upload (`src/services/flyers.ts`)
- [ ] Gemini API integrated
- [ ] Confirmation form complete

**Expected Completion:** [Date]  
**Actual Completion:** [Date]

### Week 3: Feed & Display

**Key Milestones:**
- [x] Event card component built (`src/components/ui/EventCard.tsx`)
- [x] Feed page with Firestore query and mock data fallback (`src/app/feed/page.tsx`)
- [x] Event detail view (`src/app/events/[id]/page.tsx`)
- [ ] Real-time listener (currently `getDocs` polling — `onSnapshot` pending)

**Expected Completion:** [Date]  
**Actual Completion:** [Date]

### Week 4: Status & Polish

**Key Milestones:**
- [ ] "Mark as gone" feature works
- [ ] Time-based features complete
- [ ] UI polished (mobile-first)
- [ ] All error states handled
- [ ] Core flow end-to-end working

**Expected Completion:** [Date]  
**Actual Completion:** [Date]

**Checkpoint:** ✅ Core flow works end-to-end?  
**Status:** ⏸️

---

## Phase 2: Alpha Testing (Week 5)

**Goal:** Validate with 5-10 real users

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

**Expected Completion:** [Date]  
**Actual Completion:** [Date]  
**Decision:** [GO / MODIFY / NO-GO]

---

## Phase 3: Beta & Polish (Week 6)

**Goal:** Fix issues and expand to 30-50 users

### Key Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Beta users | 30-50 | - | ⏸️ |
| Design partners | 3-5 | - | ⏸️ |
| Posts this week | 20+ | - | ⏸️ |
| Ghost chase rate | <5% | - | ⏸️ |
| Critical bugs | 0 | - | ⏸️ |

### Key Deliverables

- [ ] Alpha issues fixed
- [ ] UX improvements implemented
- [ ] 3-5 design partners recruited
- [ ] 30-50 beta users
- [ ] Platform stable
- [ ] Pre-launch checklist complete

**Expected Completion:** [Date]  
**Actual Completion:** [Date]  
**Launch Ready:** [YES / NO]

---

## Phase 4: Public Launch (Week 7)

**Goal:** Open to all BYU students and hit MVP metrics

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

**Expected Completion:** [Date]  
**Actual Completion:** [Date]  
**Metrics Achieved:** X/5

---

## Decision Points & Actions Taken

### Phase 0 Decision Point (End of Week 1)
**Date:** [Date]  
**Flyer Density:** [X%]  
**Gemini Accuracy:** [X%]  
**Decision:** [GO / MODIFY / NO-GO]  
**Rationale:** [Why]  
**Actions Taken:** [What changed]

### Phase 2 Decision Point (End of Week 5)
**Date:** [Date]  
**Alpha Satisfaction:** [X%]  
**Critical Issues:** [List]  
**Decision:** [GO / MODIFY / NO-GO]  
**Actions Taken:** [What changed]

### Phase 3 Decision Point (End of Week 6)
**Date:** [Date]  
**Beta Stability:** [Assessment]  
**User Growth:** [X users]  
**Decision:** [LAUNCH / DELAY]  
**Actions Taken:** [What changed]

### Phase 4 Results (End of Week 7)
**Date:** [Date]  
**Metrics Achieved:** [X/5]  
**Product-Market Fit:** [YES / NO / MAYBE]  
**Decision:** [CONTINUE / PIVOT / PAUSE]  
**Actions Taken:** [Next steps]

---

## Blockers & Risks

### Active Blockers
| Issue | Phase | Impact | Owner | Status | Resolution |
|-------|-------|--------|-------|--------|------------|
| - | - | - | - | - | - |

### Top Risks
| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Gemini accuracy <70% | Low | High | Fallback to manual entry | Monitoring |
| Low flyer density | Medium | High | Pivot to Slack/email | Week 1 validation |
| Can't recruit testers | Medium | Medium | Lower threshold, quality over quantity | Week 5 |
| Technical issues on launch | Medium | High | Stress test in Week 6, have rollback plan | Pre-launch |

---

## Key Learnings (Updated Weekly)

### Week 1 Learnings
- [To be filled]

### Week 2-4 Learnings
- [To be filled]

### Week 5 Learnings
- [To be filled]

### Week 6 Learnings
- [To be filled]

### Week 7 Learnings
- [To be filled]

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

## Team Sync Schedule

**Week 1:** Daily check-ins (15 min)  
**Weeks 2-4:** Mon/Wed/Fri check-ins (15 min)  
**Week 5:** Daily check-ins + mid-week review  
**Week 6:** Daily check-ins + end-of-week readiness review  
**Week 7:** Twice-daily check-ins (morning/evening)

---

## Update Log

| Date | Phase | Update | By |
|------|-------|--------|-----|
| 2026-02-16 | All | Roadmap created | Team |
| - | - | - | - |

---

**Last Updated:** February 16, 2026  
**Next Review:** [When Phase 0 starts]
