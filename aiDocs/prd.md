# Product Requirements Document: Scavenger
## Campus Food Discovery Platform

**Version:** 2.0 (Post-Pivot)
**Date:** April 6, 2026
**Status:** Active — Final Sprint
**Team:** BYU MIS Student Team
**Presentations:** April 8, 13, 15, 2026

---

## Executive Summary

**Scavenger** is a real-time campus food discovery platform that turns club food events into a professional recruitment tool. Club leaders post once to their official Slack or email channels — Scavenger automatically ingests those posts and pins them to a live campus map. Students discover free food without needing an app download or account.

**Core Value Proposition:**
- **For Club Leaders:** Zero-effort ingestion from channels you already use. One Slack message becomes a campus-wide map pin automatically.
- **For Students:** Discover free food on campus in real-time — anonymously, no login required.
- **For Sub-Associations:** The biggest beneficiaries — small budgets, high food frequency, limited marketing bandwidth. Scavenger does the work for them.

---

## The Pivot Story

**Original hypothesis (February 2026):** BYU clubs post physical flyers → students scan them → AI extracts event details.

**What we learned (5 club interviews, Feb–Apr 2026):**
- Tanner/Marriott School prohibits physical flyers by policy
- All Round 2 clubs (Sales Society, Finance Society, Women of Accountancy) rely on email + Instagram
- Physical flyers, where used, are just one channel — not the primary one
- Clubs already announce events in official channels; the friction is students *missing* those announcements

**The real insight:** Club leaders don't need a new posting tool. They need Scavenger to *listen* to what they're already doing. When asked about zero-effort ingestion from official channels, clubs rated it **9.7/10 on average** across three independent interviews.

**Pivot (April 2026):** Flyer scanning as MVP input → Email/Slack automated ingestion as primary path.

---

## Problem Statement

BYU clubs spend a significant portion of their budgets on food to drive event attendance and recruitment. Yet:
- Announcements get buried in crowded group chats, emails, and Instagram stories
- Students miss events they would have attended
- Club leaders want *engaged* students, not just warm bodies — but they can't reach the right people

**This is a distribution problem, not a food supply problem.**

Existing solutions fail because:
- **GroupMe free food channels:** Unverified, cluttered, no map, no filter by building or diet
- **Instagram/Email:** Students follow too many channels; event posts get lost
- **Word of mouth:** Doesn't scale beyond existing networks

---

## Target Users

### Primary: The Club Leader (Supply Side)

**Profile:** Michael, 22, President of BYU Sales Society
- Runs bi-weekly trainings with 20+ corporate partners; food at every event
- 500–600 person email list, posts to Instagram + BYU "School Story"
- Wants more *engaged* attendees, not just bodies in seats
- Would use Scavenger if it required zero extra work

**What they need:**
- Automatic posting from official channels (no new workflow)
- Ability to set behavioral expectations for attendees
- Proof that Scavenger reaches the right students

**Key quote:** *"I'd rather have half the people and all of them be engaged... if this helps us find those one or two students who really want to learn, it's worth it."*

---

### Secondary: The Sub-Association Leader (Best Early Adopter)

**Profile:** A smaller club (e.g., niche sales sub-group, Finance Society sub-association) under a larger umbrella
- Smaller budget → food less frequent but higher relative impact
- Less marketing bandwidth → automation is a bigger win
- Mentioned independently by both Sales Society and Finance Society

**Why they're the go-to-market segment:** Lower bar to adopt, highest relative benefit from automation.

---

### Demand Side: The Student

**Profile:** Tyler, 20, Sophomore CS — full course load, part-time job, food-insecure
- Browses anonymously — no login, no stigma
- Wants to know: what food, where, right now
- Mentioned by Women of Accountancy: anonymity (club leaders can't see who found event via app) lowers the awkwardness barrier

---

## Core Features

### 1. Email / Slack Ingestion (Primary Path)
Club leaders connect their official email or Slack channel. Scavenger listens for event announcements and automatically extracts event details via AI.

- **Email:** Parse forwarded or connected club emails
- **Slack:** Monitor designated channels via Slack API (`src/backend/slack/`)
- **Verification:** Posts are only created from verified official channels — this is both a trust signal for students and a compliance argument for clubs navigating BYU red tape
- **Future:** Teams/Outlook integration (potential BYU mandate — unconfirmed, needs follow-up)

### 2. Manual Text Entry (Secondary Path)
Club leader pastes event announcement text into the app. AI extracts the details. Lower friction than flyer upload.

### 3. Flyer Upload (Tertiary Path)
Photo of a physical flyer → OpenAI gpt-4o-mini extracts details → validation → map pin. Useful for non-digital clubs and edge cases.

### 4. Live Campus Map
Events pinned to a Leaflet-based BYU campus map. Students see what's happening where, right now.

### 5. Event Feed
Chronological feed of upcoming food events. Responsive card grid, mobile-first. Filter by building, time, food type.

### 6. Event Detail
- Food description, location, time, host
- **Requirements / Expectations field** — "Stay for the duration," "Business Casual," "Come prepared to network." Requested by Sales Society and Finance Society. Helps clubs attract engaged attendees.
- **Club Link field** — Optional URL to club signup form, interest form, or QR code. Requested by Finance Society and Women of Accountancy. Converts food visitors into registered members.
- **Scarcity note** — "Food for the first 100 people." Requested by Women of Accountancy. Creates urgency.

### 7. "BYU Official" Verified Badge
Posts ingested from verified official channels display a "BYU Official" badge. Helps clubs that face administrative approval requirements (like Women of Accountancy, which requires 2-faculty flyer approval).

### 8. "Mark as Gone" (Pre-Alpha Blocker)
Status field exists in data model but no UI toggle yet. Required before alpha testing.

---

## What's NOT in Scope (MVP)

- User accounts or login (anonymous browsing is a feature, not a bug)
- Real-time `onSnapshot` sync (polling works for MVP)
- Multi-campus support (BYU pilot first)
- Monetization
- Push notifications

---

## User Stories

### Club Leader
- As a club leader, I want Scavenger to automatically create a map pin when I post in my club's official Slack channel, so I don't have to do any extra work.
- As a club leader, I want to set behavioral expectations on my event pin so that students know to stay for the full event before showing up.
- As a club leader, I want a "Join Club" link on my event pin so food visitors can sign up directly.
- As a club leader, I want to know my post is verified as coming from an official channel so it helps my club's credibility.

### Student
- As a student, I want to see a map of all free food events happening on campus today so I can find something near my next class.
- As a student, I want to browse anonymously so I don't feel embarrassed about looking for free food.
- As a student, I want to see what food is available and where without creating an account.

---

## Assumptions Validated

| Assumption | Status | Source |
|-----------|--------|--------|
| Clubs use physical flyers as primary channel | ❌ Falsified | Round 1 (Kendall, Carson) + Round 2 (all 3 clubs) |
| Automation from official channels is wanted | ✅ Strongly confirmed (9.7/10 avg) | Michael Nichols 10/10, Molly Wakefield 9/10, Abigail Armstrong 10/10 |
| Manual posting (5–10 min) is acceptable | ✅ Confirmed | All 3 Round 2 interviewees said yes |
| Liability is a concern | ✅ Falsified | 0/5 interviews raised concerns |
| Professionalism tension is real | ✅ Confirmed (2/3) | Sales Society, Finance Society |
| Sub-associations are the best early adopters | 💡 New hypothesis | Both Sales Society and Finance Society flagged sub-clubs independently |
| Anonymous browsing removes stigma | ✅ Supported | Women of Accountancy confirmed |
| Slack is the universal channel | ⚠️ At Risk | Finance Society + Accountancy don't use Slack; email is more universal |

---

## Success Metrics (MVP)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Posts per week | 30+ | Proves supply-side activation |
| Unique visitors | 150+ | Proves demand-side awareness |
| Repeat users | 25%+ | North Star: product has value |
| "Ghost chase" rate | <5% | Proves data accuracy and trust |
| Organic posts (non-team) | 5+ | Proves user evangelism |

**Threshold:** 3/5 metrics = MVP success.

---

## Competitive Differentiation

| Feature | Scavenger | GroupMe Free Food | Instagram |
|---------|-----------|-------------------|-----------|
| Verified posts (no trolls) | ✅ | ❌ | ❌ |
| Campus map | ✅ | ❌ | ❌ |
| Zero-effort automation | ✅ (planned) | ❌ | ❌ |
| No login required | ✅ | ❌ | ❌ |
| Professional framing | ✅ | ❌ | Partial |
| Sub-association friendly | ✅ | ❌ | ❌ |

---

## Technical Summary

See `aiDocs/architecture.md` for full technical details.

- **Frontend:** Next.js 16 + React 19 + Tailwind 4
- **Database:** Firestore (Firebase)
- **AI (Primary):** OpenAI gpt-4o-mini via Responses API
- **AI (Secondary):** Gemini 2.0 Flash
- **Maps:** Leaflet (open-source, no API key)
- **Hosting:** Vercel
- **Auth:** None in MVP (anonymous browsing)

---

## Open Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low supply-side adoption | Medium | High | Automation removes friction; sub-association go-to-market |
| Stale data ("ghost chases") | High | High | "Mark as Gone" UI needed before alpha |
| Slack not universal | Medium | Medium | Email ingestion as first-class path |
| BYU Teams/Outlook mandate | Low/Unknown | Medium | Research; email path covers Outlook already |
| Professionalism concerns | Medium | Medium | Requirements field addresses this |
