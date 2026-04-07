# Scavenger — Current Roadmap
**Date:** April 6, 2026
**Status:** Final Sprint (April 1–8) → Post-Presentation Alpha

> ⚠️ Avoid over-engineering, cruft, and legacy compatibility shims. This is a clean, fast-moving project. Build the minimum that works. Delete unused code.

---

## Where We Are

### ✅ Done — Phase 0: Setup & Validation (Feb 2026)
- Firebase + Next.js initialized
- OpenAI gpt-4o-mini and Gemini 2.0 Flash integrated
- 5 club president interviews across 2 rounds
- **Flyer assumption falsified** — pivot to email/text ingestion confirmed
- Core assumption validated: automation from official channels rated **9.7/10 avg**

### ✅ Done — Phase 1: Core Development (Feb–Mar 2026)
- Flyer upload → OpenAI extraction → validation → Firestore → feed (full pipeline)
- Feed page, event cards, event detail view, event detail modal
- Home page (hero, weekly calendar, discover preview, campus map CTA)
- Explore page (campus buildings grid + map)
- About page
- Dark mode
- BYU campus building data (lat/lng, aliases, fuzzy matching)
- Dual backend mode (Firebase + local filesystem)
- Slack ingestion pipeline (backend complete: `src/backend/slack/`)
- Auth system (login, register, user profiles, admin page)
- Upload auth gate

### 🔄 In Progress — Final Sprint (April 1–8)
- [x] Round 2 customer interviews (Michael Nichols, Molly Wakefield, Abigail Armstrong)
- [ ] Club president submission form (paste email/text → AI extract → feed pin)
- [ ] Demo polish and mobile testing
- [ ] Presentation slides + live demo script
- [ ] Full team rehearsal (April 7)
- [ ] All materials submitted (April 8)

**Presentations:** April 8, 13, 15

---

## Pre-Alpha Blockers (Must Fix Before Alpha Testing)

| Item | File(s) | Priority |
|------|---------|----------|
| "Mark as Gone" UI | `src/app/events/[id]/page.tsx` | 🔴 Critical |
| Real-time `onSnapshot` on feed | `src/app/feed/page.tsx` | 🔴 Critical |
| Confirmation/edit form for AI output | `src/components/UploadForm.tsx` | 🟡 High |
| Vercel production deployment | `vercel.json` exists, deploy not confirmed | 🔴 Critical |

---

## Next Phase — Alpha Testing (Post-April 8)

**Target:** 5–10 sub-association leaders as first users

**Why sub-associations first:**
- Smaller budgets → automation is a bigger win relative to their capacity
- Higher food frequency → more map pins → better student experience
- Less marketing bandwidth → Scavenger does more of the work for them
- Mentioned independently by both Sales Society and Finance Society

### Alpha Deliverables
- [ ] Deploy to Vercel (production URL live)
- [ ] Build email ingestion UI (the #1 validated feature)
- [ ] Add Requirements / Expectations field to event pins
- [ ] Add Club Link field to event pins (signup URL)
- [ ] Add Scarcity note field ("Food for first X people")
- [ ] Fix pre-alpha blockers above
- [ ] Recruit 5–10 sub-association leaders
- [ ] Seed 10–15 real events
- [ ] Collect feedback after 2 weeks

### Alpha Success Metrics
| Metric | Target |
|--------|--------|
| Club leaders posting | 3+ |
| Events created (total) | 10–15 |
| "Would use regularly" | 70%+ |
| Pre-alpha blockers | 0 open |

---

## Future Phases

### Beta (30–50 Users)
- Fix alpha issues
- Expand to 3–5 design partner clubs
- Real-time feed (`onSnapshot`)
- Teams/Outlook integration (if BYU mandate confirmed)
- Analytics (GA4)
- Rate limiting on upload endpoints

### Public Launch
- Open to all BYU students
- Social media announcement
- Share in BYU ward groups and clubs

**Launch Success Metrics:**
- 30+ posts/week
- 150+ unique visitors
- <5% ghost chase rate
- 25% repeat users
- 5+ organic posts (non-team)

---

## Open Questions / Risks

| Risk | Status | Action |
|------|--------|--------|
| BYU Teams/Outlook mandate | Unconfirmed | Follow up with BYU club administration |
| Slack not universal | Confirmed risk | Email path is first-class; Slack is additive |
| Ghost chases from stale data | Open | "Mark as Gone" UI required before alpha |
| Sub-association adoption | Untested | Alpha target segment |
