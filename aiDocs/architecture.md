# System Architecture: Food Finder Platform

**Version:** 2.2
**Last Updated:** April 7, 2026
**Status:** Active Development — Final Sprint

---

## Overview

Scavenger is a serverless, mobile-first web application that ingests club food event announcements from official Slack channels, Gmail inboxes, and manual submissions, extracts structured event data via AI, and displays events on a live campus map and feed. The architecture prioritizes simplicity, speed, and zero-DevOps complexity for rapid MVP iteration.

**Primary ingestion path:** Slack + Gmail automation → AI extraction → map pin
**Secondary path:** Manual text/email paste → AI extraction → map pin
**Tertiary path:** Flyer image upload → OpenAI vision extraction → map pin

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Club Channels + Users                    │
│ Slack workspaces · Gmail inbox · admin browser · students   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / Cron
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js 16 on Vercel / Local Dev               │
│        App Router pages + 21 API routes + cron entrypoints  │
└─────┬───────────────────┬──────────────────┬─────────────────┘
      │                   │                  │
      │ Pages + Admin UI  │ Ingestion Routes │ Static Assets
      ▼                   ▼                  ▼
┌──────────────┐   ┌────────────────┐  ┌────────────────┐
│ Home / Feed  │   │ /api/cron/*    │  │ Images/CSS     │
│ Explore      │   │ /api/upload/*  │  │ Leaflet tiles  │
│ Upload       │   │ /api/admin/*   │  │ Cached images  │
│ Events/[id]  │   │ /api/flyers/*  │  └────────────────┘
│ Admin/*      │   │ /api/events    │
└──────────────┘   └──────┬─────────┘
                          ├──────────────┬───────────────┬────────────────┐
                          │              │               │                │
                          ▼              ▼               ▼                ▼
                  ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────────────┐
                  │ OpenAI       │ │ Gemini      │ │ Firebase Auth│ │ Firestore       │
                  │ gpt-4o-mini  │ │ 2.0 Flash   │ │ + Admin SDK  │ │ flyers/events   │
                  │ (primary)    │ │ (secondary) │ │ admin checks │ │ extractions     │
                  └──────────────┘ └─────────────┘ └──────────────┘ └────────┬────────┘
                                                                               │
                                                                               ▼
                                                                       ┌─────────────────┐
                                                                       │ Firebase Storage │
                                                                       │ flyer images     │
                                                                       └─────────────────┘
```

---

## File Structure (Actual)

```
food_finder/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Home (hero, calendar, discover, map CTA)
│   │   ├── layout.tsx                        # Root layout
│   │   ├── feed/page.tsx                     # Event feed (card grid)
│   │   ├── upload/page.tsx                   # Flyer upload + recent uploads
│   │   ├── events/[id]/page.tsx              # Event detail view
│   │   ├── explore/page.tsx                  # Campus buildings explorer
│   │   ├── about/page.tsx                    # Mission / how it works
│   │   └── api/
│   │       ├── events/route.ts               # GET/POST published events
│   │       ├── flyers/route.ts               # GET/POST flyer metadata
│   │       ├── flyers/[flyerId]/route.ts     # GET single flyer
│   │       ├── flyers/[flyerId]/extract/route.ts  # POST Gemini extraction
│   │       ├── upload/route.ts               # POST multimodal upload (Firebase or local)
│   │       ├── upload/process/route.ts       # POST process after browser upload
│   │       ├── cron/slack-ingest/route.ts    # POST cron-triggered Slack channel ingestion
│   │       ├── cron/gmail-ingest/route.ts    # POST cron-triggered Gmail inbox ingestion
│   │       ├── slack/events/route.ts         # POST Slack Events API webhook
│   │       ├── auth/me/route.ts              # GET current user profile
│   │       ├── auth/register/route.ts        # POST register new user
│   │       ├── auth/sync-profile/route.ts    # POST sync Firebase Auth → Firestore profile
│   │       ├── admin/create-user/route.ts    # POST create a BYU-linked uploader account
│   │       ├── admin/flyers/route.ts         # GET admin flyer audit list
│   │       ├── admin/flyers/[flyerId]/route.ts # DELETE flyer + storage object
│   │       ├── admin/users/route.ts          # GET/PATCH user management (admin only)
│   │       ├── local/ingest/route.ts         # POST local extract + save
│   │       ├── local/extract/route.ts        # POST local extract only
│   │       ├── local/events/route.ts         # GET local events
│   │       ├── local/upcoming/route.ts       # GET upcoming local events
│   │       └── local/cache-image/route.ts    # POST cache Unsplash images
│   ├── backend/
│   │   ├── env.ts                            # Environment variable helpers
│   │   ├── openai/
│   │   │   ├── extractFlyer.ts               # OpenAI gpt-4o-mini extraction (FlyerExtraction schema)
│   │   │   ├── extractEventFromFlyer.ts      # OpenAI gpt-4o-mini extraction (ExtractedEvent schema)
│   │   │   └── extractEventsFromSlackText.ts # OpenAI text extraction for Slack messages
│   │   ├── gemini/
│   │   │   └── extractFlyer.ts               # Gemini 2.0 Flash extraction
│   │   ├── flyers/
│   │   │   ├── processUploadedFlyer.ts       # Extract → validate → store (or reject)
│   │   │   ├── ingestFlyerImageBytes.ts      # Ingest flyer from raw image bytes
│   │   │   ├── persistSlackTextFlyer.ts      # Persist Slack-sourced event text as flyer record
│   │   │   ├── storageAdminUpload.ts         # Firebase Admin Storage operations
│   │   │   └── flyerDocToJson.ts             # Firestore Timestamp → JSON conversion
│   │   ├── gmail/
│   │   │   └── runGmailIngest.ts             # Gmail inbox ingestion pipeline
│   │   ├── auth/
│   │   │   ├── userProfiles.ts               # Firestore user profile CRUD
│   │   │   ├── requireAdmin.ts               # Admin session guard + centralized admin error logging
│   │   │   └── verifyBearer.ts               # Bearer token verification middleware
│   │   ├── slack/
│   │   │   ├── runSlackIngest.ts             # Full Slack channel ingestion pipeline
│   │   │   ├── slackClient.ts                # Slack API client (channel history, messages)
│   │   │   └── slackDedupe.ts                # Deduplication logic (prevents re-ingesting same message)
│   │   └── local/
│   │       ├── eventsStore.ts                # Local filesystem event storage
│   │       ├── eventsJsonStore.ts            # Local JSON extraction records
│   │       └── publicUploads.ts              # Save images to public/uploads/
│   ├── components/
│   │   ├── layout/Navbar.tsx                 # Navigation header
│   │   ├── home/WeeklyEventCalendar.tsx      # Calendar grid (events by day/week)
│   │   ├── ui/
│   │   │   ├── EventCard.tsx                 # Event card (image, badges, food highlight)
│   │   │   ├── LocalEventCard.tsx            # Card variant for local mode events
│   │   │   ├── EventDetailModal.tsx          # Modal for expanded event details
│   │   │   ├── EmptyState.tsx                # Empty state placeholder
│   │   │   ├── PrimaryButton.tsx             # Styled action button
│   │   │   └── PinIcon.tsx                   # Location pin SVG
│   │   ├── UploadForm.tsx                    # Drag-and-drop file upload + extraction display
│   │   ├── CampusBuildingMap.tsx             # Building-specific map view
│   │   ├── CampusBuildingsExplorer.tsx       # Interactive campus building grid
│   │   ├── CampusMap.tsx                     # Base map visualization
│   │   ├── FloatingChip.tsx                  # Floating badge component
│   │   ├── HeroPreview.tsx                   # Hero section preview cards
│   │   ├── ThemeToggle.tsx                   # Dark/light mode toggle
│   │   └── Navbar.tsx                        # (Legacy navbar, see layout/Navbar.tsx)
│   ├── lib/
│   │   ├── firebase.ts                       # Firebase client init (db, storage, app)
│   │   ├── eventTiming.ts                    # Campus timezone, date coercion, expiry
│   │   ├── validateFlyerExtraction.ts        # Required field validation
│   │   ├── matchByuBuilding.ts               # Fuzzy building name → ID matching
│   │   ├── homeDiscoverPreview.ts            # Flyer → preview card conversion
│   │   └── logger.ts                         # Structured logging utility
│   ├── hooks/
│   │   └── useHtmlDarkClass.ts               # Dark mode class on <html>
│   ├── data/
│   │   └── byuBuildings.ts                   # BYU building database (name, aliases, lat/lng)
│   └── services/
│       └── flyers.ts                         # Flyer CRUD (Firestore + API fallback)
├── data/                                     # Local mode storage
│   ├── events.json                           # Extraction records (local mode)
│   └── uploads/                              # Uploaded flyer images (local mode)
├── public/
│   ├── uploads/                              # Cached images (Unsplash, local uploads)
│   └── slides.html                           # Presentation slides
├── .secrets/                                 # Service account files (gitignored)
├── env.example                               # Environment variable template
└── package.json
```

---

## Implementation Patterns

### State Management
- React hooks for local state management (`useState`, `useEffect`)
- Firestore reads via API routes (not direct client-side `onSnapshot` yet)
- No complex state management library needed for MVP

### Error Handling
- Extraction validation rejects flyers missing required fields (date, time, place)
- Rejected uploads are cleaned up from Storage automatically
- Empty states shown when no events available
- Structured logging via `src/lib/logger.ts`

### Loading States
- Skeleton loaders on home page and feed during data fetch
- Loading state in UploadForm during extraction

### Extraction Validation
- Required fields: date (coercible to YYYY-MM-DD), time (valid HH:MM start or end), place (2+ chars)
- Date coercion handles varied AI output formats (2026-4-9, 04/09/2026 → 2026-04-09)
- Wrong-year correction (if extracted date is in past, tries current year)
- Invalid extractions return 422 with `missingFields` array

### Backend Modes
- **Firebase mode** (`NEXT_PUBLIC_BACKEND_MODE=firebase`): Firestore + Firebase Storage + Admin SDK
- **Local mode** (`NEXT_PUBLIC_BACKEND_MODE=local`): `data/events.json` + local filesystem

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Version:** 16.1.6
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **Maps:** Leaflet 1.9.4
- **Dates:** date-fns 4.1.0
- **HTTP Client:** Native fetch API

**Key Features:**
- API Routes for backend logic (`app/api/*/route.ts`)
- Server Components (default) for data fetching
- Client Components (`'use client'`) for interactivity
- Dark mode via Tailwind `dark:` classes + custom hook

---

### Backend
- **Runtime:** Node.js 18+ (Vercel serverless functions)
- **API Framework:** Next.js API Routes
- **Authentication:** Firebase Auth + Firestore user profiles (login, register, admin page, upload gate)
- **File Upload:** Multipart form data via API route + browser-side Firebase Storage upload

---

### Database
- **Primary:** Firestore (Firebase)
- **Client SDK:** `firebase` 12.9.0 (modular SDK)
- **Admin SDK:** `firebase-admin` 13.7.0 (server-side operations)
- **Schema:** Document-based (NoSQL)
- **Collections:** `flyers`, `events`, `extractions`

**Current State:**
- Reads via `getDocs` (polling), not `onSnapshot` (real-time)
- Admin SDK used for server-side writes (bypasses client security rules)
- Client SDK used for reads via API route proxies

---

### AI/ML (Dual Provider)

#### Primary: OpenAI gpt-4o-mini
- **API:** Responses API (`https://api.openai.com/v1/responses`)
- **No SDK** — raw `fetch` calls
- **Used by:** `/api/upload`, `/api/upload/process`, `/api/local/ingest`, `/api/local/extract`
- **Two extraction schemas:**
  - `ExtractedEvent` (title, host, campus, date, startTime, endTime, place, food, foodCategory, details)
  - `OpenAIExtraction` (title, building, room, startIso, endIso, foodDescription, estimatedPortions, notes)

#### Secondary: Gemini 2.0 Flash
- **Package:** `@google/generative-ai` 0.24.1
- **Model:** `gemini-2.0-flash`
- **Used by:** `/api/flyers/[flyerId]/extract`
- **Schema:** `FlyerExtraction` (title, building, room, startIso, endIso, foodDescription, estimatedPortions, notes)

---

### Storage
- **Production:** Firebase Storage (via Admin SDK signed URLs, 100-year expiration)
- **Development:** Local filesystem (`data/uploads/`, `public/uploads/`)
- **Image Caching:** Unsplash images cached to `public/uploads/` via SHA256 hash

**Service Account Loading** (tries in order):
1. `FIREBASE_SERVICE_ACCOUNT_PATH` (file path)
2. `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` (base64-encoded)
3. `FIREBASE_SERVICE_ACCOUNT_JSON` (inline JSON)

---

### Hosting & Deployment
- **Platform:** Vercel (deployment handoff owned by teammate; config committed in repo)
- **CI/CD:** GitHub integration (auto-deploy on push to `main`)
- **Domain:** TBD

---

## Data Models (Actual)

### Flyer (Firestore `flyers` collection)

The primary document created when a user uploads a flyer image.

```typescript
interface Flyer {
  id: string;                              // Auto-generated by Firestore
  originalFilename: string;                // Original upload filename
  storagePath: string;                     // Firebase Storage path
  downloadURL: string;                     // Signed URL to flyer image
  status: "available" | "gone" | "extracted" | "extracting" | "extraction_failed";
  uploader: string;                        // "anonymous" (no auth in MVP)
  createdAt: Timestamp;
  extractedEvent?: ExtractedEvent | null;  // AI extraction result
  rawModelOutput?: string;                 // Raw AI response for debugging
  extractionError?: string | null;
  extractedAt?: Timestamp;
  lastExtractionId?: string;               // Reference to extractions collection
  // Slack-sourced flyers (set when ingested via Slack pipeline):
  sourceType?: "upload" | "slack";
  slackTeamId?: string;
  slackChannelId?: string;
  slackMessageTs?: string;
  slackFileId?: string;
  slackWorkspaceName?: string;
  slackWorkspaceLabel?: string;
}
```

### Event (Firestore `events` collection)

Published events (created via POST /api/events after extraction).

```typescript
interface Event {
  id: string;                    // Auto-generated by Firestore
  title: string;                 // "CS Club Pizza Social"
  location: {
    building: string | null;     // "TMCB"
    room: string | null;         // "210"
  };
  startAt: Timestamp;            // Event start time
  endAt: Timestamp | null;       // Event end time
  timezone: string;              // "America/Denver"
  food: {
    description: string | null;  // "3 large pizzas"
    estimatedPortions: number | null;
  };
  source: {
    flyerId: string | null;
    extractionId: string | null;
    method: "ai+confirm" | "manual" | "slack" | "email";
  };
  status: "scheduled" | "available" | "gone";
  // Fields requested by Round 2 club interviews:
  requirements?: string | null;  // "Stay for full event, Business Casual" (Sales Society, Finance Society)
  clubLink?: string | null;      // URL to club signup/interest form (Finance Society, Women of Accountancy)
  scarcityNote?: string | null;  // "Food for first 100 people" (Women of Accountancy)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Extraction (Firestore `extractions` collection)

Stored when Gemini extraction is run via `/api/flyers/[flyerId]/extract`.

```typescript
interface ExtractionRecord {
  id: string;
  flyerId: string;
  model: string;                 // "gemini-2.0-flash"
  campusTimezone: string;
  extraction: FlyerExtraction;   // { title, building, room, startIso, endIso, foodDescription, estimatedPortions, notes }
  rawText: string;
  createdAt: Timestamp;
}
```

### ExtractedEvent (Embedded in Flyer documents)

The schema used by OpenAI extraction, embedded directly in flyer documents.

```typescript
interface ExtractedEvent {
  title: string | null;
  host: string | null;           // Club/department name
  campus: string | null;         // "BYU" or null
  date: string | null;           // YYYY-MM-DD
  startTime: string | null;      // HH:MM (24h)
  endTime: string | null;        // HH:MM (24h)
  place: string | null;          // Free-text location (e.g., "TMCB 210")
  food: string | null;           // e.g., "pizza", "treats"
  foodCategory: FoodCategory | null;  // pizza | dessert | snacks | refreshments | drinks | meal | other
  details: string | null;
  other: Record<string, unknown> | null;
}
```

### StoredExtractionRecord (Local mode — `data/events.json`)

```typescript
interface StoredExtractionRecord {
  id: string;
  createdAtIso: string;
  source: {
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  };
  imageUrl?: string | null;
  event: ExtractedEvent;
  rawModelOutput: string;
}
```

### Firestore Collection Structure

```
/flyers
  /{flyerId}        — Flyer image metadata + extraction result

/events
  /{eventId}        — Published events (from confirmed extractions)

/extractions
  /{extractionId}   — Gemini extraction records (linked to flyers)
```

---

## API Endpoints (Actual)

### Flyer Endpoints

#### POST `/api/flyers`
**Purpose:** Save flyer metadata after client uploads to Firebase Storage, then extract via OpenAI.

**Request Body:**
```typescript
{
  downloadURL: string;       // Firebase Storage signed URL
  storagePath: string;       // Storage path
  originalFilename: string;
  mimeType?: string;         // Default: "image/jpeg"
}
```

**Process:** Calls `processUploadedFlyer()` → downloads image → extracts via OpenAI → validates → stores in Firestore (or rejects + deletes from Storage).

**Response (success):**
```typescript
{ flyerId: string; downloadURL: string; storagePath: string; }
```

**Response (validation failure — 422):**
```typescript
{ error: "...", missingFields: ["date", "time", "place"] }
```

#### GET `/api/flyers`
**Purpose:** Fetch recent flyers via Admin SDK.
**Query:** `limit` (1-100, default 20)

#### GET `/api/flyers/:flyerId`
**Purpose:** Fetch single flyer by ID via Admin SDK.

#### POST `/api/flyers/:flyerId/extract`
**Purpose:** Run Gemini 2.0 Flash extraction on a stored flyer image. Stores result in `extractions` collection and updates flyer status.

---

### Upload Endpoints

#### POST `/api/upload`
**Purpose:** Multimodal upload handler (supports both Firebase and local mode).
- Firebase mode: uploads via Admin SDK → processes with OpenAI → stores in Firestore
- Local mode: saves to `data/uploads/` → processes with OpenAI → appends to `data/events.json`

#### POST `/api/upload/process`
**Purpose:** Process flyer after browser-side upload to Firebase Storage. Uses OpenAI gpt-4o-mini Responses API.

---

### Event Endpoints

#### POST `/api/events`
**Purpose:** Create published events (feed + calendar source of truth).

**Request Body:**
```typescript
{
  title: string;              // Required
  building?: string | null;
  room?: string | null;
  startIso: string;           // Required, ISO datetime
  endIso?: string;
  timezone?: string;          // Default: "America/Denver"
  foodDescription?: string | null;
  estimatedPortions?: number | null;
  flyerId?: string | null;
  extractionId?: string | null;
}
```

#### GET `/api/events`
**Purpose:** List events for calendar/feed date ranges.
**Query:** `from` (ISO, default: now), `to` (ISO, default: now + 7 days)

---

### Slack Ingestion Endpoint

#### POST `/api/cron/slack-ingest`
**Purpose:** Cron-triggered Slack channel ingestion. Reads recent messages from configured club Slack channels, extracts events via OpenAI, deduplicates, and stores in Firestore.

**Auth:** Bearer token (server-to-server, not user-facing)

**Backend pipeline:**
1. `slackClient.ts` — fetch channel history since last ingest
2. `extractEventsFromSlackText.ts` — OpenAI text extraction per message
3. `slackDedupe.ts` — skip already-ingested messages
4. `persistSlackTextFlyer.ts` — store as flyer record in Firestore

**Config:** See `src/lib/slackIngestEnv.ts` for required env vars (`SLACK_BOT_TOKEN`, `SLACK_CHANNEL_IDS`, `CRON_SECRET`)

---

### Gmail Ingestion Endpoint

#### POST `/api/cron/gmail-ingest`
**Purpose:** Cron-triggered Gmail inbox ingestion. Reads the configured inbox, branches between image attachments and plain-text messages, extracts events, deduplicates by Gmail message markers, and stores results in Firestore.

**Auth:** Bearer token (server-to-server, not user-facing)

**Backend pipeline:**
1. `runGmailIngest.ts` — list inbox messages, maintain dedupe marks, branch image vs text
2. `processUploadedFlyer.ts` — process Gmail image attachments through the flyer pipeline
3. `extractEventsFromSlackText.ts` — reuse structured text extraction for Gmail message bodies
4. `persistSlackTextFlyer.ts` — store Gmail text events as flyer records

**Config:** See `env.example` for `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, and `CRON_SECRET`

---

### Admin Endpoints

#### POST `/api/admin/create-user`
Create a Firebase user tied to a BYU email + BYU Net ID, then return a branded password reset link for admin handoff.

#### GET `/api/admin/users`
List uploader/admin profiles for the admin panel.

#### PATCH `/api/admin/users`
Toggle `canUpload` for a non-admin user.

#### DELETE `/api/admin/users`
Delete a user account and clean up its Firestore profile.

#### GET `/api/admin/flyers`
List recent flyer records for admin review and cleanup.

#### DELETE `/api/admin/flyers/[flyerId]`
Hard delete a flyer document and remove the backing storage object when present.

---

### Local Mode Endpoints

#### POST `/api/local/ingest`
Extract + save flyer to local filesystem.

#### POST `/api/local/extract`
Extract only (no storage).

#### GET `/api/local/events`
Fetch all extraction records from `data/events.json`.

#### GET `/api/local/upcoming`
Fetch upcoming events (not ended). Query: `limit` (default 3, max 20).

#### POST `/api/local/cache-image`
Cache remote Unsplash images locally. Only allows `images.unsplash.com` and `source.unsplash.com` hosts.

---

## Data Flow: Upload to Feed (Actual)

### Firebase Mode Pipeline
1. User selects image → `UploadForm.tsx` (drag-and-drop or click)
2. Browser uploads image to Firebase Storage directly (client SDK)
3. Browser sends `{ downloadURL, storagePath, originalFilename }` to `/api/upload/process`
4. Server downloads image bytes from Storage
5. Server calls OpenAI gpt-4o-mini Responses API for extraction
6. Server validates extraction (`validateExtractedEventRequired`)
   - **If valid:** Creates Firestore document in `flyers` collection with status "extracted"
   - **If invalid:** Deletes image from Storage, returns 422 with missing fields
7. Feed page fetches flyers via `getRecentFlyers()` → API route → Admin SDK → Firestore

### Local Mode Pipeline
1. User selects image → `UploadForm.tsx`
2. Image sent as multipart form to `/api/local/ingest`
3. Server saves image to `data/uploads/`
4. Server calls OpenAI gpt-4o-mini for extraction
5. Server validates extraction
6. Appends extraction record to `data/events.json`
7. Feed page fetches from `/api/local/events` or `/api/local/upcoming`

### Gemini Extraction (Secondary Path)
1. Flyer already exists in Firestore (uploaded via primary flow)
2. POST to `/api/flyers/[flyerId]/extract`
3. Server fetches flyer document, downloads image bytes
4. Calls Gemini 2.0 Flash with structured JSON schema
5. Stores extraction in `extractions` collection
6. Updates flyer with `status: "extracted"`, `lastExtractionId`

### Status Update Flow
**Not yet implemented.** The `status` field exists on flyer documents ("available" | "gone" | "extracted" etc.) but there is no UI for users to mark events as gone. This is a pre-alpha blocker.

---

## Security Considerations

### Current (Phase 1)
- **Auth is implemented** — Firebase Auth for upload/admin; browsing remains anonymous (no login required to view feed)
- Server-side writes via Admin SDK (client can't write directly to Firestore)
- Extraction validation rejects invalid uploads and cleans up Storage
- Unsplash image caching only allows whitelisted hosts
- No CAPTCHA (accept spam risk for MVP simplicity)
- No rate limiting implemented yet (was planned but not built)

### Phase 2 (Future)
- Add rate limiting on upload endpoints
- Add Firebase Authentication (optional login)
- Add content moderation (flag inappropriate posts)
- Lock down Firestore rules to server-only writes

---

## Mobile-First UI/UX

### Responsive Design
- Tailwind CSS 4 with responsive breakpoints
- Event card grid: 1 column (mobile) → 2 columns (md) → 3 columns (lg)
- Dark mode support via `useHtmlDarkClass` hook + Tailwind `dark:` classes
- Keyboard navigation on event cards (Enter/Space opens detail)

### Event Status Indicators
- **Active** events: Green badge or indicator
- **Ended** events: "Ended" ribbon overlay, muted styling
- **Extraction issues**: Warning badge on event detail page
- Event expiry detection via `isCampusEventEnded()` in `eventTiming.ts`

### Time Formatting
- Campus timezone: America/Denver (hardcoded)
- 12-hour display: `formatTime12h()` ("6:00 PM")
- Date labels: `formatEventDateLabel()` ("Wed, Mar 30")
- Smart AM/PM handling for AI edge cases (e.g., "8 PM" stored as "08:00")

---

## Environment Variables

See `env.example` for the full template.

### Public (browser-accessible)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_BACKEND_MODE=firebase    # "firebase" or "local"
```

### Server-only (AI)
```bash
OPENAI_API_KEY=          # Required for primary extraction (gpt-4o-mini)
GEMINI_API_KEY=          # Required for /api/flyers/:flyerId/extract endpoint
```

### Server-only (Firebase Admin)
One of these is required when using Firebase mode:
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=        # Path to service account JSON file
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64= # Base64-encoded service account JSON
FIREBASE_SERVICE_ACCOUNT_JSON=        # Inline service account JSON
```

Optional:
```bash
FIREBASE_STORAGE_BUCKET=              # Falls back to NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

---

## Real-Time Updates

### Current State
- **Not yet implemented.** Feed data is fetched via `getDocs` (polling on page load).
- `onSnapshot` real-time listeners are planned but not wired up.
- This is a pre-alpha item to address.

### Planned Implementation
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'flyers'),
    (snapshot) => {
      const flyers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFlyers(flyers);
    }
  );
  return () => unsubscribe();
}, []);
```

---

## Getting Started

### Prerequisites
```bash
node --version   # Node.js 18+
npm --version
```

### Setup
```bash
git clone https://github.com/avareesew/food_finder.git
cd food_finder
npm install
cp env.example .env.local
# Fill in API keys and Firebase config in .env.local
npm run dev
# Open http://localhost:3000
```

### Local Development Mode
Set `NEXT_PUBLIC_BACKEND_MODE=local` in `.env.local` to skip Firebase entirely. Events are stored in `data/events.json` and images in `data/uploads/`. Only requires `OPENAI_API_KEY`.

---

## Technology Decisions Log

| Decision | Rationale | Alternatives Considered | Status |
|----------|-----------|-------------------------|--------|
| **Next.js over plain React** | SSR for SEO, API routes = no separate backend | Create React App, Remix | Implemented (v16) |
| **Firestore over PostgreSQL** | Real-time sync built-in, simpler for MVP | Supabase, MongoDB | Implemented |
| **OpenAI as primary AI** | gpt-4o-mini via Responses API works well for extraction | Gemini-only (original plan) | Implemented |
| **Gemini as secondary AI** | Available for re-extraction; keeps optionality | — | Implemented |
| **Dual backend mode** | Local mode speeds up dev without Firebase credentials | Firebase-only | Implemented |
| **Vercel over AWS** | Zero config, fast handoff for student team delivery | AWS Amplify, Netlify | Deployment handoff in progress |
| **BYU email auth for uploaders** | Anonymous browse + gated upload prevents spam | No auth at all, Open upload | Implemented (Firebase Auth + BYU email enforcement) |
| **Firebase Admin SDK** | Server-side writes bypass client security rules | Client SDK writes | Implemented |
| **Leaflet for maps** | Lightweight, open-source, no API key needed | Google Maps, Mapbox | Implemented |

---

## Future Architecture (Phase 2+)

### Priority Items (Pre-Alpha Blockers)
- "Mark as Gone" UI + status update endpoint
- Real-time `onSnapshot` listeners
- User confirmation/edit form for AI extractions
- Vercel production deployment handoff (teammate-owned rollout)

### Phase 2 Features
- Slack bot integration (shared Firestore DB)
- Email forwarding parser
- Firebase Authentication (optional, anonymous sign-in)
- Rate limiting on upload endpoints
- Analytics integration (GA4)

### Phase 3 (Multi-Campus)
- Campus field on events (`campusId`)
- Campus-specific building databases
- Timezone handling per campus

---

**This architecture is optimized for rapid MVP iteration with minimal operational overhead. Scale decisions deferred until post-PMF validation.**
