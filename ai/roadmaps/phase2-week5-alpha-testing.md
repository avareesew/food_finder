# Phase 2: Alpha Testing
## Week 5 Detailed Implementation Plan

**Date Created:** February 16, 2026  
**Duration:** 1 week  
**Goal:** Get real user feedback on working prototype with 5-10 testers  
**Team:** Full team (3 people)

---

## Overview

This phase validates:
1. Do users understand the product?
2. Can they use it without help?
3. Does it solve their problem?
4. What breaks in real usage?

**Success Criteria:** 70%+ of alpha testers say "yes, I would use this regularly" (PRD requirement)

---

## Day 1: Pre-Alpha Prep

### Task 5.1.1 - Deploy to Production Domain
**Owner:** Tech Lead  
**Time:** 1 hour

**Steps:**
1. Purchase domain (scavenger.app or similar) OR use Vercel subdomain
2. Configure custom domain in Vercel dashboard
3. Verify HTTPS works
4. Test on mobile device

**If Using Subdomain:**
- Use: `scavenger-byu.vercel.app` (free)

**Acceptance Criteria:**
- [ ] Production URL is live
- [ ] HTTPS works
- [ ] Accessible on mobile
- [ ] Easy to remember/share

---

### Task 5.1.2 - Create Landing/Explainer
**Owner:** Product Lead  
**Time:** 2 hours

**Add to Homepage (above feed):**
- Short tagline: "Never miss free food on BYU campus"
- How it works (3 steps):
  1. 📸 See a flyer? Snap a photo
  2. 🍕 Browse the feed for free food
  3. 🏃 Head over before it's gone
- Call to action: "Post Food" button

**Acceptance Criteria:**
- [ ] Explainer text clear and concise
- [ ] Mobile-friendly layout
- [ ] Doesn't clutter the feed
- [ ] Can be hidden after first visit (optional)

---

### Task 5.1.3 - Feedback Collection Setup
**Owner:** Product Lead  
**Time:** 30 minutes

**Create Google Form:**
- Title: "Scavenger Alpha Feedback"
- Questions:
  1. Did you successfully find food? (Yes/No)
  2. Did you post food? (Yes/No)
  3. Would you use this regularly? (Yes/No) ⭐ CRITICAL
  4. What's confusing or broken?
  5. What features are missing?
  6. On a scale of 1-10, how likely are you to recommend this?

**Add link to app footer**

**Acceptance Criteria:**
- [ ] Form created and public
- [ ] Link added to app
- [ ] Form responses go to team email

---

### Task 5.1.4 - Analytics Setup
**Owner:** Tech Lead  
**Time:** 1 hour

**Add Google Analytics 4:**
- Create GA4 property
- Add tracking code to Next.js
- Set up events:
  - page_view (automatic)
  - upload_started
  - upload_completed
  - post_created
  - event_card_clicked

**Privacy:**
- No PII collection
- Anonymous usage only

**Acceptance Criteria:**
- [ ] GA4 tracking code added
- [ ] Real-time dashboard shows activity
- [ ] Custom events firing

---

## Day 2: Alpha Tester Recruitment

### Task 5.2.1 - Recruit Demand-Side Testers
**Owner:** Product Lead  
**Time:** 2-3 hours

**Target Profile: "Hungry Hustlers"**
- 3-4 students who are on campus frequently
- Mix of majors and year levels
- Tech-savvy (comfortable with web apps)
- Bonus: Known to be budget-conscious

**Recruitment Channels:**
- Friends and classmates
- Ward members
- Ask professors to recommend students
- Post in small Discord/Slack groups

**Invitation Message:**
```
Hey! I'm building a tool to help BYU students find free food on campus. 
Would you be willing to test it for a week and give feedback? 
Takes ~5 min to set up, then just use it naturally.

Link: [scavenger-byu.vercel.app]
```

**Acceptance Criteria:**
- [ ] 3-4 demand-side testers recruited
- [ ] Contact info collected
- [ ] Sent invitation with URL

---

### Task 5.2.2 - Recruit Supply-Side Testers
**Owner:** Product Lead  
**Time:** 2-3 hours

**Target Profile: "Club Recruiters"**
- 2-3 club officers or RAs
- People who organize events with food
- Willing to post leftovers

**Recruitment:**
- Reach out to clubs you interviewed in Week 1
- Ask ward activities chairs
- Connect with RAs in your dorm

**Invitation Message:**
```
Hey! I built a platform to help clubs reduce food waste and get more 
event attendance. When you have leftover food, post it and students 
will come grab it. Want to try it with your next event?

Link: [scavenger-byu.vercel.app]
```

**Acceptance Criteria:**
- [ ] 2-3 supply-side testers recruited
- [ ] At least 1 has an event with food this week
- [ ] Sent invitation with URL

---

### Task 5.2.3 - Tester Briefing
**Owner:** Product Lead  
**Time:** 1 hour

**Send Briefing Email:**
- What is Scavenger (1-2 sentences)
- How to use it (demand side: browse; supply side: post)
- What we're testing (usability, accuracy, value)
- Feedback form link
- Contact info if they have issues

**Set Expectations:**
- This is alpha (might be buggy)
- Your feedback shapes the product
- Week-long test (no long-term commitment)

**Acceptance Criteria:**
- [ ] All testers briefed
- [ ] Questions answered
- [ ] Contact method established (email, text, etc.)

---

## Day 3-7: Manual Seeding & Observation

### Task 5.3.1 - Daily Manual Seeding
**Owner:** Full team (rotating)  
**Time:** 30 min/day

**Each Day:**
- Walk campus and find 2-3 event flyers
- Upload to Scavenger
- Document time taken to post
- Note any confusion or friction

**Goal:** Ensure feed is never empty during alpha

**Track in `ai/notes/week5-seeding-log.md`:**
```markdown
**Monday:**
- Posted: CS Club Pizza (TMCB 210)
- Posted: Pre-Med Bagels (Talmage 155)
- Time per post: ~2 min
- Issues: None

**Tuesday:**
...
```

**Acceptance Criteria:**
- [ ] 2-3 posts added daily (10-15 total for week)
- [ ] Posting time tracked
- [ ] Issues documented

---

### Task 5.3.2 - Monitor Usage Daily
**Owner:** Product Lead  
**Time:** 30 min/day

**Check Analytics:**
- How many unique visitors today?
- How many page views?
- What pages are most visited?
- Any error events firing?

**Check Firestore:**
- How many posts created?
- Any posts marked as gone?
- Any spam or test posts?

**Log in `ai/notes/week5-daily-log.md`**

**Acceptance Criteria:**
- [ ] Daily check-in completed
- [ ] Trends identified (usage up/down?)
- [ ] Issues flagged immediately

---

### Task 5.3.3 - Mid-Week Check-In
**Owner:** Product Lead  
**Time:** 1 hour (Wednesday)

**Send Check-In Message to Testers:**
```
Hey! Just checking in on Scavenger testing. 

Quick questions:
- Have you used it at all this week?
- Any issues or confusion?
- Found any free food yet? 😄

No wrong answers - just want to know how it's going!
```

**Document Responses:**
- Who's actively using it?
- Who hasn't used it yet (why not)?
- Any early feedback?

**Acceptance Criteria:**
- [ ] All testers contacted
- [ ] Responses collected
- [ ] Early issues addressed (if critical)

---

## Day 7: Feedback Collection & Analysis

### Task 5.4.1 - End-of-Week Survey
**Owner:** Product Lead  
**Time:** 2 hours

**Send Final Survey:**
- Link to Google Form
- Request completion by Friday 5 PM
- Offer incentive (coffee gift card? $5 Venmo?)

**Follow Up:**
- Message non-responders
- Goal: 80%+ response rate

**Acceptance Criteria:**
- [ ] All testers sent survey
- [ ] 6+ responses collected (out of 5-10 testers)
- [ ] Critical question answered: "Would you use this regularly?"

---

### Task 5.4.2 - Analyze Feedback
**Owner:** Full team  
**Time:** 2 hours

**Create `ai/notes/week5-alpha-results.md`:**

**Template:**
```markdown
# Week 5 Alpha Results

## Participation
- Testers recruited: X
- Active users: X
- Survey responses: X

## Key Metric (Critical!)
**"Would you use this regularly?"**
- Yes: X (X%)
- No: X (X%)
- **Result:** [PASS/FAIL 70% threshold]

## Usage Stats
- Posts created: X (X by team, X by testers)
- Unique visitors: X
- Successful food finds: X
- Ghost chases: X (X% rate)

## Qualitative Feedback
**What worked:**
- [quote 1]
- [quote 2]

**What didn't work:**
- [issue 1]
- [issue 2]

**Feature requests:**
- [request 1]
- [request 2]

## Issues Found
1. [Bug description]
2. [UX confusion]
3. [Technical issue]

## GO/NO-GO Decision
**Decision:** [GO to Beta / FIX ISSUES / PIVOT]

**Rationale:** [why]
```

**Acceptance Criteria:**
- [ ] All data compiled
- [ ] Key metric calculated (70%+ threshold)
- [ ] Issues prioritized (critical vs nice-to-have)
- [ ] Decision documented

---

### Task 5.4.3 - Team Debrief Meeting
**Owner:** Full team  
**Time:** 1 hour

**Agenda:**
1. Review alpha results
2. Discuss critical issues
3. Make GO/NO-GO decision for beta
4. Plan fixes for Week 6 (if needed)

**Decision Criteria:**
- ✅ 70%+ would use regularly? → GO to beta
- ⚠️ 50-69% → Fix top 3 issues before beta
- ❌ <50% → Revisit core assumptions

**Outputs:**
- GO/NO-GO decision
- Priority bug list for Week 6
- Adjusted timeline (if needed)

---

## Success Metrics (Week 5 Targets)

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| **"Would use this regularly?"** | **70%+ say "yes"** | ___ | ___ |
| Testers who posted | 2+ | ___ | ___ |
| Testers who found food | 3+ | ___ | ___ |
| Ghost chase rate | <10% (lenient for alpha) | ___ | ___ |
| Critical bugs | 0 | ___ | ___ |

**North Star:** 70%+ of alpha testers say "yes, I would use this regularly" (PRD requirement)

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Testers don't use it | Medium | High | Daily reminders, make it easy to access |
| No posts from testers | Medium | High | Team seeds 10-15 posts to ensure feed isn't empty |
| Critical bug discovered | Medium | Medium | Daily monitoring, fix immediately |
| Testers give vague feedback | High | Medium | Ask specific follow-up questions |

---

## Deliverables Checklist

**By end of Week 5, we must have:**
- [ ] 5-10 alpha testers recruited and briefed
- [ ] 10-15 posts seeded (team + testers)
- [ ] Daily monitoring completed
- [ ] Feedback survey responses collected
- [ ] Alpha results report compiled
- [ ] GO/NO-GO decision made
- [ ] Week 6 plan adjusted (if needed)

---

## References

- Main Plan: `ai/roadmaps/2026-02-16-implementation-plan.md`
- PRD Success Metrics: `aiDocs/prd.md` (Success Metrics section)
- MVP Spec: `aiDocs/mvp.md`
