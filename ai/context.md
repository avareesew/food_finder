# AI Context Bookshelf

**Last Updated:** April 7, 2026
**Purpose:** Fast onboarding entrypoint for new AI sessions working in this repo.

---

## Read First

1. **`aiDocs/context.md`** — Current project state, pivot summary, what's built, and the clearest high-level snapshot of where the team is right now.
2. **`aiDocs/prd.md`** — Product anchor. Defines the post-pivot customer, value proposition, feature priorities, and what the product is meant to prove.
3. **`aiDocs/mvp.md`** — Scope-constrained demo spec. Shows what is actually built, what is intentionally not built yet, and how the final demo is framed.
4. **`aiDocs/architecture.md`** — System diagram, route inventory, data flows, env vars, and backend architecture across Slack, Gmail, uploads, auth, and admin tooling.
5. **`ai/roadmaps/2026-04-06-current-roadmap.md`** — Single active roadmap and readiness tracker. Use this instead of any older roadmap-tracker references.
6. **`aiDocs/changelog.md`** — Change history and verification evidence, including recent readiness-pass updates and saved log artifacts.
7. **`CLAUDE.md`** — Behavioral guidance, repo guardrails, and coding expectations for future AI sessions.

---

## Repo Truths

- `aiDocs/` is the source-of-truth documentation set.
- `ai/` is committed working context: bookshelf, roadmaps, interview notes, and supporting research.
- Structured logging lives in `src/lib/logger.ts` and is integrated across all 21 API routes plus key backend pipeline and admin helper flows.
- The primary customer is the club president or club admin posting through existing channels; student browsing stays anonymous.
- Slack and Gmail ingestion backends are implemented; pasted text/email UI is still a future UI task.
- Vercel deployment is a teammate-owned rollout workstream. This repo contains deployment config and readiness docs, but not the final production promotion from this branch.

---

## Evidence Checklist

- Keep `aiDocs/changelog.md` current when meaningful repo state changes.
- Keep `ai/roadmaps/2026-04-06-current-roadmap.md` current when sprint status changes.
- Save verification output under `logs/` using:
  - `bash scripts/test.sh`
  - `bash scripts/test-slack-ingest.sh`
  - `bash scripts/scan-secrets.sh`

---

## Historical Notes

- Older flyer-era docs and trackers are preserved under archived folders for rubric evidence and pivot history.
- When you see historical references to the original roadmap tracker, use `ai/roadmaps/archived/roadmap-tracker-v1.md` for that older context and `ai/roadmaps/2026-04-06-current-roadmap.md` for current work.
