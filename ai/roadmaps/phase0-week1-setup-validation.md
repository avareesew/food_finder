# Phase 0: Setup & Validation
## Week 1 Detailed Implementation Plan

**Date Created:** February 16, 2026  
**Duration:** 5-7 days  
**Goal:** Confirm all assumptions and set up development environment before writing production code  
**Team:** Full team (3 people)

---

## Overview

This phase validates our core assumptions:
1. Can we deploy to production?
2. Do BYU clubs print physical flyers?
3. Can Gemini extract data accurately?
4. Does Firestore real-time sync work?

**Success Criteria:** All 4 checkpoints pass before proceeding to Week 2.

---

## Day 1-2: Environment Setup

### Task 0.1.1 - Obtain Gemini API Key
**Owner:** Tech Lead  
**Time:** 30 minutes

**Steps:**
1. Go to https://ai.google.dev
2. Sign in with Google account
3. Navigate to "Get API Key" section
4. Create new project or select existing
5. Generate API key
6. Save key securely (1Password or similar)

**Acceptance Criteria:**
- [ ] API key obtained
- [ ] Key stored securely
- [ ] Test call to Gemini API succeeds

**Reference:** `ai/guides/gemini-api-docs.md`

---

### Task 0.1.2 - Create Firebase Project
**Owner:** Tech Lead  
**Time:** 45 minutes

**Steps:**
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name: "scavenger-food-finder"
4. Disable Google Analytics (optional)
5. Click "Create project"
6. Enable Firestore:
   - Build → Firestore Database → Create database
   - Start in Production mode
   - Location: us-central (closest to BYU)
7. Enable Storage:
   - Build → Storage → Get started
   - Start in Production mode
   - Same location as Firestore
8. Get Firebase config:
   - Project Settings → Your apps → Web icon
   - Register app: "Scavenger Web"
   - Copy firebaseConfig object

**Acceptance Criteria:**
- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Storage enabled
- [ ] Firebase config copied

**Reference:** `aiDocs/architecture.md` (API Keys & Project Setup section)

---

### Task 0.1.3 - Initialize Next.js Project
**Owner:** Full team  
**Time:** 1 hour

**Steps:**
1. Open terminal in projects folder
2. Run: `npx create-next-app@latest scavenger-app`
3. Answer prompts:
   - TypeScript? → Yes
   - ESLint? → Yes
   - Tailwind CSS? → Yes
   - `src/` directory? → No
   - App Router? → Yes
   - Customize import alias? → No
4. cd into project: `cd scavenger-app`
5. Install dependencies:
   ```bash
   npm install firebase @google/generative-ai date-fns
   ```
6. Create `.env.local` file with all keys
7. Test dev server: `npm run dev`

**Acceptance Criteria:**
- [ ] Project created successfully
- [ ] All dependencies installed
- [ ] Dev server runs on localhost:3000
- [ ] No console errors

**Reference:** `aiDocs/architecture.md` (Getting Started section)

---

### Task 0.1.4 - Set Up Environment Variables
**Owner:** Tech Lead  
**Time:** 20 minutes

**Create `.env.local`:**
```bash
# Gemini API (server-side only)
GEMINI_API_KEY=your_gemini_key_here

# Firebase (client-side, prefix with NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef
```

**Create `lib/firebase.ts`:**
- Copy initialization code from `aiDocs/architecture.md`
- Test that imports work

**Acceptance Criteria:**
- [ ] `.env.local` created with all keys
- [ ] `lib/firebase.ts` created and exports `db` and `storage`
- [ ] No TypeScript errors

---

### Task 0.1.5 - Deploy Hello World to Vercel
**Owner:** Tech Lead  
**Time:** 30 minutes

**Steps:**
1. Create GitHub repository: "scavenger-app"
2. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial Next.js setup"
   git remote add origin https://github.com/[username]/scavenger-app.git
   git push -u origin main
   ```
3. Go to https://vercel.com
4. Click "Import Project"
5. Select GitHub repo
6. Click "Deploy"
7. Wait for deployment
8. Visit deployed URL
9. Add environment variables in Vercel:
   - Dashboard → Project → Settings → Environment Variables
   - Add all vars from `.env.local`
10. Redeploy

**Acceptance Criteria:**
- [ ] App deployed successfully
- [ ] Production URL works
- [ ] Environment variables configured
- [ ] No build errors

**Checkpoint 1:** ✅ Can we deploy a blank Next.js app to production?

---

## Day 3: BYU Campus Validation

### Task 0.2.1 - Campus Flyer Survey
**Owner:** Product Lead + 1 team member  
**Time:** 3-4 hours

**Locations to Visit:**
1. Talmage Building (STEM majors)
2. TMCB (CS/Engineering)
3. Wilkinson Student Center (main hub)
4. Harold B. Lee Library
5. Any other high-traffic buildings

**Data to Collect:**
- Photo of every event flyer (use phone camera)
- Note location where found
- Document what info is on flyer:
  - Event name? ✅/❌
  - Location (building + room)? ✅/❌
  - Date & time? ✅/❌
  - Food mentioned? ✅/❌
  - Food description? ✅/❌

**Create Spreadsheet:**
| Photo # | Location Found | Event Name | Has Location | Has Time | Has Food | Notes |
|---------|---------------|------------|--------------|----------|----------|-------|
| 001 | TMCB 2nd floor | CS Club | ✅ | ✅ | ✅ | Pizza mentioned |
| ... | ... | ... | ... | ... | ... | ... |

**Target:** 20-30 flyers total

**Acceptance Criteria:**
- [ ] 20+ flyers photographed
- [ ] Spreadsheet completed
- [ ] Calculate: What % of flyers have all required info?
- [ ] Calculate: What % mention food?

---

### Task 0.2.2 - Club President Interviews
**Owner:** Product Lead  
**Time:** 2-3 hours (scheduling + interviews)

**Recruit 3-5 club presidents:**
- Target: High-activity clubs (CS Club, Pre-Med, major RSOs)
- Reach out via email or in-person
- Offer: Coffee + 15-minute chat

**Interview Questions:**
1. How do you currently promote events?
   - Flyers? Social media? Email? Slack?
2. If you order food for events, what happens to leftovers?
   - Throw away? Give to attendees? Other?
3. Would you use a platform to post leftover food?
   - Why or why not?
4. What concerns would you have about liability/safety?

**Document Responses:**
- Create notes doc: `ai/notes/week1-club-interviews.md`
- Summarize findings

**Acceptance Criteria:**
- [ ] 3+ club leaders interviewed *(1/3 complete — see `ai/notes/week1-club-interviews.md`)*
- [x] Notes documented → `ai/notes/week1-club-interviews.md`
- [x] Key insights identified → see Key Insights section in notes file

**Checkpoint 2:** ⚠️ Is flyer scanning the right primary input method?  
*Partial finding: Tanner / Marriott School prohibits physical flyers — digital-first. Need 2 more interviews to confirm whether this is isolated or campus-wide.*

**Decision Point:**
- If 70%+ of flyers exist and have required info → Proceed
- If 50-69% → Proceed but add manual entry as equal priority
- If <50% → Pivot to Slack bot + manual entry as primary

---

## Day 4-5: Gemini API Validation

### Task 0.3.1 - Create Test Script
**Owner:** Tech Lead  
**Time:** 1 hour

**Create `scripts/test-gemini.ts`:**
```typescript
// Script to test Gemini extraction on real flyers
// Reads images from test-images/ folder
// Outputs JSON results to console
// Measures accuracy and response time
```

**Steps:**
1. Create `test-images/` folder in project root
2. Copy 10 flyer photos from campus survey
3. Create test script that:
   - Loops through each image
   - Calls Gemini API with our JSON schema
   - Logs extracted data
   - Measures response time
   - Compares to ground truth (manual label)

**Acceptance Criteria:**
- [ ] Test script created
- [ ] Can process all 10 images
- [ ] Outputs structured JSON

**Reference:** `ai/guides/gemini-api-docs.md`

---

### Task 0.3.2 - Manual Labeling
**Owner:** Full team (split the work)  
**Time:** 1 hour

**Create Ground Truth Data:**
- For each of the 10 test flyers, manually extract:
  - Event name
  - Building name
  - Room number
  - Date
  - Time (start & end if available)
  - Food description
  - Estimated portions (if mentioned)

**Save to `test-data/ground-truth.json`:**
```json
[
  {
    "image": "flyer-001.jpg",
    "eventName": "CS Club Pizza Social",
    "location": {"building": "TMCB", "room": "210"},
    "date": "2026-02-20",
    "startTime": "17:00",
    "foodDescription": "Pizza (3 large)"
  },
  // ... 9 more
]
```

**Acceptance Criteria:**
- [ ] All 10 flyers manually labeled
- [ ] Ground truth JSON created
- [ ] Data validated (no typos)

---

### Task 0.3.3 - Run Tests & Measure Accuracy
**Owner:** Tech Lead  
**Time:** 1 hour

**Run Test Script:**
1. Execute: `npm run test:gemini`
2. For each flyer, compare AI output to ground truth
3. Calculate accuracy:
   - Event name correct? (exact match)
   - Building correct? (case-insensitive)
   - Room correct? (exact match)
   - Date correct? (format may differ)
   - Time correct? (within 15 min)
   - Food description reasonable? (semantic match)

**Measure Performance:**
- Average response time per image
- Max response time
- Any failures/errors?

**Document Results in `ai/notes/week1-gemini-validation.md`:**
```markdown
## Gemini Validation Results

**Accuracy by Field:**
- Event Name: 9/10 (90%)
- Building: 10/10 (100%)
- Room: 8/10 (80%)
- Date: 9/10 (90%)
- Time: 7/10 (70%)
- Food: 10/10 (100%)

**Overall Accuracy:** X/10 flyers with all fields correct

**Performance:**
- Avg response time: X.Xs
- Max response time: X.Xs

**Edge Cases Found:**
- Handwritten text: [accuracy]
- Small fonts: [accuracy]
- Artistic layouts: [accuracy]
```

**Acceptance Criteria:**
- [ ] All 10 flyers tested
- [ ] Accuracy calculated
- [ ] Performance measured
- [ ] Results documented

**Checkpoint 3:** ✅ Can we build the core feature with this API?

**Decision Point:**
- **80%+ accuracy:** Proceed as planned
- **70-79% accuracy:** Add "Please verify" warning
- **<70% accuracy:** Pivot to manual entry primary

---

## Day 5-6: Database Schema Finalization

### Task 0.4.1 - Create Firestore Collections
**Owner:** Tech Lead  
**Time:** 30 minutes

**Set Up Collections:**
1. Go to Firebase Console → Firestore Database
2. Create collection: `posts`
3. Add test document manually (to initialize collection):
   ```json
   {
     "eventName": "Test Event",
     "location": {"building": "TMCB", "room": "210"},
     "dateTime": {
       "start": "2026-02-20T17:00:00Z",
       "end": "2026-02-20T19:00:00Z"
     },
     "foodDescription": "Pizza",
     "status": "available",
     "createdAt": "[server timestamp]",
     "source": "manual"
   }
   ```

**Acceptance Criteria:**
- [ ] `posts` collection exists
- [ ] Test document created
- [ ] Can view document in Firebase Console

---

### Task 0.4.2 - Define Firestore Indexes
**Owner:** Tech Lead  
**Time:** 20 minutes

**Required Composite Indexes:**
1. `status` (ascending) + `dateTime.start` (ascending)
   - For: "Show available posts ordered by time"
2. `location.building` (ascending) + `status` (ascending)
   - For: "Show available posts in specific building" (Phase 2)

**How to Create:**
- Option A: Let Firebase auto-suggest (run queries, it will prompt)
- Option B: Create manually via Firebase Console → Indexes

**Acceptance Criteria:**
- [ ] At least 1 composite index created
- [ ] Index status: "Enabled" (not "Building")

**Reference:** `aiDocs/architecture.md` (Data Models section)

---

### Task 0.4.3 - Set Security Rules
**Owner:** Tech Lead  
**Time:** 15 minutes

**Set Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;  // Anyone can read
      allow write: if true; // MVP: Open write (TEMPORARY)
    }
  }
}
```

**Set Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /flyers/{postId}/{fileName} {
      allow read: if true;  // Anyone can read images
      allow write: if true; // MVP: Open write (TEMPORARY)
    }
  }
}
```

**⚠️ Add TODO Comment:**
```javascript
// TODO: Lock down write rules in Phase 2
// Phase 2: allow write: if request.auth != null;
```

**Acceptance Criteria:**
- [ ] Firestore rules published
- [ ] Storage rules published
- [ ] TODO added for Phase 2 lockdown

---

### Task 0.4.4 - Test Real-Time Sync
**Owner:** Tech Lead  
**Time:** 45 minutes

**Create Test Script `scripts/test-firestore.ts`:**
1. Write a test document to Firestore
2. Read it back
3. Set up real-time listener (onSnapshot)
4. Update the document from Firebase Console
5. Verify listener receives update
6. Delete test document

**Expected Flow:**
```
Write document → Success
Read document → Data matches
Set up listener → Connected
Update in console → Listener triggered
Delete document → Cleanup success
```

**Acceptance Criteria:**
- [ ] Can write to Firestore programmatically
- [ ] Can read from Firestore
- [ ] Real-time listener receives updates
- [ ] No errors in console

**Checkpoint 4:** ✅ Does Firestore real-time sync work as expected?

---

## Day 7: Week 1 Review & Go/No-Go Decision

### Task 0.5.1 - Compile Week 1 Report
**Owner:** Product Lead  
**Time:** 1-2 hours

**Create `ai/notes/week1-validation-report.md`:**

**Template:**
```markdown
# Week 1 Validation Report

## Environment Setup ✅/❌
- Gemini API: [status]
- Firebase: [status]
- Next.js: [status]
- Vercel deploy: [status]

## Campus Validation
- Flyers found: X
- % with required info: X%
- Club interviews: X/5
- Key insight: [summary]

## Gemini Validation
- Overall accuracy: X%
- Avg response time: X.Xs
- Decision: [Proceed / Modify / Pivot]

## Firestore Validation
- Real-time sync: [working / issues]
- Security rules: [set / pending]

## GO/NO-GO Decision
**Decision:** [GO / NO-GO / MODIFY]

**Rationale:** [why]

**Next Steps:** [what changes if any]
```

**Acceptance Criteria:**
- [ ] All checkpoints documented
- [ ] Data compiled
- [ ] Decision made

---

### Task 0.5.2 - Team Sync Meeting
**Owner:** Full team  
**Time:** 30 minutes

**Agenda:**
1. Review Week 1 results
2. Discuss any concerns
3. Make GO/NO-GO decision
4. Adjust Week 2 plan if needed

**Decision Criteria:**
- ✅ All 4 checkpoints passed?
- ✅ Team confident in tech stack?
- ✅ Any blockers identified?

**Outputs:**
- GO → Proceed to Week 2 (Development)
- MODIFY → Adjust approach (e.g., add manual entry)
- NO-GO → Revisit core assumptions

---

## Deliverables Checklist

**By end of Week 1, we must have:**
- [ ] Gemini API key obtained and working
- [ ] Firebase project fully set up
- [ ] Next.js project deployed to Vercel
- [ ] 20-30 BYU flyers photographed and analyzed
- [ ] 3-5 club president interviews completed
- [ ] Gemini accuracy tested (documented results)
- [ ] Firestore real-time sync verified
- [ ] Week 1 validation report completed
- [ ] GO/NO-GO decision made

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini API quota exceeded | Low | Medium | Use free tier carefully, <15 tests/min |
| Firebase setup issues | Low | High | Follow docs exactly, ask for help if stuck |
| Low flyer density on campus | Medium | High | Have backup plan (Slack bot, manual entry) |
| Gemini accuracy <70% | Low | High | Implement fallback to manual entry |
| Team member unavailable | Medium | Low | Share credentials, document everything |

---

## Success Definition

**Week 1 is successful if:**
1. ✅ We can deploy to production
2. ✅ We validated our core assumptions
3. ✅ We know exactly what to build in Week 2
4. ✅ Team is aligned and confident

**If any checkpoint fails, we MUST address it before Week 2.**

---

## References

- Main Plan: `ai/roadmaps/2026-02-16-implementation-plan.md`
- Architecture: `aiDocs/architecture.md`
- Gemini API Docs: `ai/guides/gemini-api-docs.md`
- Firebase Docs: `ai/guides/firebase-firestore-docs.md`
- Next.js Docs: `ai/guides/nextjs-14-docs.md`
