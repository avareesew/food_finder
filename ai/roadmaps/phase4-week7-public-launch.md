# Phase 4: Public Launch
## Week 7 Detailed Implementation Plan

**Date Created:** February 16, 2026  
**Duration:** 1 week  
**Goal:** Open to all BYU students and hit MVP success metrics  
**Team:** Full team (3 people)

---

## Overview

This is launch week. Goals:
1. Open platform to all BYU students
2. Hit 30+ posts and 150+ visitors
3. Achieve 25% repeat usage rate
4. Maintain <5% ghost chase rate
5. Get 5+ organic posts (non-team)

**Success Criteria:** Hit all 5 MVP metrics by end of Week 7

---

## Day 1: Pre-Launch Prep

### Task 7.1.1 - Final Bug Sweep
**Owner:** Full team  
**Time:** 2-3 hours

**Test Everything:**
- Upload flow (3 different devices)
- Feed view (refresh, real-time updates)
- Detail view (all info displays)
- "Mark as gone" (status updates propagate)
- Mobile gestures (scroll, tap, back button)
- Network issues (what happens offline?)

**Checklist:**
- [ ] Upload works on iOS Safari
- [ ] Upload works on Android Chrome
- [ ] Feed loads in <2 seconds
- [ ] Real-time updates work
- [ ] Images load properly
- [ ] No console errors
- [ ] Accessibility (keyboard nav, screen reader)

**Fix any issues found immediately**

---

### Task 7.1.2 - Stress Test Platform
**Owner:** Tech Lead  
**Time:** 1-2 hours

**Simulate High Load:**
- Open app on 10+ devices simultaneously
- All devices browse feed
- Create 5 posts in rapid succession
- Mark posts as gone quickly
- Verify no crashes or slowdowns

**Check Vercel Dashboard:**
- Response times acceptable?
- Error rate <1%?
- Any function timeouts?

**Check Firebase Console:**
- Database reads within quota?
- Any throttling warnings?

**Acceptance Criteria:**
- [ ] Platform handles concurrent users
- [ ] No performance degradation
- [ ] All services within quotas

---

### Task 7.1.3 - Create Launch Assets
**Owner:** Product Lead + Designer  
**Time:** 3-4 hours

**Social Media Graphics (Instagram Story size: 1080x1920):**
1. Launch announcement graphic
   - "Scavenger is LIVE at BYU 🍕"
   - Screenshot of feed
   - URL + QR code
   
2. How it works (carousel)
   - Slide 1: "Never miss free food again"
   - Slide 2: "See a flyer? Snap it"
   - Slide 3: "Browse the feed"
   - Slide 4: "Head over before it's gone"
   
3. Demo video (30 seconds)
   - Screen recording of upload flow
   - Show feed updating in real-time
   - End with URL + CTA

**Launch Copy:**
```
🍕 Scavenger is now live at BYU!

Tired of missing free pizza? We built a real-time feed of every 
free food event on campus.

✨ No app download
✨ No login required
✨ Just browse and go

Check it out: [URL]

Built by BYU students 💙
```

**Acceptance Criteria:**
- [ ] 3 Instagram story graphics created
- [ ] 30-second demo video recorded
- [ ] Launch copy written
- [ ] QR code generated (links to app)

---

### Task 7.1.4 - Set Up Monitoring Alerts
**Owner:** Tech Lead  
**Time:** 1 hour

**Configure Alerts:**
- Vercel: Email if deployment fails
- Firebase: Quota warnings (90% threshold)
- Optional: UptimeRobot (ping every 5 min)

**Create Monitoring Dashboard:**
- Bookmark Vercel analytics
- Bookmark Firebase console
- Bookmark Google Analytics

**Acceptance Criteria:**
- [ ] Alerts configured
- [ ] Team knows how to check status
- [ ] Contact plan if site goes down

---

## Day 2: Launch Day 🚀

### Task 7.2.1 - Soft Launch (Morning)
**Owner:** Full team  
**Time:** 2-3 hours

**Phase 1: Soft Launch (8 AM - 12 PM)**

**Post in Small Channels:**
- BYU subreddit (if allowed)
- CS major Discord
- Your ward GroupMe/iMessage
- Class Slack channels (3-5 classes)
- Friends' Instagram stories (ask them to share)

**Monitor Closely:**
- Watch analytics real-time
- Check for error spikes
- Respond to questions/issues immediately
- Be ready to rollback if critical bug appears

**Acceptance Criteria:**
- [ ] Posted in 5+ small channels
- [ ] First 20-30 new users visit
- [ ] No critical bugs reported
- [ ] Team responsive to feedback

---

### Task 7.2.2 - Design Partners Post First Events
**Owner:** Product Lead (coordinate)  
**Time:** 1-2 hours

**Work with design partner clubs:**
- Remind them to post their events today
- Offer to help with first post (walk through)
- Verify posts look good
- Thank them publicly (if they're comfortable)

**Goal:** 3-5 high-quality posts from real clubs on launch day

**Acceptance Criteria:**
- [ ] 3+ design partners post events
- [ ] Posts are high-quality (accurate, appealing)
- [ ] Partners satisfied with experience

---

### Task 7.2.3 - Full Launch (Afternoon)
**Owner:** Full team  
**Time:** 2-3 hours

**Phase 2: Full Launch (12 PM - 5 PM)**

**Expand to Larger Channels:**
- Campus-wide Facebook groups
- Instagram (post on your accounts, tag BYU)
- TikTok (if someone on team uses it)
- Campus bulletin boards (print flyers about Scavenger!)
- Email student organizations list (if accessible)

**Ask for Shares:**
- "If you find this useful, share it!"
- Encourage word-of-mouth
- Offer shoutout to top contributors

**Acceptance Criteria:**
- [ ] Posted in 10+ channels total
- [ ] 100+ visitors by end of day (tracked in GA)
- [ ] Some organic sharing happening
- [ ] No major issues

---

## Day 3-7: Week 1 Post-Launch

### Task 7.3.1 - Monitor Hourly (First 48 Hours)
**Owner:** Tech Lead + Product Lead (rotating)  
**Time:** 15 min every 2-3 hours

**Check:**
- Analytics (traffic, engagement)
- Firebase (posts created, any spam?)
- Vercel logs (errors, performance)
- Feedback form responses
- Social media mentions

**Respond to Issues:**
- Answer questions publicly (builds trust)
- Fix bugs within 2 hours if critical
- Document all issues in `ai/notes/week7-launch-log.md`

**Acceptance Criteria:**
- [ ] Monitoring done every 2-3 hours
- [ ] Issues responded to quickly (<2 hours)
- [ ] All incidents documented

---

### Task 7.3.2 - Engage with Users
**Owner:** Full team  
**Time:** 30 min/day

**Engagement Tactics:**
- Reply to comments on social posts
- Thank users who post food
- Share success stories ("John found pizza thanks to Scavenger!")
- Ask for feedback directly (DMs, comments)

**Build Community:**
- Make users feel heard
- Be transparent about fixes
- Celebrate milestones ("50 visitors!", "10th post!")

**Acceptance Criteria:**
- [ ] Replied to 80%+ of comments/questions
- [ ] Posted 2-3 engagement updates
- [ ] Users feel connected to the project

---

### Task 7.3.3 - Daily Stand-Ups
**Owner:** Full team  
**Time:** 15 min/day

**Agenda:**
1. Yesterday's metrics (posts, visitors, issues)
2. Today's priorities
3. Any blockers?
4. Who's monitoring when?

**Quick Sync:**
- No long meetings during launch week
- Just stay aligned and coordinate

**Acceptance Criteria:**
- [ ] Daily check-in completed
- [ ] Team aligned on priorities

---

## End of Week 7: Launch Results

### Task 7.4.1 - Compile Launch Report
**Owner:** Product Lead  
**Time:** 2-3 hours

**Create `ai/notes/week7-launch-results.md`:**

```markdown
# Week 7 Launch Results

## MVP Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Posts per week** | 30+ | ___ | ✅/❌ |
| **Unique visitors** | 150+ | ___ | ✅/❌ |
| **Repeat users** | 25%+ | ___ | ✅/❌ |
| **Ghost chase rate** | <5% | ___% | ✅/❌ |
| **Organic posts** | 5+ | ___ | ✅/❌ |

**Overall:** X/5 metrics achieved

## User Breakdown
- Team posts: X
- Design partner posts: X
- Organic posts: X ⭐
- Total: X

## Engagement Patterns
- Peak usage time: [time of day]
- Most popular buildings: [list]
- Most common food types: [list]
- Avg time on site: X minutes

## Issues Encountered
1. [Issue + resolution]
2. [Issue + resolution]

## User Feedback (Top 3)
**Positive:**
1. [quote]
2. [quote]

**Negative:**
1. [issue]
2. [issue]

## Surprises (Unexpected Learnings)
- [Observation 1]
- [Observation 2]

## Assessment
**Did we achieve product-market fit signals?** [YES/NO/MAYBE]

**Evidence:** [explain]

## Next Steps
**Continue to Week 8+:** [YES/NO]

**Phase 2 priorities based on feedback:** [list]
```

**Acceptance Criteria:**
- [ ] All metrics calculated
- [ ] Report comprehensive and honest
- [ ] Learnings documented
- [ ] Next steps clear

---

### Task 7.4.2 - Team Retrospective
**Owner:** Full team  
**Time:** 1-2 hours

**Retrospective Format:**
1. **What went well?**
   - Technical wins
   - User feedback highlights
   - Team collaboration

2. **What didn't go well?**
   - Bugs that slipped through
   - Timeline issues
   - Communication gaps

3. **What did we learn?**
   - About our users
   - About the technology
   - About our process

4. **What should we change?**
   - For Phase 2 development
   - For team process
   - For product strategy

**Document in `ai/notes/week7-retrospective.md`**

**Acceptance Criteria:**
- [ ] All team members participate
- [ ] Honest feedback shared
- [ ] Learnings documented
- [ ] Action items for Phase 2

---

## Success Definition

**Week 7 is successful if we hit 3+ of 5 MVP metrics:**

**Must-Hit:**
- ✅ 30+ posts per week (proves supply)
- ✅ 150+ unique visitors (proves awareness)

**Should-Hit:**
- ⚠️ 25%+ repeat users (proves value)
- ⚠️ <5% ghost chase rate (proves accuracy)
- ⚠️ 5+ organic posts (proves organic growth)

**Outstanding Success (4-5 metrics):**
- Proceed to Phase 2 with confidence
- Product-market fit validated
- Plan multi-campus expansion

**Moderate Success (3 metrics):**
- Proceed to Phase 2 cautiously
- Focus on improving weak metrics
- Continue iterating at BYU

**Below Expectations (<3 metrics):**
- Analyze what's not working
- Consider pivot or major changes
- Delay multi-campus plans

---

## Launch Day Contingency Plans

### If Site Goes Down
1. Check Vercel status (dashboard)
2. Check Firebase quota (console)
3. Rollback to previous deployment if needed
4. Post status update on social media
5. Fix and redeploy

### If Spam/Abuse
1. Manually delete inappropriate posts
2. Add stricter validation immediately
3. Lower rate limits
4. Consider adding simple CAPTCHA

### If Overwhelmed with Users
1. Celebrate (this is a good problem!)
2. Monitor Firebase quota closely
3. Upgrade to paid tier if needed (cheap)
4. Ensure performance stays good

---

## Post-Launch (Remainder of Week 7)

**Continue monitoring through end of Week 7 (7 days total) to collect full week of data:**
- Monitor daily metrics
- Respond to feedback
- Fix non-critical bugs
- Plan Phase 2 features
- Document learnings

**Then move to Weeks 8-12:** Observation & Phase 2 planning

---

## Deliverables Checklist

**By end of Week 7, we must have:**
- [ ] Public launch executed across 10+ channels
- [ ] 30+ posts created (target metric)
- [ ] 150+ unique visitors (target metric)
- [ ] 25%+ repeat usage rate (target metric)
- [ ] <5% ghost chase rate (target metric)
- [ ] 5+ organic posts (target metric)
- [ ] Launch results compiled
- [ ] Team retrospective completed
- [ ] Phase 2 priorities identified

---

## References

- Main Plan: `ai/roadmaps/2026-02-16-implementation-plan.md`
- PRD Success Metrics: `aiDocs/prd.md`
- Beta Plan: `ai/roadmaps/phase3-week6-beta-polish.md`
