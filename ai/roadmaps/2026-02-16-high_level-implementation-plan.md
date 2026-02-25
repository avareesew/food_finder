# Scavenger Implementation Plan
## High-Level Project Roadmap

**Date Created:** February 16, 2026  
**Status:** Pre-Development Planning  
**Purpose:** Strategic roadmap from setup to launch

---

## ⚠️ Project Philosophy

**AVOID:**
- ❌ Over-engineering (build what we need, not what we might need)
- ❌ Cruft and technical debt (clean code from day one)
- ❌ Legacy compatibility (modern APIs only - we're greenfield)
- ❌ Premature optimization (make it work, then make it fast)
- ❌ Feature creep (strict MVP scope)

**EMBRACE:**
- ✅ Simple solutions over clever ones
- ✅ Delete code that isn't essential
- ✅ Ship fast, iterate faster
- ✅ Modern patterns and latest stable versions

---

## Overview: 7-Week MVP → Launch

```
Phase 0: Setup & Validation          (Week 1)
Phase 1: Core Development             (Weeks 2-4)
Phase 2: Alpha Testing                (Week 5)
Phase 3: Beta & Polish                (Week 6)
Phase 4: Public Launch                (Week 7)
```

---

## Phase 0: Setup & Validation (Week 1)

**Goal:** Confirm all assumptions before writing code

### 0.1 - Environment Setup
- Obtain Gemini API key
- Create Firebase project (Firestore + Storage)
- Initialize Next.js 14 project
- Set up environment variables
- Deploy "Hello World" to Vercel (verify pipeline works)

**Checkpoint:** Can we deploy a blank Next.js app to production?

---

### 0.2 - BYU Campus Validation
- Walk campus high-traffic areas (TMCB, Wilkinson, Talmage, Library)
- Photograph 20-30 real event flyers
- Document: How many flyers exist? What info do they contain?
- Interview 3-5 club presidents about their event posting habits

**Key Questions:**
- Do clubs actually print physical flyers? (70%+ threshold)
- What's the typical flyer format?
- Would organizers use this platform?

**Checkpoint:** Is flyer scanning the right primary input method?

---

### 0.3 - Gemini API Validation
- Test Gemini 2.0 Flash with 10 real BYU flyers
- Measure extraction accuracy (target: 80%+ correct)
- Measure response time (target: <3 seconds)
- Test JSON schema extraction with our Post schema

**Key Questions:**
- Can Gemini parse BYU flyers accurately?
- Does JSON schema output work reliably?
- Are there edge cases we need to handle?

**Checkpoint:** Can we build the core feature with this API?

**Decision Point:** If accuracy <70%, consider:
- Improving prompt engineering
- Adding image preprocessing
- Manual entry fallback only

---

### 0.4 - Database Schema Finalization
- Create Firestore collections structure
- Define indexes needed for queries
- Set up security rules (MVP: public read/write)
- Test write → read → real-time update flow

**Checkpoint:** Does Firestore real-time sync work as expected?

---

## Phase 1: Core Development (Weeks 2-4)

**Goal:** Build the essential "flyer → feed" pipeline

### Week 2: Upload & Extraction

**Focus:** Get flyer photos into the system and extract data

#### 2.1 - Image Upload UI
- Mobile-first upload form (camera + file picker)
- Image preview before submission
- File size validation (<10MB)
- Basic loading states

#### 2.2 - Gemini API Integration
- API route: POST /api/extract-flyer
- Convert uploaded image to base64
- Call Gemini with JSON schema
- Return extracted data to frontend

#### 2.3 - Confirmation Form
- Pre-populate form with AI-extracted data
- Allow user to edit any field
- Validate required fields (event name, location, time, food)
- Submit to Firestore

**Week 2 Checkpoint:** Can a user upload a flyer and create a post?

---

### Week 3: Feed & Display

**Focus:** Show posts in a real-time, mobile-friendly feed

#### 3.1 - Feed UI Component
- Card layout for each post
- Display: event name, location, time, food description
- Sort by time (soonest first)
- Mobile-responsive design

#### 3.2 - Firestore Integration
- Query posts where status = 'available'
- Set up real-time listener (onSnapshot)
- Auto-update feed when new posts added
- Handle loading and error states

#### 3.3 - Event Detail View
- Tap card to see full details
- Show flyer image if available
- Display all metadata
- "Back to feed" navigation

**Week 3 Checkpoint:** Can users browse a live-updating feed?

---

### Week 4: Status Management & Polish

**Focus:** Make data accurate and UI polished

#### 4.1 - "Mark as Gone" Feature
- Generate unique edit link for post creator
- Simple status toggle (available → gone)
- Update propagates to all clients in real-time
- Gone posts disappear from feed

#### 4.2 - Time-Based Features
- Auto-expire posts after event end time
- "Happening Now" indicator for active events
- Relative time display ("In 30 min", "Today at 5pm")
- Countdown timer for imminent events

#### 4.3 - UI Polish
- Loading skeletons
- Empty states ("No food events this week")
- Error handling (network issues, API failures)
- Mobile gestures (pull to refresh)
- Basic animations (smooth transitions)

**Week 4 Checkpoint:** Is the core flow polished and bug-free?

---

## Phase 2: Alpha Testing (Week 5)

**Goal:** Get real user feedback on working prototype

### 5.1 - Pre-Alpha Prep
- Deploy to production domain (scavenger.app or similar)
- Create simple landing page explaining the concept
- Prepare feedback form (Google Form or Typeform)
- Set up analytics (GA4 for basic tracking)

---

### 5.2 - Alpha Tester Recruitment
- Recruit 5-10 testers (mix of both personas):
  - 3-4 "Hungry Hustlers" (demand side)
  - 2-3 "Club Recruiters" (supply side)
- Brief them on the concept
- Give them the URL
- Ask them to use it naturally for 1 week

---

### 5.3 - Manual Seeding
- Team posts 10-15 real BYU food events
- Ensure feed is never empty during alpha
- Document any issues encountered while posting
- Track: How long does posting take? Any confusion?

---

### 5.4 - Observation & Feedback
- Monitor usage daily (check analytics)
- Watch for error logs (Vercel dashboard)
- Send mid-week check-in to testers
- End-of-week survey:
  - Would you use this regularly? (Yes/No)
  - What's confusing?
  - What's missing?
  - What would you change?

**Key Metrics:**
- Do testers successfully find food? (success rate)
- Do organizers post without help? (supply activation)
- "Ghost chase" rate (<5% target)
- Any critical bugs or UX blockers?

**Week 5 Checkpoint:** Is this solving a real problem? What needs fixing?

**Decision Point:** 
- If testers love it → proceed to beta
- If major UX issues → fix before wider release
- If concept doesn't resonate → pivot or revisit assumptions

---

## Phase 3: Beta & Polish (Week 6)

**Goal:** Fix alpha issues and prepare for public launch

### 6.1 - Alpha Feedback Implementation
- Prioritize top 3 issues from alpha
- Fix critical bugs
- Improve confusing UX flows
- Address accessibility issues

---

### 6.2 - Design Partner Recruitment
- Recruit 3-5 high-volume clubs as "design partners"
- CS Club, Pre-Med Society, major RSOs
- Offer: "We'll feature your events prominently"
- Goal: Consistent supply of posts

---

### 6.3 - Beta Expansion
- Expand to 30-50 users (still invite-only)
- Post in select Discord/Slack channels
- Target mix of majors and involvement levels
- Continue manual seeding (5-10 posts/week)

---

### 6.4 - Monitoring & Iteration
- Daily check-ins on metrics
- Fix bugs as they appear
- Optimize slow queries
- Improve SEO (meta tags, Open Graph)

**Week 6 Checkpoint:** Is the platform stable? Are metrics trending up?

---

## Phase 4: Public Launch (Week 7)

**Goal:** Open to all BYU students, hit 30+ posts/week

### 7.1 - Pre-Launch Prep
- Final bug sweep
- Stress test (can it handle 200+ concurrent users?)
- Prepare launch assets:
  - Social media graphics
  - Launch announcement copy
  - Short demo video (30 seconds)
- Set up monitoring alerts (downtime, errors)

---

### 7.2 - Launch Day
- Soft launch: Post in BYU subreddit, class Slack channels
- Share in ward GroupMe/iMessage groups
- Ask design partners to promote to their members
- Post on BYU campus Facebook groups

**Launch Message Template:**
> "Tired of missing free pizza? 🍕 Scavenger shows you every free food event on campus in real-time. No app download, just browse: [scavenger.app]"

---

### 7.3 - Week 1 Post-Launch
- Monitor usage hourly (first 48 hours)
- Respond to issues quickly (<2 hour response time)
- Engage with users who give feedback
- Document what's working and what's breaking

**Success Criteria (Week 7 Goals):**
- 30+ posts in the week
- 150+ unique visitors
- 25% repeat usage rate
- <5% ghost chase rate
- 5+ organic posts (non-team, non-design partners)

**Week 7 Checkpoint:** Did we hit our success metrics?

---

## Post-Launch: Weeks 8-12 (Phase 2 Prep)

**Goal:** Validate product-market fit, plan next features

### Weeks 8-9: Observation & Analysis
- Let usage stabilize naturally
- Identify organic growth patterns
- Document user requests and pain points
- Survey active users (NPS, feature requests)

**Key Questions:**
- Are students using this without prompting?
- Are clubs posting regularly?
- What features do people ask for most?
- Where do users drop off?

---

### Weeks 10-11: Phase 2 Planning
- Prioritize features based on user feedback
- Likely candidates:
  - "Gone" button improvements (first responder verification)
  - Location filtering (show only my building)
  - Slack bot for automated posting
  - Email forwarding for club announcements
  - Gamification (badges for consistent posters)

**Decision Points:**
- If usage is growing → invest in automation (Slack/email)
- If accuracy is an issue → invest in verification features
- If discovery is a problem → invest in notifications

---

### Week 12: Phase 2 Design
- Create Phase 2 PRD (focused on 1-2 features)
- Design new features based on validated learnings
- Plan 4-week sprint for Phase 2 development

---

## Risk Mitigation Strategies

### Risk: Low Supply (No Posts)
**Plan A:** Manual seeding by team (10-15 posts/week)  
**Plan B:** Recruit design partners (guarantee supply)  
**Plan C:** Add Slack bot earlier (automate supply)

### Risk: High "Ghost Chase" Rate (Stale Data)
**Plan A:** Aggressive auto-expiration (posts gone after end time)  
**Plan B:** First responder verification system  
**Plan C:** Require uploaders to mark as gone

### Risk: Technical Failures (Downtime)
**Plan A:** Use Vercel's 99.9% uptime SLA  
**Plan B:** Set up monitoring alerts  
**Plan C:** Have rollback plan (previous deployment)

### Risk: Gemini API Rate Limits
**Plan A:** Stay well within free tier (50 posts/week = 7/day vs 1,500/day limit)  
**Plan B:** Implement request queuing  
**Plan C:** Upgrade to paid tier if needed (~$10/month)

---

## Success Metrics by Phase

| Phase | Metric | Target | Why It Matters |
|-------|--------|--------|----------------|
| **Week 2** | Upload works | 100% success rate | Core feature must be reliable |
| **Week 3** | Feed loads | <2s load time | Users won't wait |
| **Week 5 (Alpha)** | Testers like it | 70%+ say "yes, would use" | Product-market fit signal |
| **Week 7 (Launch)** | Posts | 30+/week | Validates supply side |
| **Week 7 (Launch)** | Visitors | 150+ unique | Validates demand side |
| **Week 7 (Launch)** | Repeat users | 25%+ | North Star metric |

---

## Key Decision Points

### Decision Point 1 (End of Week 1)
**Question:** Is flyer scanning feasible?
- **Yes:** Proceed with plan
- **No:** Pivot to manual entry focus, add Slack bot sooner

### Decision Point 2 (End of Week 5)
**Question:** Do alpha testers see value?
- **Yes:** Scale to beta
- **Mixed:** Fix issues before expanding
- **No:** Revisit core assumptions

### Decision Point 3 (End of Week 7)
**Question:** Did we hit MVP success metrics?
- **Yes:** Plan Phase 2 features
- **Close:** Continue iteration, light marketing
- **No:** Analyze why, consider pivot

---

## What We're NOT Building (MVP)

To avoid scope creep, explicitly list what's OUT:

- ❌ User accounts / authentication
- ❌ Push notifications
- ❌ Map view / geolocation
- ❌ In-app messaging
- ❌ Social features (likes, comments, shares)
- ❌ Admin dashboard
- ❌ Mobile native app
- ❌ Multi-campus support
- ❌ Calendar integration
- ❌ Slack bot (Phase 2)
- ❌ Email parsing (Phase 2)

**Rule:** If it's not in "flyer → feed → gone" flow, we don't build it yet.

---

## Phase 2 Features (Weeks 8-16)

**Only if MVP succeeds. These are candidates, not commitments.**

### Automation (High Priority)
- Slack bot for automated posting
- Email forwarding (forward@scavenger.app)
- Calendar integration (Google Calendar sync)

### Verification (Medium Priority)
- First responder "Still There?" button
- Photo verification (user uploads photo at location)
- Reputation system (reliable posters get badges)

### Discovery (Medium Priority)
- Location filtering (show only my building)
- "Notify Me" for specific buildings/times
- Food type tags (vegetarian, vegan, gluten-free)

### Scale (Low Priority)
- Multi-campus support (add Vanderbilt, UVU, etc.)
- Native mobile app (React Native)
- B2B dashboard for universities

---

## Resources & References

- **Context:** `aiDocs/context.md`
- **Architecture:** `aiDocs/architecture.md`
- **PRD:** `aiDocs/prd.md`
- **MVP Spec:** `aiDocs/mvp.md`
- **API Docs:** `ai/guides/`

---

## Timeline Visual

```
Week 1:  [Setup & Validation]
Week 2:  [Upload & Extraction Development]
Week 3:  [Feed & Display Development]
Week 4:  [Status & Polish Development]
Week 5:  [Alpha Testing (5-10 users)]
Week 6:  [Beta Testing (30-50 users)]
Week 7:  [Public Launch → 150+ users]
Week 8+: [Observe & Plan Phase 2]
```

---

## Notes for Implementation

- Start each week with a clear goal
- End each week with a checkpoint
- If a checkpoint fails, don't proceed—fix it
- Kill features ruthlessly if they're not essential
- Ship incomplete features rather than delay
- Validate assumptions before writing code
- Delete code that doesn't serve the MVP

**Remember:** A working, simple product beats a perfect, complex one.

---

**Last Updated:** February 16, 2026  
**Status:** Ready to begin Week 1 (Setup & Validation)
