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

### What We're Building (MVP - 2-3 Weeks)
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

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 (React) | Mobile-first, SSR, fast dev |
| **Backend** | Next.js API routes | Serverless, simple |
| **Database** | Firestore | Real-time sync, no WebSocket logic |
| **AI/ML** | Gemini 2.0 Flash | 30x cheaper, 6x faster than GPT-4o |
| **Hosting** | Vercel | Zero DevOps, free tier |
| **Storage** | Firebase Storage | Scalable image hosting |

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

### Phase 0: Planning (Complete)
- ✅ Market research
- ✅ PRD & MVP spec
- ✅ Technical architecture
- ✅ Git setup

### Phase 1: MVP Build (Weeks 1-3)
- Week 1: Project setup, design mockups, seed data
- Week 2: Frontend (feed + upload form)
- Week 3: Gemini API integration, deploy, test

### Phase 2: Alpha Test (Weeks 4-5)
- Recruit 5-10 alpha testers
- Manual seed data (team posts real events)
- Collect feedback, fix critical bugs

### Phase 3: Public Launch (Week 6+)
- Launch to BYU students (social media, ward groups)
- Monitor usage, iterate on feedback
- Recruit design partner clubs

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

- **Market Research:** `ai/guides/food-finder-market-research.md`
- **Gemini Pro Research:** `ai/guides/external/marketResearch_gemini.md`
- **PRD:** `aiDocs/prd.md`
- **MVP Spec:** `aiDocs/mvp.md`
- **GitHub:** https://github.com/avareesew/food_finder

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

1. Read this context document first
2. Review the PRD (`aiDocs/prd.md`) for detailed requirements
3. Check the MVP spec (`aiDocs/mvp.md`) for current build scope
4. Follow the coding style guide (`aiDocs/coding-style.md`)
5. Log significant changes in `aiDocs/changelog.md`

---

## 📞 Contact & Resources

- **Product Lead:** Ava Williams
- **GitHub Repo:** https://github.com/avareesew/food_finder
- **Project Folder:** `/Users/avawilliams/projects/food_finder`

---

**This document is the source of truth for project context. Update it as the project evolves.**
