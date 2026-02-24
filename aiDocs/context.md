# Scavenger: Campus Food Finder - Project Context

**Last Updated:** February 16, 2026  
**Project Status:** Planning/Pre-Development  
**Current Phase:** MVP Definition & Technical Setup

---

## 🎯 Project Mission

**Make invisible campus food discoverable in real-time.**

Scavenger is a mobile-first web platform that solves the "Dark Data" problem: thousands of pounds of free food from club events, department meetings, and campus activities go to waste daily because students don't know it exists. We use AI-powered flyer parsing (Gemini 2.0 Flash) to make ephemeral food events searchable and discoverable.

---

## 🏫 Target Market

- **Primary:** BYU Campus (pilot, ~33,000 students)
- **Secondary:** Multi-campus expansion after PMF validation
- **Users:** 41% of college students experience food insecurity

---

## 💡 Core Value Proposition

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

## 🚀 Product Status

### What We Have
- ✅ Market research (41% food insecurity rate, legal framework, competitive analysis)
- ✅ PRD (Product Requirements Document)
- ✅ MVP specification (demo-focused build)
- ✅ Technical architecture defined
- ✅ Git repository initialized and pushed to GitHub

### What We're Building (7-Week MVP Sprint, Core Development in Weeks 2-4)
1. **Flyer Upload & AI Extraction**
   - Photo → Gemini 2.0 Flash API → Structured data
   - Human-in-the-loop confirmation (prevents errors)
   
2. **Real-Time Feed**
   - Mobile-first web interface
   - Chronological list of food events this week
   - Location, time, food type displayed clearly

3. **Demo-Ready Prototype**
   - Prove the concept works
   - Validate technical feasibility
   - Show to 5+ people for feedback

### What's Next (Phase 2)
- "Gone" button for status updates
- Slack bot integration (automated ingestion)
- Email forwarding parser
- Gamification for data integrity
- Multi-building filtering

---

## 🛠️ Technical Stack

See `aiDocs/architecture.md` for complete technical architecture and setup instructions.

**Summary:**
- Frontend: Next.js 14 (App Router) + React + Tailwind CSS
- Backend: Next.js API routes (serverless)
- Database: Firestore (real-time NoSQL)
- AI/ML: Gemini 2.0 Flash (vision + JSON extraction)
- Hosting: Vercel (zero-config deployment)
- Storage: Firebase Storage (images)

**All APIs verified with official documentation. See architecture doc for setup guide.**

---

## 🎨 Design Principles

1. **Mobile-First:** 80%+ of users will browse on phones
2. **Zero Friction:** No accounts, no login, no applications
3. **Stigma-Free:** Treat browsing like Instagram, not applying for aid
4. **Accuracy Over Speed:** Human verification prevents "ghost chases"
5. **Trust Through Transparency:** Legal disclaimers, clear ToS

---

## 📊 Success Metrics (MVP - Week 7)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Posts per Week | 30+ | Proves supply-side activation |
| Unique Visitors | 150+ | Proves demand-side awareness |
| Repeat Users | 25% | North Star: product has value |
| "Ghost Chase" Rate | <5% | Proves data accuracy/trust |
| Organic Posts | 5+ | Proves user evangelism |

---

## 🔍 Reproducible Testing & Structured Logs

- Run `scripts/test.sh` locally to lint and build while automatically piping the structured output into `logs/test-<timestamp>.log`. The logger helper in `src/lib/logger.ts` ensures API routes and UI interactions emit parseable events.
- Store the log path and key observations in `aiDocs/changelog.md` so Casey can trace a test → log → fix cycle for uploads/feeds.

---

## 🧭 Strategic Positioning

**We are NOT:**
- A food pantry (we're not institutional charity)
- A marketplace (we're not facilitating transactions)
- A restaurant surplus app (we're campus-specific)

**We ARE:**
- **The "Bloomberg Terminal for Campus Food"** — single source of truth
- **A data visibility platform** — solving information gaps, not supply gaps
- **A waste-reduction tool** — helping orgs meet sustainability goals

**Competitive Moat:**
- Gemini 2.0 Flash AI (30x cost advantage)
- 2023 FDIA legal shield (liability protection)
- BYU cultural fit (service-oriented, high trust)

---

## 👥 Team & Roles

**Core Team:** BYU Student Team (3 people)
- Product Lead: Ava Williams
- Tech Lead: [TBD]
- Designer: [TBD]

**Advisors:** [TBD]

---

## 🗓️ Timeline

### Phase 0: Setup & Validation (Week 1) - Complete
- ✅ Market research
- ✅ PRD & MVP spec
- ✅ Technical architecture
- ✅ Git setup
- ✅ Detailed implementation roadmaps

### Phase 1: Core Development (Weeks 2-4)
- Week 2: Design phase + Upload & AI extraction flow
- Week 3: Real-time feed implementation
- Week 4: Status management + UI polish
- **Checkpoint:** Core "flyer → feed → gone" pipeline works end-to-end

**Note:** "Core development" is Weeks 2-4 within the full 7-week MVP sprint. Total time to public launch is 7 weeks including setup, testing, and iteration.

### Phase 2: Alpha Testing (Week 5)
- Recruit 5-10 alpha testers
- Manual seed data (team posts real events)
- Collect feedback, fix critical bugs
- **Critical Metric:** 70%+ of alpha testers say "yes, I would use this regularly"
- **Checkpoint:** Did we hit 70% satisfaction? What needs fixing?

### Phase 3: Beta & Polish (Week 6)
- Fix alpha issues
- Expand to 30-50 users
- Recruit 3-5 design partner clubs
- Platform stability and UX improvements
- **Checkpoint:** Is the platform stable and ready for public launch?

### Phase 4: Public Launch (Week 7)
- Launch to all BYU students (social media, ward groups)
- Monitor usage, iterate on feedback
- Hit MVP success metrics (30+ posts, 150+ visitors, 25% repeat, <5% ghost chase, 5+ organic)
- **Checkpoint:** Did we achieve product-market fit signals?

---

## 🔒 Key Assumptions to Validate

1. **BYU clubs print physical flyers** (70%+ of events)
   - Validation: Walk campus Week 1, count flyers, interview clubs
   
2. **Students will browse without logging in**
   - Validation: Alpha test feedback
   
3. **Gemini 2.0 Flash accuracy on BYU flyers** (80%+ correct)
   - Validation: Test with 20-30 real flyers Week 1
   
4. **Organizers will mark food as "Gone"**
   - Validation: Track button usage in alpha

---

## 🚨 Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI extraction errors | High | Human verification step before posting |
| Stale data ("ghost chases") | High | "Gone" button + auto-expiration |
| Low supply-side adoption | High | Manual seed data + 3-5 design partner clubs |
| Swarm effect (over-attendance) | Medium | "Estimated portions" field + sustainability messaging |

---

## 📁 Repository Structure

```
project-root/
├── aiDocs/                # TRACKED: Product documentation
│   ├── context.md         # This file - project overview
│   ├── prd.md             # Product Requirements Document
│   ├── mvp.md             # MVP Demo Specification
│   ├── architecture.md    # System architecture details
│   ├── coding-style.md    # Code style guide
│   └── changelog.md       # Concise change history
├── ai/                    # GITIGNORED: Working artifacts
│   ├── guides/            # Library docs, research output
│   ├── roadmaps/          # Task checklists, plans
│   └── notes/             # Brainstorming
├── src/                   # Application code (TBD)
├── public/                # Static assets (TBD)
└── scripts/               # CLI scripts
```

---

## 📚 Key Reference Documents

- **Architecture:** `aiDocs/architecture.md` ⭐ (complete tech stack, setup guide, verified APIs)
- **PRD:** `aiDocs/prd.md` (product requirements)
- **MVP Spec:** `aiDocs/mvp.md` (demo build plan)
- **Coding Style:** `aiDocs/coding-style.md` (code standards)
- **Market Research:** `ai/guides/food-finder-market-research.md`
- **API Docs:** `ai/guides/` (verified Gemini, Firebase, Next.js documentation)
- **GitHub:** https://github.com/avareesew/food_finder

---
## Behavior

-  Whenever creating plan docs and roadmap docs, always save them in ai/roadmaps. prefix the name with the date. add a note that we need to avoid over-engineering, cruft, and leagcy compatibility features in this clean code project
- Whenever finishing with implementing a plan / roadmap doc pair, make sure hte roadmap is up to date (tasks checked off, etc.) Then move the docs to ai/roadmaps/complete. Then update ai/changelog.md accordingly. 

---

## 🎓 Key Learnings (Market Research)

1. **41% of college students experience food insecurity** (8M+ students nationally)
2. **Gemini 2.0 Flash is 30x cheaper** than GPT-4o for document parsing
3. **2023 Food Donation Improvement Act** removes liability for student-to-student sharing
4. **Stigma is the #1 barrier** to food pantry utilization (40% at Belmont)
5. **Gamification can reduce waste by 45%** (data integrity strategy)

---

## 💬 Elevator Pitch (30 Seconds)

> "You know how free food gets posted on flyers around campus, but you never see them? Scavenger uses AI to read those flyers automatically and shows you a real-time feed of every free meal happening this week. It's like Instagram, but for free pizza. We're solving the fact that 41% of students are food insecure while thousands of pounds of perfectly good leftovers get thrown away daily."

---

## 🤝 How to Contribute

1. **Read this context document first** (project overview)
2. **Review architecture** (`aiDocs/architecture.md`) for technical setup
3. **Check PRD** (`aiDocs/prd.md`) for detailed requirements
4. **Check MVP spec** (`aiDocs/mvp.md`) for current build scope
5. **Follow coding style** (`aiDocs/coding-style.md`)
6. **Log changes** in `aiDocs/changelog.md`

---

## 📞 Contact & Resources

- **Product Lead:** Ava Williams
- **GitHub Repo:** https://github.com/avareesew/food_finder
- **Project Folder:** `/Users/avawilliams/projects/food_finder`

---

**This document is the source of truth for project context. Update it as the project evolves.**
