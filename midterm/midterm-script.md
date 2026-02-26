# Scavenger — Midterm Presentation Script
**IS590R Applied AI Projects · Team 8 · ~14 minutes**

> **Speaker key:** Each section is assigned to one presenter. All four contribute.
> Slide numbers match the deck. Words in *italics* are delivery notes, not spoken aloud.

---

## RYAN — Slides 1–4 (~3:30)

---

### Slide 1 — Title

*[Stand, make eye contact, don't rush.]*

"We're Team 8. Our project is called Scavenger — and by the end of this pitch, we think you'll agree that the problem it solves is both obvious in hindsight and completely unsolved today."

*[Pause one beat.]*

"Let me tell you about the Ghost Chase."

---

### Slide 2 — Visibility Failure

"Here's a number that surprised us: 41% of college students face food insecurity. Not hunger in an abstract sense — active, weekly difficulty getting enough food.

At the same time, every single day on college campuses, catered leftovers from club events get thrown away. Not because there's no demand. Because the students who need that food never found out it existed.

This isn't a food problem. It's a data problem.

Flyers get posted on walls and never digitized. Group chats only reach the people already in the room. Instagram posts decay before anyone sees them. The information lives in the physical world and dies there.

The supply exists. The demand exists. There's no channel connecting them in real time."

---

### Slide 3 — BYU: The Perfect Pilot

"We're building this at BYU first — and that's a deliberate choice, not a default.

37,000 students. Hundreds of active clubs. There's already an Instagram account called *@byufreefood* that people follow specifically to find out about free food on campus. That's a demand signal that already exists without us — proof that students want this.

BYU's service culture also reduces the stigma that would make people hesitant to show up to a club event just for the food. And critically — our team is on campus. We can iterate and validate in real time, not through Zoom calls."

---

### Slide 4 — The Ghost Chase Problem

"So let's get specific about what we're actually solving. We call it the Ghost Chase — and most of you have probably lived this.

One: flyers aren't digitized. The information is trapped on a wall somewhere.

Two: insider bias. If you're not already in the group chat, you don't hear about it.

Three: no source of truth. Once the food is gone, no one updates anything — so the record just disappears.

Four: information decay. By the time word gets to you, you're already too late.

Students walk across campus, show up to a room, and the food is gone. It was there — they just never knew. That's the Ghost Chase. That's what Scavenger eliminates."

*[Hand off to Ava.]*

---

## AVA — Slides 5–6 (~2:30)

---

### Slide 5 — Our Solution: The Scavenger Loop

"Thanks Ryan. So here's how we solve it — and we want you to notice how simple we've kept it deliberately.

The Scavenger loop has four steps.

Someone on campus sees a flyer for a food event. They take a photo. That's the upload.

Our AI — Google's Gemini model — automatically pulls the time, location, building, and food type from that photo. No typing, no forms. That's the extract step.

The post goes live on a real-time, campus-wide feed that anyone can browse. No account required. That's broadcast.

And when the food is gone, anyone can tap 'Mark as Gone' — which instantly kills the listing and prevents the next ghost chase. That's verify.

Three design decisions we made deliberately: no accounts required — you browse like you're on Instagram. The post flow takes under 60 seconds. And it syncs in real time through Firestore. Every one of those decisions was made to reduce friction, because we learned quickly that friction is the enemy."

---

### Slide 6 — The Core Hypothesis

"Everything we're building rests on a single bet. Our founding hypothesis is:

*'If we make food discovery instant and browsing anonymous, students will repeatedly use Scavenger weekly.'*

That's four specific assumptions we're testing. Under 60 seconds to post. No login to browse. A 30-minute window before food is gone. And enough weekly volume to sustain a live feed.

These are not hopes. They are explicit bets that we are actively working to prove — or disprove."

*[Hand off to Allie.]*

---

## ALLIE — Slides 7–8 (~3:00)

---

### Slide 7 — Voice of the Customer

"Thanks Ava. We've done two customer interviews so far — both with active BYU club presidents who are exactly the supply-side users we're depending on.

Kendall Castellaw, past Finance Society president at the Marriott School, told us: *'Any exposure is good exposure. I'm fine with people coming just for food if they sit through the event.'*

Carson Fellows, current Management Consulting Club president, said: *'If it got more people to go to the club, then maybe. Sure — no harm in it.'*

Two separate conversations. Two consistent signals. The motivation that unlocks willingness to post is not waste reduction — it's recruitment. Club presidents want attendance. Scavenger becomes a recruitment tool, not a charity platform. That reframe matters."

---

### Slide 8 — What We Learned

"And here's where we want to be honest with you, because this is a validation pitch, not a victory lap.

We went in with five assumptions. Two are confirmed. Two are at risk. One is nuanced.

The physical flyer assumption — that 70% of events would have flyers to photograph — that's at risk. Tanner Building clubs are digital-first. We don't yet know what's true outside Tanner. We need more interviews.

Leftover supply being reliable? Also at risk. Both clubs told us they rarely have leftovers — they intentionally order conservatively. That changes what Scavenger is. The feed may need to surface food *during* events, not just post-event scraps.

Organizers posting willingly? Nuanced. They won't go out of their way for waste reduction — but both said yes when framed around getting more people to their events.

Now here's what we can report definitively — our Falsification Test number one.

We hypothesized that liability concerns would be a blocker for organizers. We tried to prove ourselves wrong. We asked directly. Zero concerns. Across two completely independent interviews. That assumption is decisively falsified — and it removes the biggest imagined supply-side barrier.

The signal this gives us: the friction problem is real, the motivation is recruitment, and liability is not the issue we feared."

*[Hand off to Eddy.]*

---

## EDDY — Slides 9–12 (~4:00)

---

### Slide 9 — Competitive Mapping

"Thanks Allie. Let me show you why no existing solution solves this.

Olio targets general community sharing — it's manual, generic, not built for campus. Too Good To Go is for retail — paid, semi-structured, not a campus product. Group chats are fragmented and manual — you have to already be in the room.

Scavenger sits in a different quadrant entirely. Campus-native UX. AI-assisted ingestion. A built-in trust loop through 'Mark as Gone.' None of the alternatives have all three. The top-right quadrant of campus-specific plus low-friction is genuinely unoccupied."

---

### Slide 10 — System & Leverage Points

"Here's how we built it and why the technical choices matter.

The frontend is Next.js, TypeScript, React — mobile-first, deployed on Vercel. All uploads hit a serverless API route that fans out to three services.

Gemini — Google's vision model — will handle flyer extraction. It's 30 times cheaper per call than GPT-4o. That matters for a free product with no revenue yet.

Firestore is live and active — it's our real-time database. The moment a post is created or marked as gone, every connected client updates instantly. That's the 'Now' view that makes Scavenger worth checking.

Firebase Storage is also active — handling image uploads. The pipeline from phone photo to database record is functional today.

The leverage point here is simple: we sit between the club event and the student who needs to know. Everything else is infrastructure to make that connection instant and reliable."

---

### Slide 11 — Built & Tested

*[If doing a live demo, pull it up before this slide.]*

"Here's what's actually shipped. Homepage with a Leaflet map. A live feed and event detail pages. The upload API end-to-end — Storage to Firestore. The upload form. And a structured logging layer.

What's in progress: wiring Gemini, building 'Mark as Gone,' and adding real-time `onSnapshot` listeners.

We built this with Cursor — AI-assisted development throughout. Every build cycle is logged: we run a test script that triggers lint, a production build, and writes a timestamped log file. Three documented cycles, seven commits, conventional commit prefixes.

We want to show you the app running. *[Live demo — 60 seconds.]*"

---

### Slide 12 — The Ask

"Here's where we are and where we're going.

The foundation is validated. Two interviews done, recruitment framing confirmed, liability falsified. The infrastructure is live.

Week 2: we wire Gemini and ship the confirmation flow — the demo becomes real.

Week 3: 'Mark as Gone' and real-time sync go live — the full end-to-end pipeline is complete.

Weeks 4 and 5: we deploy to Vercel, recruit 5 to 10 alpha testers, and seed 10 to 15 real campus events.

At the gate: if we hit 70% satisfaction, we expand — more buildings, Slack and email ingestion, gamified posting incentives. If the supply-side proves too thin, we narrow to 2 or 3 high-volume clubs and add SMS alerts to drive urgency.

We're not asking you to believe it will work. We're asking you to believe we'll know, quickly, whether it does — and that we have a plan either way.

Green-light the next sprint."

---

## Delivery Notes

- **Total target time:** 13–14 minutes. Leave 1–2 minutes for questions.
- **Transitions:** Each speaker should physically move or at least make eye contact with the room before starting — don't just hand off verbally while staring at the screen.
- **Demo (Slide 11):** Keep it to 60–90 seconds max. Show the feed and the upload flow. Don't narrate every click.
- **Tone:** You are pitching to executives deciding whether to fund the next sprint. Confident, direct, honest about what's at risk.
- **The Ghost Chase:** Make sure Ryan says it with weight. It's the most memorable line in the deck — use it.
- **Allie on Slide 8:** This is the most important slide in the deck. Don't rush it. The honest accounting of what you learned is what separates a good team from a great one in this kind of pitch.
