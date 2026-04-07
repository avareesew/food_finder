# API Documentation Guides

**Last Updated:** April 6, 2026

---

## Overview

This folder contains API documentation and research for the Scavenger tech stack. Note: the project has pivoted since some of these were written — OpenAI gpt-4o-mini is now the **primary** AI provider, not Gemini.

---

## Available Guides

### `api-verification-summary.md`
Original API verification from February 2026. Confirms Gemini, Firebase, Next.js are real and production-ready. **Note:** OpenAI is now primary extractor — see `aiDocs/architecture.md` for current stack.

### `gemini-api-docs.md`
Google Gemini 2.0 Flash API documentation — image processing and structured JSON extraction. Gemini is the **secondary** extraction path (used via `/api/flyers/[flyerId]/extract`).

### `firebase-firestore-docs.md`
Firebase & Firestore documentation — real-time database, file storage, Admin SDK.

### `nextjs-14-docs.md`
Next.js App Router documentation. Project runs on **Next.js 16** but core App Router patterns still apply.

### `food-finder-market-research.md`
Market research: 41% food insecurity rate, competitive landscape, BYU pilot rationale, FDIA 2023 legal framework.

### `external/marketResearch_gemini.md`
Additional market research.

---

## Current Tech Stack

For the authoritative current stack see `aiDocs/architecture.md`. Quick reference:

| Layer | Technology |
|-------|-----------|
| AI (Primary) | OpenAI gpt-4o-mini (Responses API) |
| AI (Secondary) | Gemini 2.0 Flash |
| Framework | Next.js 16 (App Router) |
| Database | Firestore (Firebase) |
| Auth | Firebase Auth |
