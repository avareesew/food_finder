# Product Requirements Document: Scavenger
## Campus Food Finder Platform

**Version:** 1.0  
**Date:** February 16, 2026  
**Status:** Draft - MVP Specification  
**Team:** BYU Student Team  
**Target Launch:** 7 Weeks from Kickoff

---

## Executive Summary

**Scavenger** is a real-time campus food discovery platform that makes "invisible" surplus food from club events, department meetings, and campus activities discoverable to students. By leveraging Gemini 2.0 Flash for AI-powered flyer parsing and a stigma-free, account-free interface, Scavenger solves the information asymmetry between available free food and students who need it.

**Core Value Proposition:**
- **For Students:** Never miss free food on campus—discover it in real-time
- **For Club Organizers:** Increase event attendance and reduce food waste
- **For Universities:** Quantifiable sustainability metrics and student retention support

**MVP Scope:** Single-campus pilot at BYU with manual flyer scanning, AI-assisted data entry, and real-time feed.

---

## Problem Statement

### The Market Problem

**41% of college students experience food insecurity**, yet thousands of pounds of perfectly good food goes to waste daily on campus from club meetings, department events, and catered activities. This represents a **data visibility problem**, not a food supply problem.

**The "Dark Data" Gap:**
- Physical flyers are posted on bulletin boards but not digitized
- Event organizers announce food availability, but information doesn't spread beyond attendees
- Students walk past buildings with leftover catering, unaware it exists
- Traditional food pantries have fixed hours and stigma barriers

**Why Existing Solutions Fall Short:**
- **Too Good To Go:** Requires payment, only works with commercial restaurants, limited campus presence
- **Campus Pantries:** Fixed hours, formal application processes, social stigma
- **Freebites (Tufts):** Limited to single campus, requires manual data entry (high friction)
- **Word-of-mouth:** Doesn't scale, benefits only well-connected students

### The BYU Context

**Why BYU is the ideal pilot:**
- ~33,000 students with high event density (hundreds of clubs)
- Service-oriented culture reduces stigma around food sharing
- High-trust environment (Honor Code) facilitates peer-to-peer sharing
- Built-in distribution channels (ward system, major-specific orgs, clubs)
- Team is on-campus for rapid iteration and validation

---

## Target Users

### Primary User Personas

#### 1. **The Hungry Hustler** (Demand Side)
**Profile:** Tyler, 20, Sophomore Computer Science Major
- Full course load (18 credits) + part-time job
- Limited meal plan budget ($50/week)
- Spends 10+ hours/day on campus
- Tech-savvy, uses mobile-first apps

**Pain Points:**
- Misses free food events because he doesn't see flyers
- Can't afford regular dining hall meals between classes
- Doesn't want to use food pantry due to inconvenient hours

**Jobs to Be Done:**
- "Help me find free, high-calorie food near my current location"
- "Show me what's available right now, not what was available 3 hours ago"
- "Let me browse anonymously without creating an account"

---

#### 2. **The Club Recruiter** (Supply Side)
**Profile:** Sarah, 22, Marketing Club President
- Responsible for $2,000 annual event budget
- Needs to justify spending by showing attendance
- Orders catering for 50 people, but only 30 attend

**Pain Points:**
- Leftover pizza sits in the room until it's thrown away
- Feels guilty about food waste but doesn't know how to redistribute
- Worried about liability if someone gets sick from leftovers

**Jobs to Be Done:**
- "Help me attract more attendees to my event with leftover food"
- "Let me quickly post leftovers without complex forms"
- "Assure me I'm legally protected when sharing food"

---

#### 3. **The Eco-Conscious RA** (Supply Side + Advocate)
**Profile:** Marcus, 24, Resident Advisor, Environmental Studies Major
- Coordinates floor events with catering
- Passionate about sustainability and waste reduction
- Has influence over 40+ residents

**Pain Points:**
- Sees surplus food from hall council meetings go to waste
- Wants to align floor activities with sustainability values
- Lacks tools to efficiently redistribute leftovers

**Jobs to Be Done:**
- "Help me reduce food waste from floor events"
- "Let me notify my residents when there's surplus food"
- "Track the environmental impact of redistributed meals"

---

## Product Goals & Success Metrics

### MVP Goals (Week 7)

| Goal | Target Metric | Measurement |
|------|---------------|-------------|
| **Prove Supply** | 30+ posts per week | Dashboard analytics |
| **Prove Demand** | 150+ unique visitors per week | Google Analytics |
| **Prove Accuracy** | <5% "ghost chase" rate | User feedback surveys |
| **Prove Retention** | 25% weekly repeat users | User tracking (cookieless) |
| **Prove Organicity** | 5+ organic posts (non-team) | Post metadata |

### North Star Metric
**Weekly Repeat Usage Rate:** If a student finds food once and comes back, the product has value.

### Long-Term Vision Goals (6-12 Months)
- **Multi-campus expansion:** Live at 5+ universities
- **B2B sustainability API:** 1-2 university partnerships for ESG data
- **Automated ingestion:** 50% of posts via Slack/email integration
- **Waste impact:** 10,000+ meals redistributed, quantified CO2 savings

---

## Competitive Landscape & Positioning

### Direct Competitors

| Competitor | Strengths | Weaknesses | Our Differentiation |
|-----------|-----------|------------|---------------------|
| **Freebites** (Tufts) | Proven demand on college campuses | Manual data entry (high friction), single campus | AI-automated flyer parsing, designed for multi-campus scale |
| **Too Good To Go** | Large user base, commercial partnerships | Requires payment ($3-5/bag), no campus focus, restaurant-only | Free for students, campus-specific, peer-to-peer |
| **Olio** | Established food-sharing brand | Manual entry, general community (not campus-optimized) | Campus-optimized, AI ingestion, student-focused UX |

### Indirect Competitors

| Competitor | Strengths | Weaknesses | Our Differentiation |
|-----------|-----------|------------|---------------------|
| **Campus Food Pantries** | Institutional backing, reliable supply | Fixed hours, stigma, formal applications | 24/7 feed, anonymous access, real-time ephemeral food |
| **Word-of-mouth / Group Chats** | Zero friction, organic | Doesn't scale, reaches only connected students | Centralized "single source of truth," searchable archive |

### Market Positioning

**We are NOT:**
- A food pantry (we're not solving hunger via institutional charity)
- A meal-sharing marketplace (we're not facilitating transactions)
- A restaurant surplus app (we're campus-specific)

**We ARE:**
- **The "Bloomberg Terminal for Campus Food"** — a single source of truth for ephemeral food availability
- **A data visibility platform** — solving the information problem, not the supply problem
- **A waste-reduction tool** — helping clubs and departments meet sustainability goals

**Key Differentiators:**
1. **Gemini 2.0 Flash AI** (30x cost advantage over GPT-4o competitors)
2. **Stigma-free UX** (no accounts, no applications, browse like Instagram)
3. **Legal shield positioning** (2023 Food Donation Improvement Act)
4. **BYU cultural fit** (service-oriented community, high trust)

---

## Core Features (MVP - P0)

### 1. **Flyer Ingestion: AI-Powered Photo Upload**

**User Flow:**
1. Student sees event flyer on bulletin board
2. Opens Scavenger web app (no login required)
3. Taps "Post Food" button
4. Takes photo of flyer (or uploads from camera roll)
5. Gemini 2.0 Flash API extracts:
   - Event name
   - Location (building + room number)
   - Date & time
   - Food type/description
   - Dietary info (if visible)
6. AI populates a confirmation form
7. User verifies/edits extracted data
8. User adds optional fields:
   - Estimated portions ("Feeds ~20 people")
   - Contact info (optional)
9. User submits → Post goes live on feed

**Technical Requirements:**
- Image upload (mobile camera + desktop file picker)
- Gemini 2.0 Flash API integration
- Structured JSON extraction (event schema)
- Form validation before submission
- Image storage (Firebase Storage or Cloudinary)

**Acceptance Criteria:**
- ✅ User can upload photo in <5 seconds
- ✅ AI extraction completes in <3 seconds
- ✅ Form is pre-populated with 80%+ accuracy
- ✅ User can override any AI-suggested field
- ✅ Submission creates real-time entry in feed

---

### 2. **Real-Time Feed: The Main Dashboard**

**User Flow:**
1. Student opens Scavenger homepage (no login required)
2. Sees chronological feed of current/upcoming food events
3. Each card displays:
   - Event name
   - Location (building + room)
   - Time remaining ("In 30 min" or "Happening now")
   - Food type/description
   - Estimated portions
   - "Still There?" status indicator
4. Student taps card to see full details
5. Student navigates to location

**Technical Requirements:**
- Real-time database (Firestore)
- Auto-refresh feed when new posts added
- Time-based sorting (soonest events first)
- Auto-expiration (posts disappear after event end time)
- Mobile-responsive design

**Acceptance Criteria:**
- ✅ Feed loads in <2 seconds
- ✅ New posts appear without manual refresh
- ✅ Expired posts disappear automatically
- ✅ Works on mobile and desktop browsers
- ✅ No login required to browse

---

### 3. **Real-Time Status Updates: "Gone" Button**

**User Flow (Uploader):**
1. Event organizer posted food at 3:00 PM
2. Food runs out at 4:30 PM
3. Organizer opens their post (via unique link sent after posting)
4. Taps "Mark as Gone" button
5. Post immediately disappears from feed

**User Flow (First Responder - Future Enhancement):**
1. Student arrives at location
2. Confirms food is available (or not)
3. Taps "Still There?" or "All Gone"
4. Status updates for all users

**Technical Requirements:**
- Unique edit link for post creators (no accounts needed)
- Real-time update propagation (Firestore)
- Simple toggle UI ("Available" vs. "Gone")
- Optional: First responder verification (Phase 2)

**Acceptance Criteria:**
- ✅ Uploader receives unique edit link after posting
- ✅ Status change reflects on all clients within 2 seconds
- ✅ "Gone" posts disappear from feed immediately
- ✅ No account creation required

---

### 4. **Location & Time Filtering**

**User Flow:**
1. Student is in TMCB building at 2:00 PM
2. Opens Scavenger feed
3. Filters by:
   - "Happening Now" (events currently active)
   - Location (e.g., "TMCB only")
4. Feed updates to show only relevant results

**Technical Requirements:**
- Filter dropdown/chips UI
- Client-side or server-side filtering logic
- Building name autocomplete/suggestions

**Acceptance Criteria:**
- ✅ Filter persists during session
- ✅ Results update instantly when filter applied
- ✅ "Happening Now" shows events within current 2-hour window

---

### 5. **Legal Compliance: Liability Disclaimer**

**User Flow:**
1. User submits post
2. Sees checkbox: "I confirm this food is safe and offered free of charge"
3. Must check to proceed
4. Footer includes link to Terms of Service citing 2023 Food Donation Improvement Act

**Technical Requirements:**
- Required checkbox on submission form
- Terms of Service page (static content)
- Clear legal language citing FDIA 2023

**Acceptance Criteria:**
- ✅ Cannot submit without accepting terms
- ✅ ToS clearly states federal liability protections
- ✅ No ambiguity about food safety responsibility

---

## Technical Architecture (MVP)

### Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (React) | Server-side rendering, optimal performance, one framework for web + mobile-responsive |
| **Hosting** | Vercel | Zero DevOps, one-click deploys, auto-scaling, free tier |
| **Database** | Firestore (Firebase) | Real-time sync out of the box, no WebSocket logic needed |
| **AI/ML** | Gemini 2.0 Flash API | 30x cheaper than GPT-4o, 6x faster, superior OCR accuracy |
| **Image Storage** | Firebase Storage or Cloudinary | Scalable, automatic image optimization |
| **Analytics** | Google Analytics 4 | Privacy-friendly, no PII required |
| **Auth** | None (MVP) | Reduces dev time by 2 weeks, removes user friction |

### Data Models

#### **Post Schema (Firestore)**
```json
{
  "id": "auto-generated",
  "createdAt": "timestamp",
  "eventName": "CS Club Pizza Social",
  "location": {
    "building": "TMCB",
    "room": "210"
  },
  "dateTime": {
    "start": "timestamp",
    "end": "timestamp"
  },
  "foodDescription": "3 large pizzas (pepperoni, cheese, veggie)",
  "estimatedPortions": 20,
  "dietaryInfo": ["vegetarian options available"],
  "status": "available" | "gone",
  "imageUrl": "string",
  "uploaderEditKey": "uuid",
  "source": "flyer_photo" | "manual"
}
```

### System Architecture Diagram

```
┌─────────────┐
│   Browser   │
│   (User)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Next.js Frontend  │
│   (Vercel)          │
│   - Feed UI         │
│   - Upload Form     │
│   - Filter Logic    │
└──────┬──────────────┘
       │
       ├──────────────┐
       ▼              ▼
┌──────────────┐  ┌──────────────┐
│  Firestore   │  │  Gemini API  │
│  (Database)  │  │  (AI Vision) │
│  - Posts     │  │  - Extract   │
│  - Real-time │  │    Flyer     │
└──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│   Firebase   │
│   Storage    │
│  (Images)    │
└──────────────┘
```

---

## User Stories & Use Cases

### Epic 1: Post Food Event

**As a club organizer**, I want to quickly post leftover food from my event, so that students can find it before it goes to waste.

**User Story 1.1: Upload Flyer Photo**
- Given I see a flyer for an event with food
- When I take a photo and upload it to Scavenger
- Then the AI extracts the event details and pre-fills a form
- And I can verify/edit the details before posting

**User Story 1.2: Manual Entry (Fallback)**
- Given the AI cannot parse my flyer (e.g., handwritten, blurry)
- When I choose "Enter Manually"
- Then I see a blank form where I can type all event details
- And I can still post the food event

**User Story 1.3: Mark Food as Gone**
- Given I posted food at 3:00 PM and it's now gone
- When I click the edit link and tap "Mark as Gone"
- Then the post disappears from the feed immediately
- And no more students are directed to an empty room

---

### Epic 2: Discover Food

**As a student**, I want to browse a real-time feed of free food on campus, so that I never miss an opportunity to grab a meal.

**User Story 2.1: Browse Feed**
- Given I open the Scavenger homepage
- When the feed loads
- Then I see all current and upcoming food events sorted by time
- And I can scroll without logging in

**User Story 2.2: Filter by Location**
- Given I'm in the TMCB building
- When I filter the feed by "TMCB"
- Then I only see events in or near TMCB
- And I can quickly walk to the closest option

**User Story 2.3: Check Event Status**
- Given I see an event posted 2 hours ago
- When I check the "Status" indicator
- Then I know if food is "Still Available" or "Gone"
- And I don't waste time walking to an empty room

---

### Epic 3: Trust & Safety

**As a platform operator**, I want to ensure food safety and legal compliance, so that students and organizers feel confident using Scavenger.

**User Story 3.1: Legal Disclaimer**
- Given I'm about to post food
- When I submit the form
- Then I must check a box confirming the food is safe and free
- And I see a link to the Terms of Service citing federal protections

**User Story 3.2: Report Inappropriate Post**
- Given I see a post that seems unsafe or spam
- When I click "Report"
- Then the team is notified via email
- And the post can be reviewed/removed

---

## Non-Functional Requirements

### Performance
- **Feed Load Time:** <2 seconds on 4G connection
- **AI Extraction Time:** <3 seconds for flyer parsing
- **Real-time Updates:** <2 seconds latency for status changes

### Scalability
- **Concurrent Users:** Support 500+ simultaneous users (BYU peak)
- **Daily Posts:** Handle 50+ posts per day without degradation
- **Image Storage:** Support up to 10,000 images (first semester)

### Usability
- **Mobile-First:** 80%+ of users will access via mobile browser
- **No Login Required:** Zero-friction browsing and posting
- **Accessibility:** WCAG 2.1 AA compliance (keyboard navigation, screen readers)

### Security
- **No PII Collection:** Do not store emails, phone numbers, or user accounts
- **Rate Limiting:** Prevent spam posting (max 5 posts per IP per hour)
- **Content Moderation:** Email alerts for reported posts

### Privacy
- **No Tracking:** Do not use invasive analytics or sell user data
- **GDPR Compliant:** Though no accounts, still respect EU user rights
- **Transparent:** Clear Terms of Service and Privacy Policy

---

## Out of Scope (MVP)

The following features are **not** included in the 7-week MVP but may be added in future phases:

### Deprioritized Features (Phase 2+)

| Feature | Why Out of Scope | Potential Timeline |
|---------|------------------|-------------------|
| **User Accounts / Profiles** | Adds 2 weeks of dev time, reduces anonymity | Phase 2 (Week 8-12) |
| **Map Integration** | Complex UI, not essential for single campus | Phase 2 |
| **Push Notifications** | Requires account system + app install | Phase 3 |
| **Slack Bot Integration** | Higher complexity, need to prove MVP first | Phase 2 (Week 8-12) |
| **Email Inbox Parsing** | Privacy concerns, requires OAuth | Phase 2 |
| **Gamification / Badges** | Fun but not core to proving value | Phase 2 |
| **Multi-Campus Support** | Need single-campus PMF first | Phase 3 (Week 16+) |
| **Admin Dashboard** | Manual moderation sufficient for alpha | Phase 2 |
| **iOS/Android Native Apps** | Mobile web works for MVP | Phase 4 (if needed) |

---

## Success Metrics & KPIs

### Leading Indicators (Week 1-4)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Posts per Week** | 15+ | Proves supply-side activation |
| **Unique Visitors** | 100+ | Proves demand-side awareness |
| **Avg. Time on Site** | 2+ minutes | Proves engagement with feed |
| **Click-Through Rate** | 30%+ | Proves intent to act on posts |

### Lagging Indicators (Week 5-7)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Weekly Repeat Users** | 25%+ | Proves product value (North Star) |
| **Organic Posts** | 5+ | Proves users are evangelizing |
| **"Ghost Chase" Rate** | <5% | Proves data accuracy/trust |
| **Meals Redistributed** | 200+ | Proves impact (for B2B narrative) |

### Phase 2 Metrics (Week 8-16)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Automated Posts (Slack/Email)** | 50% of total | Proves automation scales supply |
| **Cross-Org Adoption** | 10+ clubs using platform | Proves product-market fit |
| **University Outreach** | 1 meeting with BYU Sustainability | Proves B2B potential |

---

## Development Timeline (7-Week Sprint)

### Week 1-2: Discovery & Setup
**Team:** Full team (3 people)

**Deliverables:**
- [ ] Project repo setup (Next.js + Firestore)
- [ ] Gemini 2.0 Flash API key + test integration
- [ ] Validate BYU flyer landscape (walk campus, photograph 20-30 flyers)
- [ ] Define data schema (Post model)
- [ ] Basic landing page (static)

**Validation Checkpoint:** Can we successfully extract data from 10 real BYU flyers with 80%+ accuracy?

---

### Week 3: Design & Core Infrastructure
**Team:** 1 designer, 2 engineers

**Deliverables:**
- [ ] High-fidelity Figma mockups (feed, upload form, detail view)
- [ ] Next.js routing structure
- [ ] Firestore database setup
- [ ] Image upload component (frontend)
- [ ] Gemini API integration (backend)

**Validation Checkpoint:** Can a user upload a photo and see AI-extracted data in a form?

---

### Week 4-5: Core Development
**Team:** Full team (all engineering)

**Deliverables:**
- [ ] Complete upload flow (photo → AI → form → submit)
- [ ] Real-time feed component (Firestore listener)
- [ ] Post detail view
- [ ] "Mark as Gone" functionality (unique edit links)
- [ ] Location & time filters
- [ ] Mobile-responsive styling

**Validation Checkpoint:** Can a user post food and see it appear on the feed in real-time?

---

### Week 6: Alpha Testing
**Team:** Full team + 5-10 alpha testers

**Deliverables:**
- [ ] Deploy to production (Vercel)
- [ ] Recruit 5-10 alpha testers (friends, classmates)
- [ ] Manual seed data (team posts 10-15 real events)
- [ ] Bug fixes from alpha feedback
- [ ] Analytics integration (GA4)

**Validation Checkpoint:** Do alpha testers find food successfully? What breaks?

---

### Week 7: Public Launch
**Team:** Full team + marketing outreach

**Deliverables:**
- [ ] Public launch announcement (Instagram, ward groups, club Slack channels)
- [ ] Monitor feed for first 100+ organic users
- [ ] Daily check-ins to fix critical bugs
- [ ] Collect user feedback (Google Form)
- [ ] Measure success metrics (posts, visitors, repeat usage)

**Launch Checkpoint:** Did we hit 30+ posts and 150+ visitors in Week 7?

---

## Risk Assessment & Mitigation

### High-Priority Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **AI Extraction Errors** | High | High | Human-in-the-loop verification; users must confirm AI data before posting |
| **Stale Data ("Ghost Chases")** | High | High | "Mark as Gone" button; auto-expiration; first responder verification (Phase 2) |
| **Low Supply-Side Adoption** | Medium | High | Manual seed data Week 1; recruit 3-5 design partner clubs; offer to post for them |
| **Swarm Effect (Over-Attendance)** | Medium | Medium | "Estimated Portions" field; social messaging about sustainability |
| **Legal Liability Concerns** | Low | High | Clear ToS citing FDIA 2023; required disclaimer checkbox |
| **Technical Issues (Downtime)** | Low | Medium | Use Vercel's 99.9% uptime SLA; Firebase redundancy |

### Medium-Priority Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Spam / Abuse** | Medium | Medium | Rate limiting (5 posts/IP/hour); manual moderation (small scale) |
| **Privacy Concerns** | Low | Medium | No user data collection; transparent privacy policy |
| **BYU Flyers are Digital-First** | Medium | High | Validation step Week 1-2; pivot to Slack bot if needed |

---

## Open Questions & Assumptions

### Assumptions to Validate (Week 1-2)

1. **BYU clubs print physical flyers**
   - Assumption: 70%+ of food events have physical flyers
   - Validation: Walk campus, count flyers, interview club leaders

2. **Students will browse without logging in**
   - Assumption: Account-free UX reduces friction more than losing personalization
   - Validation: Alpha test feedback; compare with account-based competitors

3. **Organizers will mark food as "Gone"**
   - Assumption: Uploaders are responsible enough to update status
   - Validation: Track "Gone" button usage in alpha; consider first responder backup

4. **Gemini 2.0 Flash accuracy on BYU flyers**
   - Assumption: AI can parse 80%+ of flyer details correctly
   - Validation: Test with 20-30 real BYU flyers in Week 1

### Open Questions

1. **How do we handle recurring events?**
   - E.g., CS Club meets every Tuesday with pizza
   - Potential solution: "Recurring post" template (Phase 2)

2. **Should we allow anonymous posting?**
   - Pro: Lower friction
   - Con: Higher spam risk
   - Decision: Allow anonymous, add rate limiting

3. **What if food quality is poor?**
   - E.g., "Cold pizza" or "stale bagels"
   - Potential solution: Optional "Food Quality" rating (Phase 2)

4. **How do we handle dietary restrictions?**
   - E.g., vegetarian, vegan, gluten-free, halal
   - MVP: Free-text field; Phase 2: Structured tags

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Scavenger** | Product name for the campus food finder platform |
| **Ghost Chase** | When a user arrives at a location and food is already gone (bad UX) |
| **Dark Data** | Information that exists but is undiscoverable (e.g., physical flyers) |
| **The Swarm Effect** | When too many users show up and overwhelm supply |
| **Hungry Hustler** | User persona for demand-side students |
| **Club Recruiter** | User persona for supply-side organizers |
| **FDIA** | Food Donation Improvement Act (2023), federal liability protection |
| **MVP** | Minimum Viable Product (Week 7 launch) |
| **PMF** | Product-Market Fit |

---

## Appendix B: Reference Documents

- **Market Research:** `/ai/guides/food-finder-market-research.md`
- **Gemini Pro Research:** `/ai/guides/external/marketResearch_gemini.md`
- **BYU Sustainability Office:** [Link TBD]
- **FDIA Legal Overview:** [ntfb.org/good-samaritan-act](https://ntfb.org/wp-content/uploads/2024/11/Good-Samaritan-Food-Donation-Act-2023-Updated.pdf)

---

## Approval & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| **Product Lead** | Ava Williams | Feb 16, 2026 | Draft |
| **Tech Lead** | [TBD] | | Pending |
| **Designer** | [TBD] | | Pending |
| **Advisor** | [TBD] | | Pending |

---

**Next Steps:**
1. Review and approve PRD with full team
2. Begin Week 1 validation (flyer photography + Gemini API testing)
3. Set up project repo and assign engineering tasks
4. Schedule design kickoff for Week 3

---

*This document is a living specification and will be updated as requirements evolve.*
