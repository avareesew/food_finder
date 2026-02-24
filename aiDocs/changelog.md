# Changelog: Scavenger Platform

**Format:** Keep entries concise. Link to commits when relevant.  
**Audience:** Team members and future contributors

---

## [Unreleased]

### In Progress
- Created `ai/roadmaps/phase-2-through-4-checklist.md` to track roadmap tasks + status for Phase 2/3/4 work items.
- Added `src/lib/logger.ts` and wired structured logging through the upload API, Firestore services, feed page, and upload form so debuggable events are emitted during every flow.
- Extended `scripts/test.sh` to lint/build, pipe output into `logs/test-<timestamp>.log`, and documented how to replay the structured logs in `aiDocs/context.md`.
- Expanded `aiDocs/prd.md` with Customer Focus, Differentiation, and Success/Failure Criteria sections to show Jason our due diligence, metrics, and pivot plans.
- Drafted the customer interaction plan (below) so we can capture at least five touchpoints or falsification experiments and log the learnings in the changelog once complete.

### Customer Touchpoints (Planned)
- Interview/ride-along with RA Marcus (Heritage Halls) to validate sustainability messaging and interest in raising floors’ awareness.
- Chat with club recruiter Sarah (Marketing Club) to see how leftover catering is currently handled and confirm the legal/procedural blockers.
- Survey 5+ hungry students in the JFSB or library (Hungry Hustler persona) about their current food discovery channels and willingness to use a feed.
- Interview a campus sustainability advocate about measurable waste metrics to feed into our success criteria dashboards.
- Run a falsifiability check by asking 5 random students whether they would post leftovers anonymously and capturing yes/no plus rationale.

### Testing & Logs
- `bash scripts/test.sh` now runs lint + `next build --webpack`, pipes structured output into `logs/test-<timestamp>.log`, and is referenced in `aiDocs/context.md` for reproducing the test-log-fix loop.
- `logs/test-20260223-205538.log` captured the first failure (TurbopackInternalError: creating new process / binding to a port) so we could justify moving to webpack builds.
- `logs/test-20260223-210044.log` captured the `getaddrinfo ENOTFOUND fonts.googleapis.com` errors from the webpack run; the fix was removing the `next/font` imports and defining font CSS variables locally.
- `logs/test-20260223-210144.log` proves the updated pipeline succeeded (lint + webpack build), so we can show Casey the structured logs plus the CLI commands that produced them.

---

## [0.1.0] - 2026-02-16

### Added - Project Foundation
- ✅ Initial project structure and git repository
- ✅ Comprehensive market research analysis (41% food insecurity rate, competitive landscape)
- ✅ Product Requirements Document (PRD) with user personas and success metrics
- ✅ MVP Demo Specification (2-3 week build timeline)
- ✅ System architecture document (Next.js + Firestore + Gemini 2.0 Flash)
- ✅ Coding style guide (TypeScript, React patterns, Tailwind CSS)
- ✅ Project context document (mission, status, tech stack)
- ✅ `.gitignore` configuration for Next.js/Firebase projects
- ✅ GitHub repository initialized at `avareesew/food_finder`

### Documentation Structure
```
aiDocs/           # Tracked in git (source of truth)
├── context.md    # Project overview and status
├── prd.md        # Product requirements
├── mvp.md        # MVP specification
├── architecture.md # Technical architecture
├── coding-style.md # Code standards
└── changelog.md  # This file

ai/               # Gitignored (working artifacts)
├── guides/       # Market research, library docs
├── roadmaps/     # Task lists (to be created)
└── notes/        # Brainstorming (to be created)
```

### Key Decisions
- **BYU Campus as pilot** — Team is on-campus, tight-knit community, service-oriented culture
- **Flyer scanning as MVP focus** — Gemini 2.0 Flash provides 30x cost advantage
- **No user accounts in MVP** — Reduces friction, anonymous browsing
- **Human-in-the-loop AI verification** — Prevents "ghost chase" errors
- **Serverless architecture** — Vercel + Firebase for zero DevOps

### Reference Documents
- Market Research: `ai/guides/food-finder-market-research.md`
- Gemini Research: `ai/guides/external/marketResearch_gemini.md`

---

## Key Metrics (Goals)

### MVP Phase (Week 7 Target)
- 30+ posts per week
- 150+ unique visitors
- <5% "ghost chase" rate
- 25% repeat usage rate
- 5+ organic posts (non-team)

---

## Next Milestones

### Week 1-2: Setup & Validation
- [ ] Initialize Next.js project
- [ ] Set up Firebase/Firestore
- [ ] Obtain Gemini 2.0 Flash API key
- [ ] Validate BYU flyer landscape (photograph 20-30 real flyers)
- [ ] Test AI extraction accuracy (80%+ target)

### Week 3-4: Core Development
- [ ] Build feed UI component
- [ ] Build upload form with image handling
- [ ] Integrate Gemini API for flyer extraction
- [ ] Implement Firestore real-time sync

### Week 5-6: Alpha Testing
- [ ] Deploy to Vercel
- [ ] Recruit 5-10 alpha testers
- [ ] Manual seed data (post real events)
- [ ] Collect feedback and iterate

### Week 7: Public Launch
- [ ] Social media announcement
- [ ] Share in BYU ward groups and clubs
- [ ] Monitor metrics
- [ ] Achieve 30+ posts goal

---

## Version History

- **v0.1.0** (2026-02-16): Project foundation, documentation, planning complete
- **v0.0.0** (2026-02-16): Initial commit

---

**Update this file with every significant change. Keep entries brief but informative.**
