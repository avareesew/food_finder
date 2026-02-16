# MVP Demo Specification: Scavenger
## Minimum Viable Demo for BYU Campus Food Finder

**Version:** 1.0 - Demo Build  
**Date:** February 16, 2026  
**Purpose:** Working prototype to demonstrate core concept and validate technical feasibility  
**Timeline:** 2-3 weeks (or faster if scoped aggressively)

---

## Demo Objective

Build a **working web prototype** that demonstrates:
1. A student can upload a flyer photo and AI extracts event details
2. Events appear in a mobile-friendly feed
3. Students can browse what food is available this week

**Success Criteria:** Can we show this to 5 people and have them say "I would use this"?

---

## Core Demo Features (Must-Have)

### Feature 1: Upload Flyer & AI Extraction

**What it does:**
- User taps "Post Food" button
- Takes/uploads photo of event flyer
- Gemini 2.0 Flash API extracts key details
- User confirms/edits extracted data
- Submits → appears in feed

**Required Fields:**
- Event name
- Location (building + room)
- Date & time
- Food description
- Optional: Estimated portions

**UI Flow:**
```
[Home Screen]
     ↓
[Tap "Post Food" button]
     ↓
[Camera/Upload Interface]
     ↓
[AI Processing... spinner]
     ↓
[Confirmation Form with pre-filled data]
     ↓
[Submit button]
     ↓
[Success! → Redirect to feed]
```

**Technical Notes:**
- Can use simple file input for demo (native camera on mobile)
- Gemini API call on backend (or mock if API quota is limited)
- Store in Firestore (or even just in-memory array for demo)
- Show loading state while AI processes (2-3 seconds)

---

### Feature 2: The Feed (Main View)

**What it does:**
- Shows all food events for this week
- Mobile-optimized card layout
- Sorted by date/time (soonest first)
- Each card shows: event name, location, time, food type

**UI Layout (Mobile):**
```
┌─────────────────────────┐
│   SCAVENGER 🍕          │
│   [Post Food] button    │
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │ CS Club Pizza     │  │
│  │ 📍 TMCB 210       │  │
│  │ 🕐 Today, 5:00 PM │  │
│  │ 🍕 3 large pizzas │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Pre-Med Bagels    │  │
│  │ 📍 Talmage 155    │  │
│  │ 🕐 Tomorrow, 9 AM │  │
│  │ 🥯 2 dozen bagels │  │
│  └───────────────────┘  │
│  ...more events...      │
└─────────────────────────┘
```

**Technical Notes:**
- Simple card component (React)
- Map over events array
- Use Tailwind CSS or similar for mobile-first styling
- No infinite scroll needed (just show all this week's events)

---

### Feature 3: Event Detail View (Optional but Nice)

**What it does:**
- Tap a card → see full details
- Bigger view of flyer image (if available)
- All event info displayed clearly

**UI Layout:**
```
┌─────────────────────────┐
│  ← Back                 │
│                         │
│  [Flyer Image]          │
│                         │
│  CS Club Pizza Social   │
│  📍 TMCB 210            │
│  🕐 Today, 5:00-7:00 PM │
│  🍕 3 large pizzas      │
│     (pepperoni, cheese, │
│      veggie)            │
│                         │
│  Estimated: ~20 people  │
│                         │
│  [Close / Back to Feed] │
└─────────────────────────┘
```

**Technical Notes:**
- Simple modal or separate page
- Can skip this for absolute minimum demo
- But it's only ~30 min of work and makes demo feel more complete

---

## Demo Data Strategy

### Option A: Real Data (If Building Full Stack)
- User uploads real flyers
- Gemini API extracts data
- Store in Firestore
- **Pro:** Fully functional, impressive demo
- **Con:** More complex, requires API keys and backend

### Option B: Hybrid (Recommended for Fast Demo)
- User uploads flyers (real UI)
- Mock the AI extraction (pre-scripted responses)
- Store in local state (no database)
- **Pro:** Fast to build, looks real
- **Con:** Not actually using AI (but demo doesn't reveal this)

### Option C: Seed Data Only
- Pre-populate 5-10 fake events
- Show feed only (no upload)
- **Pro:** Can build in 1 day
- **Con:** Not interactive, less impressive

**Recommendation:** Start with Option C for initial mockup, then upgrade to Option A or B for working demo.

---

## Technical Specifications

### Tech Stack (Simplified for Demo)

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend** | Next.js (React) or plain React | Fast development, mobile-responsive |
| **Styling** | Tailwind CSS | Rapid UI prototyping |
| **Backend** | Next.js API routes OR mock data | Keep it simple for demo |
| **Database** | Firestore (if real) OR in-memory array | Firestore if you want real-time, array if just for demo |
| **AI** | Gemini 2.0 Flash API OR mocked | Real API is better but mock works for demo |
| **Hosting** | Vercel (free tier) | One-click deploy from GitHub |

### Minimal Data Model

```typescript
interface FoodEvent {
  id: string;
  eventName: string;
  location: {
    building: string;
    room: string;
  };
  dateTime: {
    start: Date;
    end: Date;
  };
  foodDescription: string;
  estimatedPortions?: number;
  imageUrl?: string;
  createdAt: Date;
}
```

**That's it.** No status tracking, no user IDs, no complex relationships. Just the bare minimum.

---

## User Flow (Complete Demo Journey)

### Scenario 1: Posting Food (Supply Side)

1. User opens scavenger.demo (mobile browser)
2. Sees feed of existing events
3. Taps **"Post Food"** floating action button
4. Camera opens (or file picker on desktop)
5. Takes photo of flyer on bulletin board
6. AI extraction runs (2-3 second loading spinner)
7. Form appears with pre-filled data:
   - Event name: "CS Club Pizza Social"
   - Location: "TMCB 210"
   - Date: "Today, 5:00 PM"
   - Food: "Pizza"
8. User confirms (or edits if AI got something wrong)
9. Taps **"Post"**
10. Success message: "Posted! Students can now find your food."
11. Redirected to feed, sees their event at the top

**Demo success:** They just posted food in <30 seconds with minimal typing.

---

### Scenario 2: Finding Food (Demand Side)

1. User opens scavenger.demo (mobile browser)
2. Sees feed of 5-10 events
3. Scrolls through cards:
   - "CS Club Pizza - TMCB 210 - Today 5 PM"
   - "Pre-Med Bagels - Talmage 155 - Tomorrow 9 AM"
   - "Marketing Club Sandwiches - WSC 2nd Floor - Today 12 PM"
4. Taps "Marketing Club Sandwiches" (currently happening)
5. Sees detail view with location and food description
6. Memorizes location: "WSC 2nd Floor"
7. Closes app and walks to location

**Demo success:** They found free food in <10 seconds.

---

## MVP Feature Priorities

### P0 (Must Have for Demo)
- ✅ Feed view (display list of events)
- ✅ Upload flyer UI
- ✅ AI extraction (real or mocked)
- ✅ Confirmation form
- ✅ Submit button → adds to feed
- ✅ Mobile-responsive design

### P1 (Nice to Have)
- ⚠️ Event detail view (tap card to expand)
- ⚠️ Time-based sorting ("Happening now" first)
- ⚠️ Loading states and animations
- ⚠️ Error handling (bad uploads, API failures)

### P2 (Skip for Demo)
- ❌ "Gone" button / status updates
- ❌ Filtering (location, time)
- ❌ User accounts
- ❌ Analytics
- ❌ Real-time sync (just refresh page)
- ❌ Admin moderation
- ❌ Legal disclaimers (can add later)

---

## Demo Script (For Showing to Others)

### Setup (Before Demo)
- Pre-populate 3-5 seed events in the feed
- Have 2-3 test flyer images ready to upload
- Test on your phone (not just desktop)
- Have backup screenshots if live demo fails

### The Demo (5 Minutes)

**[Open on phone, show feed]**
> "This is Scavenger—a real-time feed of free food on campus. As a student, I can see what's happening right now."

**[Scroll through feed]**
> "Here's pizza at TMCB, bagels at Talmage, sandwiches at the Wilkinson Center. Everything happening this week."

**[Tap 'Post Food' button]**
> "Now let's say I'm a club president and I have leftover food. I tap 'Post Food'..."

**[Upload flyer photo]**
> "I take a picture of the event flyer..."

**[Show AI extraction]**
> "The AI automatically reads the flyer and extracts the event details—location, time, food type..."

**[Show confirmation form]**
> "I just confirm it's correct and hit submit."

**[Show event appear in feed]**
> "And boom—it's live. Any student on campus can now see it."

**[Tap event to show detail]**
> "They can tap to see full details, then walk over and grab food before it's gone."

**Closing:**
> "That's it. We're solving the 'dark data' problem—making invisible free food discoverable in real-time."

---

## Build Timeline (Fast Track)

### Option 1: Real Working Demo (2-3 Weeks)
- **Week 1:** Frontend UI (feed + upload form) + mock data
- **Week 2:** Gemini API integration + Firestore setup
- **Week 3:** Polish, mobile optimization, deploy

### Option 2: Clickable Prototype (1 Week)
- **Days 1-2:** Design screens in Figma
- **Days 3-5:** Build static React components with seed data
- **Days 6-7:** Deploy, test on mobile, prepare demo script

### Option 3: Lightning Demo (3-5 Days)
- **Day 1:** Set up Next.js project
- **Day 2:** Build feed view with hardcoded events
- **Day 3:** Build upload form (mock AI extraction)
- **Day 4:** Mobile styling + deploy to Vercel
- **Day 5:** Test and prepare demo script

**Recommendation:** Go with Option 3 if you need to demo quickly. Upgrade to Option 1 if you have time and want a fully functional prototype.

---

## Technical Implementation Guide

### Step 1: Project Setup (30 minutes)

```bash
# Create Next.js project
npx create-next-app@latest scavenger-demo
cd scavenger-demo

# Install dependencies
npm install @google/generative-ai firebase
npm install -D tailwindcss

# Start dev server
npm run dev
```

---

### Step 2: Create Seed Data (15 minutes)

```typescript
// lib/seedData.ts
export const seedEvents = [
  {
    id: '1',
    eventName: 'CS Club Pizza Social',
    location: { building: 'TMCB', room: '210' },
    dateTime: {
      start: new Date('2026-02-17T17:00:00'),
      end: new Date('2026-02-17T19:00:00')
    },
    foodDescription: '3 large pizzas (pepperoni, cheese, veggie)',
    estimatedPortions: 20
  },
  {
    id: '2',
    eventName: 'Pre-Med Society Bagel Breakfast',
    location: { building: 'Talmage', room: '155' },
    dateTime: {
      start: new Date('2026-02-18T09:00:00'),
      end: new Date('2026-02-18T10:30:00')
    },
    foodDescription: '2 dozen bagels with cream cheese',
    estimatedPortions: 30
  },
  // Add 3-5 more...
];
```

---

### Step 3: Build Feed Component (1-2 hours)

```tsx
// components/FoodFeed.tsx
export default function FoodFeed({ events }) {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🍕 Scavenger</h1>
      <div className="space-y-4">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <button className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-4">
        + Post Food
      </button>
    </div>
  );
}
```

---

### Step 4: Build Upload Form (2-3 hours)

```tsx
// components/UploadForm.tsx
export default function UploadForm() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    
    // Option A: Real AI extraction
    const result = await callGeminiAPI(file);
    
    // Option B: Mock extraction
    const result = {
      eventName: 'CS Club Pizza',
      location: { building: 'TMCB', room: '210' },
      // ... mock data
    };
    
    setExtractedData(result);
    setLoading(false);
  };

  return (
    <div>
      {!extractedData ? (
        <input type="file" accept="image/*" onChange={handleUpload} />
      ) : (
        <ConfirmationForm data={extractedData} />
      )}
    </div>
  );
}
```

---

### Step 5: Deploy (30 minutes)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial demo build"
git push origin main

# Deploy to Vercel (free)
# Visit vercel.com, connect GitHub repo, click deploy
# Get URL: scavenger-demo.vercel.app
```

---

## What Success Looks Like

### Demo Day Outcomes

**Minimum Success:**
- ✅ People understand the concept immediately
- ✅ Someone says "I would use this"
- ✅ No major bugs during demo

**Good Success:**
- ✅ People ask "When can I start using this?"
- ✅ Someone offers to help (club, RA, etc.)
- ✅ You get 2-3 actionable feedback items

**Great Success:**
- ✅ Someone tries to use it on the spot
- ✅ You get a design partner commitment
- ✅ Someone shares it with their club/ward

---

## Post-Demo: Validation Questions

After showing the demo, ask:

1. **Would you use this?** (Yes/No + Why)
2. **Would you post food to this?** (If they're in clubs/orgs)
3. **What's confusing or missing?**
4. **How would you discover this app?** (Distribution question)
5. **What would make you trust the food info?** (Accuracy/trust question)

Use their answers to refine before building production version.

---

## What We Learn from This Demo

### Questions the Demo Answers:
- ✅ Can AI extract flyer data accurately enough?
- ✅ Is the mobile UX intuitive?
- ✅ Do people understand the value prop immediately?
- ✅ Does the "no login" approach work?

### Questions the Demo Doesn't Answer:
- ❌ Will people actually post consistently?
- ❌ How do we handle stale data?
- ❌ What's the viral growth mechanism?
- ❌ Will universities support/block this?

Those questions require a live pilot (Phase 2).

---

## Next Steps After Demo

### If Demo is Successful:
1. **Recruit 3-5 design partner clubs**
2. **Add "Gone" button and status tracking**
3. **Deploy to real BYU students (alpha test)**
4. **Collect feedback for 2 weeks**
5. **Iterate → public launch**

### If Demo Reveals Issues:
1. **Identify the biggest pain point**
2. **Pivot or refine the UX**
3. **Re-demo with updated version**

---

## Appendix: Quick Reference

### Essential Screens (Minimum)
1. **Feed View** (homepage)
2. **Upload/Camera View**
3. **Confirmation Form**

### Essential User Actions
1. Browse feed
2. Upload flyer
3. Confirm AI extraction
4. Submit post

### Technical Must-Haves
1. Image upload handler
2. Gemini API call (or mock)
3. Data storage (Firestore or local state)
4. Mobile-responsive CSS

### Time Estimate by Approach
- **Figma mockup only:** 1 day
- **Static demo (no backend):** 3-5 days
- **Working prototype:** 2-3 weeks

---

**Bottom Line:** This demo needs to show the magic moment: *"Take a photo → AI extracts data → Food appears in feed."* Everything else is secondary.

Focus on making that 30-second flow feel effortless and impressive.
