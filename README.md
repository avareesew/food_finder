# Scavenger

**Campus Food Discovery Platform — BYU Pilot**

Scavenger turns club food events into a professional recruitment tool. Club leaders post to their official Slack or email channels — Scavenger automatically ingests those posts and pins them to a live campus map. Students discover free food anonymously, no login required.

---

## Project Status

**Phase:** Final Sprint — Presentations April 8, 13, 15, 2026
**Built:** Core pipeline complete (upload → AI extraction → feed → map)
**In Progress:** Demo polish, presentation slides, club president submission form
**Next:** Alpha testing with sub-association leaders (post-April 8)

---

## Quick Start

```bash
npm install
cp env.example .env.local
# Fill in API keys (see env.example for required vars)
npm run dev
# Open http://localhost:3000
```

### Local Development (No Firebase Required)

Set `NEXT_PUBLIC_BACKEND_MODE=local` in `.env.local` — events stored in `data/events.json`, only `OPENAI_API_KEY` required.

```bash
curl -sS -X POST "http://localhost:3000/api/local/extract" \
  -F "file=@/path/to/flyer.jpg" | jq
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Database | Firestore (Firebase) |
| AI (Primary) | OpenAI gpt-4o-mini via Responses API |
| AI (Secondary) | Gemini 2.0 Flash |
| Maps | Leaflet |
| Auth | Firebase Auth |
| Hosting | Vercel |

---

## How It Works

1. **Club leader** posts a food event to their official Slack channel or email list
2. **Scavenger ingests** the post automatically (or leader can upload a flyer manually)
3. **AI extracts** event details — title, location, time, food type
4. **Map pin appears** — students see it on the live campus map
5. **Student shows up** — finds free food, discovers the club

---

## Project Structure

```
food_finder/
├── CLAUDE.md                  # AI behavioral guidance — start here
├── aiDocs/                    # Product documentation (tracked in git)
│   ├── context.md             # Project overview & status ⭐ START HERE
│   ├── prd.md                 # Product requirements (v2.0 post-pivot)
│   ├── mvp.md                 # What's built + demo flow
│   ├── architecture.md        # Tech stack, API endpoints, data models
│   ├── coding-style.md        # Code standards
│   ├── changelog.md           # Version history
│   └── archived/              # Pre-pivot flyer-era docs
├── ai/                        # Working artifacts (tracked in git)
│   ├── notes/                 # Customer interviews, sprint plans
│   ├── roadmaps/              # Current roadmap + tracker
│   └── guides/                # API docs, market research
├── src/
│   ├── app/                   # Next.js pages + API routes
│   ├── backend/               # Server-side logic (OpenAI, Gemini, Slack, auth)
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── services/              # Firestore service layer
├── env.example                # Required environment variables
└── vercel.json                # Vercel deployment config
```

---

## Key Docs

- **[CLAUDE.md](CLAUDE.md)** — Project context and coding rules
- **[context.md](aiDocs/context.md)** — Full project overview, current status, key learnings
- **[prd.md](aiDocs/prd.md)** — Product requirements (post-pivot)
- **[architecture.md](aiDocs/architecture.md)** — API endpoints, data models, tech decisions
- **[roadmap](ai/roadmaps/2026-04-06-current-roadmap.md)** — Where we are and what's next
- **[Round 2 interviews](ai/notes/interviews/2026-04-06-round2-club-interviews.md)** — Most recent customer research

---

## What We Learned (The Pivot)

Originally built around AI-powered flyer scanning. Customer research across 5 club interviews falsified that assumption:

- Tanner/Marriott School prohibits physical flyers by policy
- All Round 2 clubs (Sales Society, Finance Society, Women of Accountancy) rely on email + Instagram
- When asked about zero-effort automation from official channels, clubs rated it **9.7/10 on average**

**Pivot:** Flyer scanning → Email/Slack automated ingestion as the primary path.

---

## MVP Success Metrics

| Metric | Target |
|--------|--------|
| Posts per week | 30+ |
| Unique visitors | 150+ |
| Repeat users | 25%+ |
| Ghost chase rate | <5% |
| Organic posts (non-team) | 5+ |

---

## Contact

- **Product Lead:** Ava Williams
- **GitHub:** [github.com/avareesew/food_finder](https://github.com/avareesew/food_finder)

---

*Built by BYU MIS students, for students.*
