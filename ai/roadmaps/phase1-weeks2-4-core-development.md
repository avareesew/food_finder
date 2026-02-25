# Phase 1: Core Development
## Weeks 2-4 Detailed Implementation Plan

**Date Created:** February 16, 2026  
**Duration:** 3 weeks  
**Goal:** Build the essential "flyer → feed → gone" pipeline  
**Team:** Full team (3 people)

---

## Overview

This phase builds the three core features:
- **Week 2:** Upload flyer → AI extracts data → confirmation form
- **Week 3:** Feed displays posts in real-time
- **Week 4:** Status management + UI polish

**Success Criteria:** By end of Week 4, the full flow works end-to-end on mobile.

---

## Week 2: Upload & Extraction

**Goal:** User can upload a flyer photo and create a post

---

### Day 1-2: Design Phase

#### Task 2.0.1 - Create Figma Mockups
**Owner:** Designer  
**Time:** 4-6 hours

**Screens to Design (Mobile-First):**
1. **Feed View (Home):**
   - Header with "Scavenger 🍕" branding
   - Floating "Post Food" button (bottom right)
   - Card layout for each event
   - Empty state ("No food events this week")
   
2. **Upload Flow:**
   - Camera/file picker interface
   - Image preview after selection
   - Loading state while AI processes
   - Confirmation form with pre-filled data
   
3. **Event Detail View:**
   - Full-screen event info
   - Flyer image displayed
   - "Back to feed" button

**Design Principles:**
- Mobile-first (375px width)
- Stigma-free (feel like Instagram, not food aid)
- High contrast for outdoor viewing
- Large tap targets (44px minimum)

**Acceptance Criteria:**
- [ ] All 3 screens designed
- [ ] Mobile and desktop variants
- [ ] Team reviewed and approved
- [ ] Component hierarchy documented

---

#### Task 2.0.2 - Component Planning
**Owner:** Tech Lead + Designer  
**Time:** 1 hour

**Define Component Structure:**
```
app/
├── page.tsx              // Feed view
├── post/
│   └── page.tsx          // Upload form
├── event/[id]/
│   └── page.tsx          // Detail view

components/
├── EventCard.tsx         // Feed item
├── UploadForm.tsx        // Camera + form
├── ConfirmationForm.tsx  // AI data verification
└── LoadingState.tsx      // Skeletons
```

**Document in `ai/notes/week2-component-plan.md`**

**Acceptance Criteria:**
- [ ] Component tree defined
- [ ] Props interfaces sketched out
- [ ] File structure agreed upon

**Checkpoint:** Do mockups feel simple and approachable?

---

### Day 3-4: Upload UI Implementation

#### Task 2.1.1 - Create Upload Form Component
**Owner:** Engineer 1  
**Time:** 3-4 hours

**Build `components/UploadForm.tsx`:**
- File input with `accept="image/*"`
- Camera capture on mobile (`capture="environment"`)
- Image preview after selection
- File size validation (<10MB)
- Basic styling (Tailwind)

**User Flow:**
1. Tap "Post Food" button
2. Camera opens (or file picker)
3. Take/select photo
4. See preview
5. Tap "Next" to process

**Acceptance Criteria:**
- [ ] Form renders on mobile and desktop
- [ ] Camera opens on mobile browsers
- [ ] Image preview shows after selection
- [ ] File size validation works
- [ ] Component is styled per Figma

**Reference:** `aiDocs/coding-style.md`, `ai/guides/nextjs-14-docs.md`

---

#### Task 2.1.2 - Image Upload to Firebase Storage
**Owner:** Engineer 1  
**Time:** 2 hours

**Build `lib/uploadImage.ts`:**
```typescript
// Upload image to Firebase Storage
// Return download URL
// Handle errors gracefully
```

**Steps:**
1. Generate unique filename (timestamp + uuid)
2. Create storage reference: `flyers/{postId}/{filename}`
3. Upload file using `uploadBytes()`
4. Get download URL with `getDownloadURL()`
5. Return URL string

**Acceptance Criteria:**
- [ ] Function uploads image successfully
- [ ] Returns valid download URL
- [ ] Handles errors (network, storage full)
- [ ] Images visible in Firebase Console

**Reference:** `ai/guides/firebase-firestore-docs.md`

---

### Day 5-6: Gemini API Integration

#### Task 2.2.1 - Create API Route for Extraction
**Owner:** Engineer 2  
**Time:** 3-4 hours

**Build `app/api/extract-flyer/route.ts`:**
- Accept multipart form data (image file)
- Convert to base64
- Call Gemini API with JSON schema
- Return structured JSON
- **Implement rate limiting** (5 uploads/IP/hour to prevent abuse)

**JSON Schema (Our Post Structure):**
```json
{
  "type": "object",
  "properties": {
    "eventName": {"type": "string"},
    "location": {
      "type": "object",
      "properties": {
        "building": {"type": "string"},
        "room": {"type": "string"}
      }
    },
    "dateTime": {
      "type": "object",
      "properties": {
        "start": {"type": "string"},
        "end": {"type": "string"}
      }
    },
    "foodDescription": {"type": "string"},
    "estimatedPortions": {"type": "number"}
  },
  "required": ["eventName", "location", "dateTime", "foodDescription"]
}
```

**Error Handling:**
- 400: No image provided
- 413: File too large (>10MB)
- 429: Rate limit exceeded
- 500: Gemini API error

**Acceptance Criteria:**
- [ ] API route works
- [ ] Returns valid JSON matching schema
- [ ] Rate limiting implemented
- [ ] Errors handled gracefully

**Reference:** `ai/guides/gemini-api-docs.md`, `ai/guides/nextjs-14-docs.md`

---

#### Task 2.2.2 - Create Extraction Prompt
**Owner:** Tech Lead  
**Time:** 1-2 hours (iteration)

**Optimize Prompt for BYU Flyers:**
```
You are analyzing a BYU campus event flyer. Extract:
1. Event name/title
2. Building name and room number (e.g., "TMCB 210", "Talmage 155")
3. Date and start/end time (if available, convert to ISO format)
4. Food description (what food is provided)
5. Estimated portions if mentioned

BYU building codes to recognize:
- TMCB (Tanner Building)
- MARB (Maeser Building)
- WSC (Wilkinson Student Center)
- [add more as needed]

Return ONLY valid JSON. If a field is unclear, use null.
```

**Test and Iterate:**
- Test on 5 validation flyers
- Adjust prompt if accuracy is low
- Document best prompt version

**Acceptance Criteria:**
- [ ] Prompt achieves 80%+ accuracy on test set
- [ ] BYU-specific building codes recognized
- [ ] JSON output is valid

---

### Day 7: Confirmation Form

#### Task 2.3.1 - Build Confirmation Form Component
**Owner:** Engineer 1  
**Time:** 3-4 hours

**Build `components/ConfirmationForm.tsx`:**
- Pre-populate form with AI-extracted data
- All fields editable
- Validate required fields
- Date/time pickers for corrections
- Submit button

**Form Fields:**
- Event name (text input)
- Building (text input or dropdown)
- Room (text input)
- Date (date picker)
- Start time (time picker)
- End time (time picker, optional)
- Food description (textarea)
- Estimated portions (number input, optional)

**Acceptance Criteria:**
- [ ] Form renders with AI data
- [ ] All fields are editable
- [ ] Validation works (required fields)
- [ ] Mobile-friendly (large inputs)
- [ ] Matches Figma design

---

#### Task 2.3.2 - Submit Post to Firestore
**Owner:** Engineer 2  
**Time:** 2 hours

**Build `lib/createPost.ts`:**
- Accept form data
- Generate unique edit key (UUID)
- Upload image to Firebase Storage (if not already done)
- Create Firestore document
- Return post ID and edit key

**Post Schema:**
```typescript
{
  eventName: string;
  location: {building: string; room: string};
  dateTime: {start: Timestamp; end: Timestamp};
  foodDescription: string;
  estimatedPortions?: number;
  status: 'available';
  imageUrl?: string;
  uploaderEditKey: string;  // UUID for editing without auth
  source: 'flyer_photo';
  createdAt: serverTimestamp();
  updatedAt: serverTimestamp();
}
```

**Acceptance Criteria:**
- [ ] Post created in Firestore
- [ ] Edit key generated and returned
- [ ] Image URL saved
- [ ] Timestamps set correctly

---

#### Task 2.3.3 - Post-Submit Flow
**Owner:** Engineer 1  
**Time:** 1 hour

**After Successful Post:**
1. Show success message
2. Save edit key to localStorage (so user can mark as gone later)
3. Redirect to feed
4. Highlight their new post

**Acceptance Criteria:**
- [ ] Success message shown
- [ ] Edit key saved
- [ ] Redirects to feed
- [ ] New post appears in feed

**Week 2 Checkpoint:** ✅ Can a user upload a flyer and create a post?

---

## Week 3: Feed & Display

**Goal:** Users can browse a live-updating feed of food events

---

### Day 1-2: Feed UI Component

#### Task 3.1.1 - Build Event Card Component
**Owner:** Engineer 1  
**Time:** 2-3 hours

**Build `components/EventCard.tsx`:**

**Display:**
- Event name (heading)
- Location icon + building & room
- Time icon + relative time ("In 30 min", "Today at 5 PM")
- Food icon + description
- Estimated portions (if available)
- Thumbnail of flyer image (optional)

**Interactive:**
- Tap card → navigate to detail view
- Subtle hover state (desktop)

**Acceptance Criteria:**
- [ ] Card renders with mock data
- [ ] All info displayed clearly
- [ ] Mobile-responsive
- [ ] Matches Figma design

**Reference:** `aiDocs/coding-style.md` (React patterns)

---

#### Task 3.1.2 - Build Feed Container
**Owner:** Engineer 1  
**Time:** 2 hours

**Build `app/page.tsx` (Feed view):**
- Load posts from Firestore
- Map over posts → EventCard components
- Sort by time (soonest first)
- Empty state if no posts
- Loading skeleton while fetching

**Layout:**
```
[Header: "Scavenger 🍕"]
[EventCard 1]
[EventCard 2]
[EventCard 3]
...
[Floating "Post Food" button]
```

**Acceptance Criteria:**
- [ ] Feed renders cards
- [ ] Sorted by time correctly
- [ ] Empty state works
- [ ] Loading state shown
- [ ] Mobile-responsive

---

### Day 3-4: Firestore Integration

#### Task 3.2.1 - Query Posts from Firestore
**Owner:** Engineer 2  
**Time:** 2 hours

**Build `lib/getPosts.ts`:**
```typescript
// Query available posts
// Filter: status === 'available'
// Order by: dateTime.start (ascending)
// Limit: 50
```

**Use in Feed Component:**
- Option A: Server component (fetch on server)
- Option B: Client component (fetch on mount)

**For MVP, choose Option B (client-side) for real-time updates**

**Acceptance Criteria:**
- [ ] Query returns available posts
- [ ] Posts sorted by time
- [ ] Limit works (max 50)
- [ ] No errors

**Reference:** `ai/guides/firebase-firestore-docs.md`

---

#### Task 3.2.2 - Set Up Real-Time Listener
**Owner:** Engineer 2  
**Time:** 2-3 hours

**Add to Feed Component:**
- Use `onSnapshot()` for real-time updates
- Update state when new posts added
- Update state when posts modified
- Remove posts when marked as gone
- Cleanup listener on unmount

**Implementation:**
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'posts'), where('status', '==', 'available')),
    (snapshot) => {
      // Handle changes
      setPosts(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    }
  );
  return () => unsubscribe();
}, []);
```

**Acceptance Criteria:**
- [ ] Feed updates automatically when new posts added
- [ ] Feed updates when posts modified
- [ ] Posts disappear when marked as gone
- [ ] No manual refresh needed
- [ ] Listener cleanup on unmount

**Reference:** `ai/guides/firebase-firestore-docs.md` (Real-Time Listener section)

---

#### Task 3.2.3 - Handle Loading & Error States
**Owner:** Engineer 1  
**Time:** 1-2 hours

**States to Handle:**
- Loading: Show skeleton cards
- Error: Show friendly error message
- Empty: Show "No food events this week" with CTA to post

**Acceptance Criteria:**
- [ ] Loading state shows immediately
- [ ] Error state displays message
- [ ] Empty state shows helpful text
- [ ] All states match design

---

### Day 5: Event Detail View

#### Task 3.3.1 - Build Detail Page
**Owner:** Engineer 1  
**Time:** 2-3 hours

**Build `app/event/[id]/page.tsx`:**
- Fetch single post by ID
- Display all fields
- Show full-size flyer image
- "Back to Feed" button
- Optional: "Directions" link (Google Maps)

**Layout:**
```
[← Back to Feed]
[Flyer Image - large]
[Event Name - heading]
[📍 Location]
[🕐 Time]
[🍕 Food Description]
[Estimated Portions]
```

**Acceptance Criteria:**
- [ ] Page loads with post data
- [ ] All info displayed
- [ ] Image shown at good size
- [ ] Back button works
- [ ] Mobile-responsive

---

**Week 3 Checkpoint:** ✅ Can users browse a live-updating feed?

---

## Week 4: Status Management & Polish

**Goal:** Make data accurate and UI polished

---

### Day 1-2: "Mark as Gone" Feature

#### Task 4.1.1 - Generate Edit Links
**Owner:** Engineer 2  
**Time:** 1-2 hours

**When Post Created:**
- Generate UUID as edit key
- Store in post document: `uploaderEditKey`
- Return edit URL to user: `/edit/{postId}?key={editKey}`
- Optionally: Save to localStorage for easy access

**Acceptance Criteria:**
- [ ] UUID generated on post creation
- [ ] Edit key stored in document
- [ ] Edit URL returned to user
- [ ] URL includes both postId and key

---

#### Task 4.1.2 - Build Edit/Status Page
**Owner:** Engineer 2  
**Time:** 2-3 hours

**Build `app/edit/[id]/page.tsx`:**
- Verify edit key matches post's editKey
- Show current post status
- Button: "Mark as Gone"
- Update post status to 'gone'
- Show success message

**Security:**
- If key doesn't match → 403 Forbidden
- If post doesn't exist → 404 Not Found

**Acceptance Criteria:**
- [ ] Edit page loads with key verification
- [ ] "Mark as Gone" button works
- [ ] Status updates in Firestore
- [ ] Change propagates to all clients (real-time)
- [ ] Security checks work

**Reference:** `ai/guides/firebase-firestore-docs.md` (Update Document section)

---

### Day 3: Time-Based Features

#### Task 4.2.1 - Auto-Expire Posts
**Owner:** Engineer 2  
**Time:** 2 hours

**Implementation:**
- Query filters out posts where `dateTime.end < now()`
- Client-side filtering (MVP approach, posts remain in database)
- **Note:** Phase 2 should add Cloud Function to delete expired posts
- Alternative: Firebase Cloud Function (Phase 2)

**In Feed Query:**
```typescript
where('dateTime.end', '>=', Timestamp.now())
```

**Acceptance Criteria:**
- [ ] Past events don't show in feed
- [ ] Events disappear after end time
- [ ] No manual cleanup needed

---

#### Task 4.2.2 - Relative Time Display
**Owner:** Engineer 1  
**Time:** 1-2 hours

**Build `lib/formatEventTime.ts`:**
- Use `date-fns` for formatting
- Show relative time:
  - "In 30 min"
  - "Happening now"
  - "Today at 5:00 PM"
  - "Tomorrow at 9:00 AM"
  - "Thu, Feb 20 at 2:00 PM"

**Acceptance Criteria:**
- [ ] Time formats correctly
- [ ] Updates as time changes
- [ ] Handles edge cases (past events, far future)
- [ ] Uses consistent timezone (Mountain Time)

---

#### Task 4.2.3 - Status Indicators
**Owner:** Engineer 1  
**Time:** 1 hour

**Add Visual Indicators:**
- Badge: "🔴 Happening Now" (green for active events)
- Badge: "⏰ In 30 min" (yellow for soon)
- Badge: "📅 Tomorrow" (blue for future)

**Logic:**
- Happening now: start <= now <= end
- Soon: start - now < 1 hour
- Future: start > now + 1 hour

**Acceptance Criteria:**
- [ ] Badges show on cards
- [ ] Colors match status
- [ ] Updates in real-time

---

### Day 4-5: UI Polish

#### Task 4.3.1 - Loading Skeletons
**Owner:** Engineer 1  
**Time:** 2 hours

**Build `components/LoadingState.tsx`:**
- Skeleton cards (gray boxes with pulse animation)
- Match actual card layout
- Show 3-5 skeleton cards while loading

**Acceptance Criteria:**
- [ ] Skeletons render immediately
- [ ] Pulse animation works
- [ ] Replaced by real cards when loaded

---

#### Task 4.3.2 - Error Handling
**Owner:** Full team  
**Time:** 2-3 hours

**Handle All Error States:**
- Network error (offline)
- Gemini API error (rate limit, server error)
- Firestore error (permission denied)
- Image upload error (storage full)

**User-Facing Messages:**
- "Couldn't upload flyer. Please try again."
- "Couldn't load feed. Check your connection."
- "Something went wrong. Please refresh."

**Acceptance Criteria:**
- [ ] All error paths handled
- [ ] Clear error messages shown
- [ ] User can recover (retry button)
- [ ] Errors logged to console (for debugging)

**Reference:** `aiDocs/coding-style.md` (Error Handling section)

---

#### Task 4.3.3 - Mobile Optimizations
**Owner:** Full team  
**Time:** 2-3 hours

**Optimizations:**
- Pull to refresh gesture (feed)
- Smooth scroll animations
- Fast tap response (<100ms)
- Image lazy loading
- Optimize bundle size (remove unused code)

**Test On:**
- iPhone (Safari)
- Android (Chrome)
- Various screen sizes (375px, 414px, 390px)

**Acceptance Criteria:**
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Feels fast and responsive
- [ ] No jank or lag

---

#### Task 4.3.4 - Accessibility
**Owner:** Engineer 1  
**Time:** 2 hours

**WCAG 2.1 AA Compliance:**
- All images have alt text
- Buttons have aria-labels
- Form inputs have labels
- Color contrast ≥ 4.5:1
- Keyboard navigation works

**Test:**
- Tab through entire app
- Use screen reader (VoiceOver on Mac)
- Check color contrast (browser DevTools)

**Acceptance Criteria:**
- [ ] Keyboard navigation works
- [ ] Screen reader can read all content
- [ ] Color contrast passes
- [ ] Focus states visible

**Reference:** `aiDocs/coding-style.md` (Accessibility section)

---

**Week 4 Checkpoint:** ✅ Is the core flow polished and bug-free?

---

## Deliverables Checklist

**By end of Week 4, we must have:**
- [ ] Upload flow: Photo → AI → Confirm → Post (working)
- [ ] Feed view: Real-time list of events (working)
- [ ] Event detail view: Full post info (working)
- [ ] "Mark as Gone" feature (working)
- [ ] Auto-expiration of past events (working)
- [ ] All UI polished and mobile-optimized
- [ ] All error states handled
- [ ] Deployed to Vercel (production-ready)

---

## Testing Protocol (End of Week 4)

**Internal Team Test:**
1. Each team member uploads 2-3 real flyers
2. Browse feed on mobile devices
3. Mark posts as gone
4. Verify real-time updates work across devices
5. Document any bugs in `ai/notes/week4-bugs.md`

**Bug Triage:**
- Critical (blocks alpha) → Fix immediately
- Medium (UX issue) → Fix before alpha
- Low (nice to have) → Defer to Phase 2

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI extraction still buggy | Medium | High | Extra time for prompt engineering (Day 6 buffer) |
| Real-time sync has issues | Low | High | Fallback to polling (refresh button) |
| Mobile UX not intuitive | Medium | Medium | Extra design iteration time (Day 5 buffer) |
| Scope creep (added features) | High | Medium | Strict adherence to MVP scope, kill features |

---

## Success Definition

**Weeks 2-4 are successful if:**
1. ✅ Core "flyer → feed → gone" flow works end-to-end
2. ✅ No critical bugs on mobile
3. ✅ Team can demo the working prototype
4. ✅ Ready for alpha testing (Week 5)

---

## References

- Main Plan: `ai/roadmaps/2026-02-16-implementation-plan.md`
- Architecture: `aiDocs/architecture.md`
- Coding Style: `aiDocs/coding-style.md`
- API Guides: `ai/guides/`
