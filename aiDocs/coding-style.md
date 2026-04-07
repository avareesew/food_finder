# Coding Style Guide: Scavenger

**Last Updated:** April 6, 2026
**Applies To:** All JavaScript/TypeScript code in this project

---

## Philosophy

1. **Clarity over cleverness** — Code should be obvious, not clever
2. **Consistency over personal preference** — Follow the established patterns
3. **Simple over complex** — Choose the straightforward solution
4. **Mobile-first always** — Test on phone, not just desktop
5. **No cruft** — Don't add docstrings, comments, or type annotations to code you didn't change (see CLAUDE.md)

---

## Language & Framework

### TypeScript
- Use TypeScript for all new files (`.ts`, `.tsx`)
- Avoid `any` type — use `unknown` if truly unknown
- Prefer interfaces over type aliases for objects
- Enable strict mode in `tsconfig.json`

```typescript
// ✅ Good — actual data model from the codebase
interface ExtractedEvent {
  title: string | null;
  host: string | null;
  campus: string | null;
  date: string | null;       // YYYY-MM-DD
  startTime: string | null;  // HH:MM (24h)
  endTime: string | null;
  place: string | null;
  food: string | null;
  foodCategory: FoodCategory | null;
  details: string | null;
  other: Record<string, unknown> | null;
  foodEmoji?: string | null;
}

// ❌ Avoid
type Event = {
  id: any;
  name: string;
};
```

---

## File Structure

### Naming Conventions

- **Components:** PascalCase (e.g., `EventCard.tsx`, `UploadForm.tsx`)
- **Utilities:** camelCase (e.g., `eventTiming.ts`, `matchByuBuilding.ts`)
- **API Routes:** kebab-case directories (e.g., `api/slack-ingest/`, `api/cache-image/`)
- **Constants:** SCREAMING_SNAKE_CASE

```
src/
├── app/                   # Next.js App Router pages + API routes
│   ├── page.tsx           # Home (hero, calendar, discover preview)
│   ├── feed/page.tsx      # Event feed (card grid)
│   ├── upload/page.tsx    # Flyer upload
│   ├── explore/page.tsx   # Campus buildings explorer
│   ├── events/[id]/       # Event detail view
│   └── api/               # API routes
│       ├── events/        # Published events CRUD
│       ├── flyers/        # Flyer metadata + extraction
│       ├── upload/        # File upload + processing
│       ├── cron/          # Scheduled jobs (Slack ingest)
│       ├── auth/          # Registration, session, profile sync
│       ├── admin/         # Admin user management
│       └── local/         # Local dev mode endpoints
├── backend/               # Server-side logic
│   ├── openai/            # OpenAI extraction (primary)
│   ├── gemini/            # Gemini extraction (secondary)
│   ├── flyers/            # Flyer processing pipeline
│   ├── slack/             # Slack API client + ingest
│   ├── auth/              # Token verification, user profiles
│   └── local/             # Local filesystem storage
├── components/            # React components
│   ├── ui/                # EventCard, LocalEventCard, EventDetailModal
│   ├── home/              # WeeklyEventCalendar
│   └── layout/            # Navbar
├── lib/                   # Utilities (firebase, eventTiming, logger, validation)
├── hooks/                 # React hooks
├── data/                  # Static data (byuBuildings)
└── services/              # Firestore service layer
```

---

## React Components

### Functional Components Only
- Use function declarations, not arrow functions for components
- Use TypeScript interfaces for props

```typescript
// ✅ Good
interface EventCardProps {
  flyer: Flyer;
  onSelect: (id: string) => void;
}

export default function EventCard({ flyer, onSelect }: EventCardProps) {
  return <div>{flyer.extractedEvent?.title}</div>;
}
```

---

### State Management
- Use `useState` for component-local state
- Use Context API for shared state (AuthProvider)
- No Redux/Zustand — keep it simple

---

## Styling

### Tailwind CSS
- Use Tailwind utility classes (avoid custom CSS when possible)
- Mobile-first breakpoints: `sm:`, `md:`, `lg:`
- Dark mode via `dark:` variant

---

## Data Fetching

### API Calls
- Use native `fetch` (no axios)
- Always handle errors with try/catch
- Show loading states

### Firestore Queries
- Use Admin SDK server-side for writes (`firebase-admin`)
- Use client SDK for reads where needed (`firebase`)
- Collections: `flyers`, `events`, `extractions`, `user_profiles`, `slack_ingest_seen`

---

## Error Handling

### Structured Logging
- Use `import { logger } from '@/lib/logger'` — never raw `console.error`
- Log with event names and structured details:

```typescript
import { logger } from '@/lib/logger';

// ✅ Good — structured logging
logger.error('upload-error', { message: error.message, filename });
logger.info('flyer-processing-start', { originalFilename });
logger.warn('flyer-rejected', { reason, missingFields });

// ❌ Avoid — raw console calls
console.error('Upload failed:', error);
```

### User-Facing Errors
- Show clear, actionable error messages
- Avoid technical jargon ("OCR failed" → "Couldn't read the flyer")

### Backend Errors
- Use structured logger for detailed server logs
- Return generic messages to client (no stack traces)

---

## Comments

### When to Comment
- Complex logic that isn't obvious
- Why something is done a certain way (not what it does)
- Only add comments where the logic isn't self-evident (per CLAUDE.md)
- Do NOT add JSDoc or comments to code you didn't change

---

## Git Commit Messages

### Format
```
<type>(<scope>): <short summary>

<optional body>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build/tooling changes

---

## Testing

### CLI Scripts
- `scripts/test.sh` — runs lint + build, captures output to `logs/test-<timestamp>.log`
- `scripts/test-slack-ingest.sh` — tests Slack pipeline against local dev server
- Exit codes: 0 = success, 1 = failure, 2 = configuration error

---

## Performance Best Practices

- Compress images before upload (client-side)
- Code-split heavy components with `next/dynamic` (e.g., Leaflet map)
- Use pagination (don't load all flyers at once)

---

## Anti-Patterns (Avoid These)

- **Raw `console.error`** → Use `logger.error` with event name
- **Prop drilling more than 2 levels** → Use Context
- **Inline functions in JSX** → Define outside render
- **Over-engineering** → Build the minimum that works (CLAUDE.md principle)
- **Premature abstraction** → Three similar lines > helper used once

---

**When in doubt, prioritize readability. Code is read 10x more than it's written.**
