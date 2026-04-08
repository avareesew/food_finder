# Scavenger: Campus Food Discovery Platform — Project Context

**Last Updated:** April 7, 2026
**Project Status:** Active Development — Final Sprint (Presentations April 8, 13, 15)
**Current Phase:** Demo Build + Presentation Prep

---

## Project Mission

**Make invisible campus food discoverable in real-time.**

Scavenger is a mobile-first web platform that solves the information gap between clubs hosting food events and students who want to attend. Club leaders post food events to their official Slack or email channels; Scavenger automatically ingests those posts via AI text extraction and pins them to a live campus map and feed. Students browse anonymously — no login required.

**Why clubs adopt:** Zero-effort ingestion from channels they already use. Automation rated 9.7/10 avg across Round 2 interviews.
**Why students use:** Real-time feed of free food with no sign-up, no stigma.

---

## Target Market

- **Primary:** BYU Provo campus (~33,000 students)
- **Supply side:** Club presidents and sub-association leaders who host food events
- **Demand side:** Students who want to discover free food on campus
- **Best early adopters:** Sub-associations (smaller budgets, higher food frequency, less marketing bandwidth)

---

## Core Value Proposition

### For Students (Demand Side)
- Never miss free food on campus
- Real-time feed of current/upcoming food events
- Stigma-free, anonymous browsing (no login required)

### For Club Leaders (Supply Side)
- Increase event attendance via food discovery
- Zero-effort posting — Scavenger reads their existing Slack/email channels
- Automation eliminates manual cross-posting

---

## Product Status (as of April 6, 2026)

### What's Built and Working
- **Gmail Ingestion Pipeline** — Cron-triggered (`/api/cron/gmail-ingest`), reads getscavenger@gmail.com inbox via OAuth2, extracts events from plain-text emails and image attachments, deduplication via `gmailIngestMarks` collection
- **Slack Ingestion Pipeline** — Cron-triggered + real-time Events API (`/api/slack/events`), reads official club channels, image + text messages, deduplication, multi-workspace
- **Manual Flyer Upload** — Drag-and-drop upload with OpenAI gpt-4o-mini vision extraction, Firebase Storage + Firestore write
- **Feed Page** — Grid of event cards with responsive layout, Firebase + local modes
- **Weekly Event Calendar** — 7-day week grid with event dots, day selector, week navigation
- **Explore Page** — Campus buildings explorer with interactive Leaflet map, per-building event counts
- **Event Detail View** — Full event page with flyer image, status badges, location, host, food details
- **Home Page** — Hero section, weekly calendar, discover preview, campus map CTA
- **Auth System** — Firebase Auth with BYU email enforcement, canUpload permission gate, admin toggle
- **Branded Password Reset** — Custom `/auth/action` page rewrites Firebase reset links to stay on app domain (`firebaseEmailActionLinks.ts`)
- **Slack Events API** — Real-time message ingestion via `POST /api/slack/events` with signature verification
- **Dark Mode** — System-preference detection, toggle with persistent theme
- **Dual Backend Mode** — Firebase (production) and local filesystem (development) via `NEXT_PUBLIC_BACKEND_MODE`
- **Structured Logging** — JSON-structured logger integrated into all API routes and backend pipeline
- **CLI Test Scripts** — `scripts/test.sh` (lint + build) and `scripts/test-slack-ingest.sh` (pipeline test)

### Pre-Alpha Blockers (Not Yet Built)
- **"Mark as Gone" UI** — Status field exists in data model but no user-facing toggle
- **Real-time sync** — Using `getDocs` polling, not `onSnapshot` listeners
- **Confirmation/Edit Form** — Users can't edit AI-extracted data before submission

---

## Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI** | React + Tailwind CSS | React 19, Tailwind 4 |
| **Database** | Firestore (Firebase) | firebase 12.9.0 |
| **Server SDK** | Firebase Admin | 13.7.0 |
| **AI (Primary)** | OpenAI gpt-4o-mini | Responses API (raw fetch) |
| **AI (Secondary)** | Gemini 2.0 Flash | @google/generative-ai 0.24.1 |
| **Maps** | Leaflet | 1.9.4 |
| **Hosting** | Vercel | Live (food-finder-avareesew-5233s-projects.vercel.app) |

See `aiDocs/architecture.md` for complete technical architecture.

---

## Design Principles

1. **Mobile-First:** 80%+ of users will browse on phones
2. **Zero Friction:** No accounts, no login, no applications for browsing
3. **Stigma-Free:** Treat browsing like Instagram, not applying for aid
4. **Accuracy Over Speed:** Validation pipeline prevents "ghost chases"
5. **Automation Over Manual:** Supply side won't post if it takes effort

---

## Assumptions Validated

1. **Flyer scanning as primary input** — **FALSIFIED** (pivoted). All 5 club interviews confirm email/Slack are primary channels, not physical flyers. Tanner/Marriott Building prohibits flyers by policy.
2. **Automation is the #1 supply-side unlock** — **VALIDATED** at 9.7/10 average across Round 2 interviews (Sales Society 10/10, Finance Society 9/10, Women of Accountancy 10/10).
3. **Recruitment framing > waste reduction** — **VALIDATED** across all 5 interviews. Clubs want more attendees, not guilt relief.
4. **Sub-associations are the best early adopters** — **VALIDATED** independently by 2/3 Round 2 interviewees.
5. **AI extraction accuracy** — **VALIDATED**. OpenAI gpt-4o-mini handles structured JSON extraction well with validation pipeline.
6. **Professionalism tension** — **CONFIRMED** by 2/3 Round 2 clubs. Product needs "Requirements" field on event pins.

---

## Team

- **Ava Williams** — Product Lead
- **Ryan Tetro** — Technical Lead
- **Allie Marshall** — Design & Research
- **Eddy Gonzales** — Engineering

---

## Reproducible Testing & Structured Logs

- Run `scripts/test.sh` to lint and build while piping structured output into `logs/test-<timestamp>.log`.
- Run `scripts/test-slack-ingest.sh` to test the Slack ingestion pipeline against local dev.
- The logger helper in `src/lib/logger.ts` emits `[Scavenger][level] {JSON}` entries from all API routes and backend pipeline files.
- Store the log path and key observations in `aiDocs/changelog.md` for the test → log → fix cycle.

---

## Key Reference Documents (Bookshelf)

- **`aiDocs/prd.md`** — Product Requirements Document (v2.0, post-pivot). Comprehensive: personas, competitive landscape, feature specs, assumption table, success metrics. The product anchor.
- **`aiDocs/mvp.md`** — MVP Demo Specification (v2.0). Defines the concrete, scope-constrained deliverable for the April 8 demo. Includes step-by-step demo flow and prep checklist.
- **`aiDocs/architecture.md`** — System Architecture (v2.1). Full tech stack, file structure, API endpoints with request/response shapes, all Firestore data models, data flow diagrams, environment variables.
- **`aiDocs/coding-style.md`** — Code Style Guide. TypeScript conventions, React patterns, Tailwind usage, error handling, commit message format. Aligned with CLAUDE.md code principles.
- **`aiDocs/changelog.md`** — Change history from v0.1.0 (project foundation) through v0.4.0 (documentation cleanup + Round 2 interviews). Includes test-log-fix evidence.
- **`ai/roadmaps/2026-04-06-current-roadmap.md`** — Single active roadmap with status indicators. Phase 0 complete, Phase 1 substantially complete, Final Sprint in progress.
- **`ai/notes/interviews/2026-04-06-round2-club-interviews.md`** — Round 2 customer interviews (3 clubs). Key validation: automation 9.7/10, professionalism tension, sub-associations as early adopters.
- **`ai/notes/interviews/2026-02-24-round1-club-interviews.md`** — Round 1 interviews (2 clubs). Flyer falsification, recruitment framing discovery.
- **`CLAUDE.md`** — AI behavioral guidance. Code principles, tech stack reference, ingestion priority, pre-alpha blockers.
- **GitHub:** https://github.com/avareesew/food_finder

---

**This document is the orientation point for new AI sessions. Update it as the project evolves.**
