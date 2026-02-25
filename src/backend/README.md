## Backend (server-side) modules

This project uses **Next.js App Router API routes** as the backend runtime (serverless on Vercel).

This folder (`src/backend/`) is where we keep **server-only** logic that should not live in client components:

- **AI extraction** (Gemini) prompt + parsing + normalization
- **Validation** of extracted / submitted event data
- **Shared helpers** used by API routes (e.g., env loading)

### Key environment variables

- `GEMINI_API_KEY` (server-only)
- Firebase web config (client + server routes currently use the Firebase web SDK):
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

See `/.env.example`.

