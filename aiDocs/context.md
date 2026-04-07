# Food Finder: Campus Food Discovery Platform - Project Context

**Last Updated:** April 6, 2026
**Project Status:** Active Development — Final Sprint (April 1–8)
**Current Phase:** Customer Validation + Demo Build (pre-presentation)

---

## Project Mission

**Make invisible campus food discoverable in real-time.**

Food Finder is a mobile-first web platform that solves the "Dark Data" problem: free food from club events, department meetings, and campus activities goes to waste because students don't know it exists. We use AI-powered flyer parsing to make ephemeral food events searchable and discoverable.

---

## Target Market

- **Primary:** BYU Campus (pilot, ~33,000 students)
- **Secondary:** Multi-campus expansion after PMF validation
- **Users:** 41% of college students experience food insecurity

---

## Core Value Proposition

### For Students (Demand Side)
- Never miss free food on campus
- Real-time feed of current/upcoming food events
- Stigma-free, anonymous browsing (no login required)

### For Club Organizers (Supply Side)
- Increase event attendance via food discovery
- Reduce waste guilt (food gets eaten, not thrown away)
- Federal liability protection (2023 Food Donation Improvement Act)

### For Universities (B2B Long-Term)
- Quantifiable sustainability metrics (meals saved, CO2 avoided)
- Student retention support (food security → graduation rates)
- Catering optimization data

---

## Product Status (as of April 1, 2026)

### What's Built and Working
- **Flyer Upload & AI Extraction** — Full pipeline: photo → OpenAI gpt-4o-mini extraction → validation → Firestore storage
- **Gemini 2.0 Flash** available as secondary extraction path via `/api/flyers/[flyerId]/extract`
- **Feed Page** — Grid of event cards with responsive layout, mock data fallback
- **Event Detail View** — Full event page with flyer image, status badges, location, host, food details
- **Event Detail Modal** — Inline modal for quick event preview
- **Home Page** — Hero section, weekly event calendar, discover preview, campus map CTA, testimonials
- **Explore Page** — Campus buildings explorer with interactive grid and week navigation
- **About Page** — Mission, problem statement, how it works, values
- **Upload Page** — Drag-and-drop upload with extraction results and recent uploads list
- **Dark Mode** — Toggle with persistent theme
- **Campus Building Data** — BYU building database with lat/lng, aliases, building code matching
- **Dual Backend Mode** — Firebase (production) and local filesystem (development) via `NEXT_PUBLIC_BACKEND_MODE`
- **Extraction Validation** — Auto-rejects flyers missing date, time, or place
- **Event Timing Utilities** — Campus timezone handling, date coercion, expiry detection, 12h formatting

### What's NOT Built Yet (Needed Before Alpha)
- **"Mark as Gone" UI** — Status field exists in data model but no user-facing toggle
- **Real-time sync** — Using `getDocs` polling, not `onSnapshot` listeners
- **Confirmation/Edit Form** — Users can't edit AI-extracted data before submission
- **Vercel deployment** — Not confirmed live in production

### What's Next (Phase 2+)
- Alpha testing with 5-10 real users
- "Gone" button for status updates
- Real-time Firestore listeners
- User edit form for AI extractions
- Slack bot integration (automated ingestion)
- Email forwarding parser

---

## Technical Stack (Actual)

See `aiDocs/architecture.md` for complete technical architecture.

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI** | React + Tailwind CSS | React 19, Tailwind 4 |
| **Database** | Firestore (Firebase) | firebase 12.9.0 |
| **Server SDK** | Firebase Admin | 13.7.0 |
| **AI (Primary)** | OpenAI gpt-4o-mini | Responses API (raw fetch) |
| **AI (Secondary)** | Gemini 2.0 Flash | @google/generative-ai 0.24.1 |
| **Maps** | Leaflet | 1.9.4 |
| **Dates** | date-fns | 4.1.0 |
| **Hosting** | Vercel (planned) | — |
| **Storage** | Firebase Storage (prod) / local filesystem (dev) | — |

---

## Design Principles

1. **Mobile-First:** 80%+ of users will browse on phones
2. **Zero Friction:** No accounts, no login, no applications
3. **Stigma-Free:** Treat browsing like Instagram, not applying for aid
4. **Accuracy Over Speed:** Validation pipeline prevents "ghost chases"
5. **Trust Through Transparency:** Legal disclaimers, clear ToS

---

## Success Metrics (MVP - Week 7)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Posts per Week | 30+ | Proves supply-side activation |
| Unique Visitors | 150+ | Proves demand-side awareness |
| Repeat Users | 25% | North Star: product has value |
| "Ghost Chase" Rate | <5% | Proves data accuracy/trust |
| Organic Posts | 5+ | Proves user evangelism |

---

## Reproducible Testing & Structured Logs

- Run `scripts/test.sh` locally to lint and build while automatically piping the structured output into `logs/test-<timestamp>.log`. The logger helper in `src/lib/logger.ts` ensures API routes and UI interactions emit parseable events.
- Store the log path and key observations in `aiDocs/changelog.md` so team can trace a test → log → fix cycle for uploads/feeds.

---

## Strategic Positioning

**We are NOT:**
- A food pantry (we're not institutional charity)
- A marketplace (we're not facilitating transactions)
- A restaurant surplus app (we're campus-specific)

**We ARE:**
- **The "Bloomberg Terminal for Campus Food"** — single source of truth
- **A data visibility platform** — solving information gaps, not supply gaps
- **A waste-reduction tool** — helping orgs meet sustainability goals

**Competitive Moat:**
- Dual AI extraction (OpenAI + Gemini) with validation pipeline
- 2023 FDIA legal shield (liability protection)
- BYU cultural fit (service-oriented, high trust)

---

## Team & Roles

**Core Team:** BYU Student Team (3 people)
- Product Lead: Ava Williams
- Tech Lead: [TBD]
- Designer: [TBD]

**Advisors:** [TBD]

---

## Timeline & Progress

### Phase 0: Setup & Validation (Week 1) — COMPLETE
- Market research, PRD, MVP spec, architecture
- Firebase + Next.js initialized
- 2 club president interviews (Kendall Castellaw, Carson Fellows) — `ai/notes/2026-02-24-round1-club-interviews.md`
- AI extraction validated (OpenAI gpt-4o-mini)

### Phase 1: Core Development (Weeks 2-4) — SUBSTANTIALLY COMPLETE
- Upload + AI extraction pipeline: DONE
- Feed + event cards + detail views: DONE
- Home page, explore page, about page: DONE (beyond original scope)
- Dark mode, campus maps, weekly calendar: DONE (beyond original scope)
- "Mark as gone" UI: NOT DONE
- Real-time `onSnapshot`: NOT DONE
- Confirmation/edit form: NOT DONE

### Final Sprint: Customer Validation (April 1–8) — IN PROGRESS
- 2 Round 2 interviews complete (Michael Nichols, Sales Society; Molly Wakefield, Finance Society VP) — `ai/notes/2026-04-06-round2-club-interviews.md`
- Key finding: automation rated 9.5/10 avg; professionalism tension confirmed; sub-associations as early adopters identified
- Falsification tests and demo build in progress

### Phase 2: Alpha Testing (Week 5) — NOT STARTED
- Recruit 5-10 alpha testers
- Deploy to production
- Seed 10-15 real events
- Collect feedback

### Phase 3: Beta & Polish (Week 6) — NOT STARTED
### Phase 4: Public Launch (Week 7) — NOT STARTED

---

## Assumptions Validated

1. **BYU clubs print physical flyers** — FALSIFIED (pivoted)
   - Tanner/Marriott Building prohibits flyers by policy
   - Round 2 clubs (Sales Society, Finance Society) rely entirely on email + Instagram
   - Pivot confirmed: email/text ingestion is the primary input path, not flyer scanning

2. **Students will browse without logging in** — ASSUMED (pending alpha validation)

3. **AI extraction accuracy** — VALIDATED
   - OpenAI gpt-4o-mini works well with structured JSON extraction
   - Validation pipeline catches missing date/time/place
   - Date coercion handles AI mistakes (wrong year, varied formats)

4. **Organizers will mark food as "Gone"** — UNTESTED (UI not built yet)

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| AI extraction errors | High | Validation pipeline auto-rejects bad extractions; need user edit form | Partially mitigated |
| Stale data ("ghost chases") | High | Need "Mark as gone" UI + auto-expiration | Open risk |
| Low supply-side adoption | High | Manual seed data + recruitment framing (not waste reduction) | Monitoring |
| Swarm effect (over-attendance) | Medium | "Estimated portions" field + sustainability messaging | Low priority |

---

## Repository Structure (Actual)

```
food_finder/
├── aiDocs/                    # TRACKED: Product documentation
│   ├── context.md             # This file - project overview
│   ├── prd.md                 # Product Requirements Document
│   ├── mvp.md                 # MVP Demo Specification
│   ├── architecture.md        # System architecture details
│   ├── coding-style.md        # Code style guide
│   └── changelog.md           # Concise change history
├── ai/                        # GITIGNORED: Working artifacts
│   ├── guides/                # Library docs, research output
│   ├── roadmaps/              # Task checklists, plans, tracker
│   └── notes/                 # Interviews, brainstorming
├── src/
│   ├── app/                   # Next.js App Router pages + API routes
│   │   ├── page.tsx           # Home (hero, calendar, discover preview)
│   │   ├── feed/page.tsx      # Event feed (card grid)
│   │   ├── upload/page.tsx    # Flyer upload
│   │   ├── events/[id]/       # Event detail view
│   │   ├── explore/page.tsx   # Campus buildings explorer
│   │   ├── about/page.tsx     # About/mission page
│   │   └── api/               # API routes
│   │       ├── events/        # Published events CRUD
│   │       ├── flyers/        # Flyer metadata + extraction
│   │       ├── upload/        # File upload + processing
│   │       └── local/         # Local dev mode endpoints
│   ├── backend/               # Server-side logic
│   │   ├── openai/            # OpenAI extraction (primary)
│   │   ├── gemini/            # Gemini extraction (secondary)
│   │   ├── flyers/            # Flyer processing pipeline
│   │   └── local/             # Local filesystem storage
│   ├── components/            # React components
│   │   ├── ui/                # EventCard, LocalEventCard, EventDetailModal, etc.
│   │   ├── home/              # WeeklyEventCalendar
│   │   ├── layout/            # Navbar
│   │   └── ...                # CampusMap, UploadForm, ThemeToggle, etc.
│   ├── lib/                   # Utilities (firebase, eventTiming, validation, etc.)
│   ├── hooks/                 # React hooks (useHtmlDarkClass)
│   ├── data/                  # Static data (byuBuildings)
│   └── services/              # Firestore service layer (flyers)
├── data/                      # Local mode storage (events.json, uploads/)
├── public/                    # Static assets + cached images
└── scripts/                   # CLI scripts (test.sh)
```

---

## Key Reference Documents

- **Architecture:** `aiDocs/architecture.md` (tech stack, API endpoints, data models)
- **PRD:** `aiDocs/prd.md` (product requirements)
- **MVP Spec:** `aiDocs/mvp.md` (demo build plan)
- **Coding Style:** `aiDocs/coding-style.md` (code standards)
- **Roadmap Tracker:** `ai/roadmaps/roadmap-tracker.md` (progress tracking)
- **Market Research:** `ai/guides/food-finder-market-research.md`
- **GitHub:** https://github.com/avareesew/food_finder

---
## Behavior

-  Whenever creating plan docs and roadmap docs, always save them in ai/roadmaps. prefix the name with the date. add a note that we need to avoid over-engineering, cruft, and leagcy compatibility features in this clean code project
- Whenever finishing with implementing a plan / roadmap doc pair, make sure hte roadmap is up to date (tasks checked off, etc.) Then move the docs to ai/roadmaps/complete. Then update ai/changelog.md accordingly.

---

## Key Learnings

### Market Research
1. **41% of college students experience food insecurity** (8M+ students nationally)
2. **2023 Food Donation Improvement Act** removes liability for student-to-student sharing
3. **Stigma is the #1 barrier** to food pantry utilization (40% at Belmont)

### Customer Discovery
1. **Recruitment framing > waste reduction** — clubs want more attendees, not guilt relief
2. **Liability is a non-issue** — confirmed independently across 4 club interviews
3. **Leftover supply is lower than expected** — feed should surface during-event food, not just scraps
4. **Flyer density varies by building** — Tanner is flyer-free; other buildings still use them
5. **Automation is the #1 supply-side unlock** — avg 9.5/10 rating across Round 2 interviews (Sales Society 10/10, Finance Society 9/10); zero-effort ingestion from official channels is the reason club leaders adopt
6. **Professionalism tension is real** — both Round 2 clubs independently raised concern about "food hunters"; Marriott School "professional manners" initiative adds institutional pressure; product needs an "Expectations" / "Requirements" field on event pins
7. **Sub-associations are the highest-value early adopter segment** — smaller budgets, higher food frequency, less marketing bandwidth; mentioned independently by both Round 2 interviewees
8. **Slack is not universal** — Finance Society explicitly does not use Slack; email ingestion must be a first-class path

### Technical
1. **OpenAI gpt-4o-mini works well** as primary extractor; Gemini available as backup
2. **Dual backend mode** (Firebase vs local) is valuable for dev velocity
3. **AI date output is messy** — needed coercion for wrong years, varied formats
4. **Building matching needs fuzzy logic** — AI outputs free-text locations, not building codes

---

## Elevator Pitch (30 Seconds)

> "You know how free food gets posted on flyers around campus, but you never see them? Food Finder uses AI to read those flyers automatically and shows you a real-time feed of every free meal happening this week. It's like Instagram, but for free pizza. We're solving the fact that 41% of students are food insecure while thousands of pounds of perfectly good leftovers get thrown away daily."

---

## Contact & Resources

- **Product Lead:** Ava Williams
- **GitHub Repo:** https://github.com/avareesew/food_finder
- **Project Folder:** `/Users/avawilliams/projects/food_finder`

---

**This document is the source of truth for project context. Update it as the project evolves.**
