# Scavenger — Midterm Validation Pitch
## Slide Outline · 15-Minute Executive Presentation

---

## How to Generate & Open the Presentation

**Step 1 — Navigate to the midterm folder (from the project root):**
```bash
cd midterm
```

**Step 2 — Generate the HTML:**
```bash
npx @marp-team/marp-cli midterm-presentation.md --html --allow-local-files --no-stdin -o midterm-presentation.html
```

**Step 3 — Open in browser:**
```bash
open midterm-presentation.html
```

> Use **arrow keys** to navigate slides. Press **F** for fullscreen.
> The HTML version is recommended for live presenting — all colors, fonts, and diagrams render correctly.

---

**Total slides:** 13  
**Pacing:** ~1:00–1:30 per content slide, 0:30 for title, ~1:45 presenter flex  
**Narrative arc:** Problem → Discovery → Hypothesis under pressure → System → Evidence → Greenlight

---

## Slide Map

| # | Title | Domain | Time |
|---|-------|--------|------|
| 1 | Scavenger: Making Invisible Campus Food Discoverable | Presentation Quality | 0:30 |
| 2 | The Problem: A Dark Data Gap | Jason | 1:00 |
| 3 | Why Every Alternative Fails | Jason | 0:45 |
| 4 | Three Personas, One Core Job | Jason | 1:00 |
| 5 | Customer Discovery: First Interview In | Jason | 1:30 |
| 6 | What We Learned: A Hypothesis Under Pressure | Jason | 1:00 |
| 7 | System Architecture | Jason + Casey | 1:00 |
| 8 | Build Status: What's Shipped | Casey | 1:15 |
| 9 | PRD-Driven Development & Documentation Pipeline | Casey | 1:00 |
| 10 | Structured Logging & Debugging Infrastructure | Casey | 1:15 |
| 11 | CLI Test Pipeline & Git Iteration Patterns | Casey | 1:00 |
| 12 | Validation Framework: Success, Failure, and Pivots | Jason | 1:00 |
| 13 | Path to Greenlight: Next Steps & Ask | Both | 1:00 |

**Jason-domain subtotal:** Slides 2, 3, 4, 5, 6, 12 → ~6:15  
**Casey-domain subtotal:** Slides 8, 9, 10, 11 → ~4:30  
**Shared / presentation:** Slides 1, 7, 13 → ~2:30  

---

## Slide Detail

### Slide 1 — Scavenger: Making Invisible Campus Food Discoverable
**Domain:** Presentation Quality  
**Time:** 0:30

Opening hook. State the mission in one sentence. Set the 15-minute agenda. Signal that this is a process pitch, not just a product pitch.

---

### Slide 2 — The Problem: A Dark Data Gap
**Domain:** Jason  
**Time:** 1:00

- 41% of college students are food insecure (8M+ nationally)
- Free food from club events goes to waste daily — not from lack of supply, but lack of visibility
- Physical flyers, group chats, and Instagram posts don't scale — information lives in silos
- Frame: this is an **information asymmetry problem**, not a food supply problem

---

### Slide 3 — Why Every Alternative Fails
**Domain:** Jason  
**Time:** 0:45

Competitive differentiation table. Three alternatives, each failing on a different axis:

- **Too Good To Go** — requires payment, restaurant-only, no campus presence
- **Campus pantries** — fixed hours, formal application, social stigma
- **Word-of-mouth / group chats** — doesn't scale, only reaches connected students

Scavenger's position: free, anonymous, real-time, campus-specific, AI-curated.

---

### Slide 4 — Three Personas, One Core Job
**Domain:** Jason  
**Time:** 1:00

Name and define the three personas. Keep it tight — one sentence each on their pain and their job-to-be-done:

- **Hungry Hustler (Tyler)** — needs anonymous, zero-friction, mobile-first discovery
- **Club Recruiter (Sarah)** — needs quick posting, legal clarity, more event attendees
- **Eco-Conscious RA (Marcus)** — needs sustainability metrics and floor-wide awareness

Tie persona design decisions back to product choices: no login, stigma-free UX, FDIA disclaimer.

---

### Slide 5 — Customer Discovery: First Interview In
**Domain:** Jason  
**Time:** 1:30

Present the Kendall Castlelaw interview (Finance Society, Marriott School) as a structured finding, not just a quote dump. Use the interview to demonstrate the validation *process*:

- **Who:** Past Finance Society President, Tanner Building
- **Food frequency:** Every event — 80% company-sponsored
- **Leftovers:** Rarely wasted (high attendance), but usually taken home by organizers
- **Posting barrier:** Members-first instinct — *"this food was paid for by Finance Society members"*
- **Liability:** No concerns. *"Any exposure is good exposure."*
- **Critical finding:** Marriott School policy prohibits physical flyer distribution in Tanner except for large, school-wide events — digital screens and Instagram only

Reference: `ai/notes/week1-club-interviews.md`

---

### Slide 6 — What We Learned: A Hypothesis Under Pressure
**Domain:** Jason  
**Time:** 1:00

This slide frames the first interview as *falsification in action* — the process working, not failing:

| Assumption | Status | Evidence |
|---|---|---|
| 70%+ of events have physical flyers | ⚠️ At Risk | Tanner is flyer-free by policy |
| Organizers will post leftovers willingly | ⚠️ Nuanced | Members-first preference; framing matters |
| Liability is a supply-side blocker | ✅ Validated — not a blocker | Zero concerns raised |
| Food events are frequent | ✅ Validated | Every Finance Society event had food |

**The pivot signal:** If Tanner is representative, the primary ingestion method may shift from AI flyer scanning → manual/digital entry. A second interview from a non-Marriott club will confirm or isolate this finding.

**This is the midterm's most honest moment — own it.**

---

### Slide 7 — System Architecture
**Domain:** Jason + Casey  
**Time:** 1:00

Full-stack diagram: Browser → Vercel (Next.js) → Firebase Storage + Firestore + Gemini 2.0 Flash. Keep it visual, not a list. Annotate what is built vs. what is pending.

Key callouts:
- **Gemini 2.0 Flash:** 30× cheaper than GPT-4o, 6× faster, superior OCR — *pending integration*
- **Firestore:** real-time NoSQL — *client initialized, upload writing to DB*
- **No auth:** deliberate MVP decision — reduces friction, saves 2 weeks dev time
- Tech decisions log in `aiDocs/architecture.md`

---

### Slide 8 — Build Status: What's Shipped
**Domain:** Casey  
**Time:** 1:15

Honest split of built vs. in-progress. Grounded in actual file paths — not aspirational.

**Shipped:**
- Homepage with hero, interactive Leaflet campus map, feed preview, testimonials
- Feed page with Firestore query + mock data fallback (`src/app/feed/page.tsx`)
- Upload API: Firebase Storage → Firestore document creation (`src/app/api/upload/route.ts`)
- Upload form: drag-and-drop, image preview, error/success states (`src/components/UploadForm.tsx`)
- EventCard, EmptyState, PrimaryButton shared UI components
- Structured logger wired to all data flows (`src/lib/logger.ts`)

**In Progress:**
- Gemini AI extraction (upload stores file; parsing is `TODO`)
- "Mark as Gone" toggle + unique edit links
- `onSnapshot` real-time listener (currently `getDocs` polling)

---

### Slide 9 — PRD-Driven Development & Documentation Pipeline
**Domain:** Casey  
**Time:** 1:00

Demonstrate that the documentation structure is a system, not a filing cabinet:

- `aiDocs/prd.md` — 765 lines: personas, competitive table, success/failure criteria, pivot plans. Every feature traceable to a PRD section.
- `aiDocs/context.md` — mission, assumptions, key risks, status timestamp
- `aiDocs/architecture.md` — verified API docs (Gemini, Firebase, Next.js), tech decisions log with alternatives considered
- `aiDocs/changelog.md` — chronicles every update, customer discovery findings, test log references
- `ai/` folder gitignored — working artifacts stay local; only decisions surface to tracked docs

The pipeline: raw notes → `ai/notes/` → key decisions → `aiDocs/changelog.md` → code.

---

### Slide 10 — Structured Logging & Debugging Infrastructure
**Domain:** Casey  
**Time:** 1:15

Show the logger as a real engineering artifact, not an afterthought:

- `src/lib/logger.ts` — emits JSON-parseable entries at every lifecycle boundary: upload request start/success/error, Firestore create/read, feed fetch, form interactions
- Logger is wired to: upload API route, flyers service, feed page, upload form component — full coverage of every user-facing flow
- Log format: `[Scavenger][level] { timestamp, event, details }` — structured, parseable, traceable

Show the test → log → fix cycle:
- `logs/test-20260223-205538.log` — TurbopackInternalError caught → switched to webpack
- `logs/test-20260223-210044.log` — `ENOTFOUND fonts.googleapis.com` caught → removed `next/font`, defined CSS variables locally
- `logs/test-20260223-210144.log` — **lint + build success**

Reference: `scripts/test.sh`, `logs/`

---

### Slide 11 — CLI Test Pipeline & Git Iteration Patterns
**Domain:** Casey  
**Time:** 1:00

**CLI pipeline:** `scripts/test.sh` runs `npm run lint` + `next build --webpack`, auto-saves output to `logs/test-<timestamp>.log`. Reproducible, one-command, artifacts committed to changelog.

**Git hygiene — 7 commits with clear intent:**
- `feat:` prefixes for functional additions
- `chore:` for maintenance (e.g., removing `ai/` from tracking)
- `ai/` folder gitignored — working artifacts never in git history
- No secrets committed; `.env.local` pattern enforced throughout

**Multi-session iteration visible in history:**
- `architecture.md` revised across 3 commits
- PRD extended with Customer Focus, Differentiation, and Failure Criteria sections in a later session
- Logging added as a deliberate infrastructure layer, not scaffolding — wired at every boundary

---

### Slide 12 — Validation Framework: Success, Failure, and Pivots
**Domain:** Jason  
**Time:** 1:00

**Week 7 MVP targets:**

| Metric | Target | What It Proves |
|---|---|---|
| Posts per week | 30+ | Supply-side activation |
| Unique visitors | 150+ | Demand-side awareness |
| Weekly repeat users | 25% | ⭐ North Star — product has value |
| "Ghost chase" rate | <5% | Data accuracy / trust |
| Organic posts | 5+ | User evangelism |

**Named failure triggers with documented responses:**
- <10 posts/week by Week 5 → targeted club outreach, incentive experiment
- >10% ghost-chase rate → tighten human verification, add "report inaccurate"
- <15% repeat usage after Week 4 → improve CTA, partner with RAs

**Week 5 alpha gate:** 70%+ of testers must say "yes, I would use this regularly" — hard go/no-go.

---

### Slide 13 — Path to Greenlight: Next Steps & Ask
**Domain:** Both  
**Time:** 1:00

Three-week sprint to alpha, framed as a greenlight decision:

1. **This week:** Second customer interview (non-Marriott club) — confirms or isolates the Tanner flyer finding. Log in `ai/notes/week1-club-interviews.md`.
2. **Week 2:** Wire Gemini extraction to upload API. Build confirmation form. The demo becomes real.
3. **Week 3:** Add "Mark as Gone" + `onSnapshot` real-time listener. Core "flyer → feed → gone" pipeline complete.
4. **Week 4–5:** Deploy to Vercel, recruit 5–10 alpha testers, seed 10–15 real events.
5. **Week 5 gate:** 70%+ satisfaction → proceed to public launch. If not → pivot on documented triggers.

**The ask:** Green-light the next build sprint. The process is in place. The first validation finding is honest and actionable. The architecture is ready for the core feature.

---

## Notes for Delivery

- **Slides 5 + 6 are the heart of the pitch.** The Kendall interview makes this a *validation* pitch, not a *planning* pitch. Spend the most energy here.
- **Slide 6 should be delivered with confidence, not apology.** A hypothesis under pressure is evidence the process is working — not evidence of failure.
- **For the live demo** (if shown): open the feed page and upload page. Do not promise real-time AI parsing — describe it as the next integration milestone.
- **Run `bash scripts/test.sh` before the presentation** and cite the log filename on Slide 10.
- **Have `ai/notes/week1-club-interviews.md` open** in a tab in case graders want to see the raw notes.
