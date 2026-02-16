# Coding Style Guide: Scavenger

**Last Updated:** February 16, 2026  
**Applies To:** All JavaScript/TypeScript code in this project

---

## Philosophy

1. **Clarity over cleverness** — Code should be obvious, not clever
2. **Consistency over personal preference** — Follow the established patterns
3. **Simple over complex** — Choose the straightforward solution
4. **Mobile-first always** — Test on phone, not just desktop

---

## Language & Framework

### TypeScript
- Use TypeScript for all new files (`.ts`, `.tsx`)
- Avoid `any` type — use `unknown` if truly unknown
- Prefer interfaces over type aliases for objects
- Enable strict mode in `tsconfig.json`

```typescript
// ✅ Good
interface Post {
  id: string;
  eventName: string;
}

// ❌ Avoid
type Post = {
  id: any; // Never use 'any'
  eventName: string;
};
```

---

## File Structure

### Naming Conventions

- **Components:** PascalCase (e.g., `FoodFeed.tsx`, `UploadForm.tsx`)
- **Utilities:** camelCase (e.g., `formatDate.ts`, `uploadImage.ts`)
- **API Routes:** kebab-case (e.g., `api/upload-flyer.ts`)
- **Constants:** SCREAMING_SNAKE_CASE in a `constants.ts` file

```
src/
├── components/
│   ├── FoodFeed.tsx
│   ├── EventCard.tsx
│   └── UploadForm.tsx
├── lib/
│   ├── gemini.ts
│   ├── firebase.ts
│   └── formatDate.ts
├── app/
│   ├── page.tsx
│   └── api/
│       ├── upload.ts
│       └── posts.ts
└── types/
    └── index.ts
```

---

## React Components

### Functional Components Only
- Use function declarations, not arrow functions for components
- Use TypeScript interfaces for props

```typescript
// ✅ Good
interface EventCardProps {
  event: Post;
  onMarkGone: (id: string) => void;
}

export default function EventCard({ event, onMarkGone }: EventCardProps) {
  return <div>{event.eventName}</div>;
}

// ❌ Avoid
export const EventCard = ({ event, onMarkGone }) => { ... };
```

---

### Hooks
- Use hooks at the top of the component
- Custom hooks start with `use` (e.g., `useFeedData.ts`)
- Avoid more than 3-4 hooks in one component (refactor if needed)

```typescript
export default function FoodFeed() {
  // All hooks at the top
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data
  }, []);
  
  // Return JSX
  return <div>...</div>;
}
```

---

### State Management
- Use `useState` for component-local state
- Use Context API for shared state (avoid prop drilling)
- No Redux/Zustand for MVP (keep it simple)

---

## Styling

### Tailwind CSS
- Use Tailwind utility classes (avoid custom CSS when possible)
- Mobile-first breakpoints: `sm:`, `md:`, `lg:`
- Group related utilities with `@apply` only for repeated patterns

```tsx
// ✅ Good
<div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Event Name</h1>
</div>

// ❌ Avoid inline styles
<div style={{ maxWidth: '400px', margin: '0 auto' }}>...</div>
```

---

### Responsive Design
- Default styles = mobile (375px width)
- Add `sm:` for tablet (640px+)
- Add `md:` for desktop (768px+)

```tsx
<button className="
  w-full py-3 text-base    /* Mobile: full width */
  sm:w-auto sm:px-6        /* Tablet: auto width */
  md:text-lg               /* Desktop: larger text */
">
  Post Food
</button>
```

---

## Data Fetching

### API Calls
- Use native `fetch` (no axios for MVP)
- Always handle errors with try/catch
- Show loading states

```typescript
// ✅ Good
async function uploadFlyer(image: File) {
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    setError('Failed to upload flyer');
  } finally {
    setLoading(false);
  }
}
```

---

### Firestore Queries
- Use TypeScript types for documents
- Unsubscribe from listeners in useEffect cleanup
- Handle loading and error states

```typescript
useEffect(() => {
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'available'),
    orderBy('dateTime.start', 'asc'),
    limit(50)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
    setPosts(posts);
  });
  
  return () => unsubscribe(); // Cleanup
}, []);
```

---

## Error Handling

### User-Facing Errors
- Show clear, actionable error messages
- Avoid technical jargon ("OCR failed" → "Couldn't read the flyer")

```typescript
// ✅ Good
if (!response.ok) {
  throw new Error('Couldn't upload the flyer. Please try again.');
}

// ❌ Avoid
if (!response.ok) {
  throw new Error('HTTP 500: Internal Server Error');
}
```

---

### Backend Errors
- Log detailed errors to console for debugging
- Return generic messages to client (no stack traces)

```typescript
// API route
try {
  const result = await gemini.extractFlyer(image);
  return res.json({ success: true, data: result });
} catch (error) {
  console.error('Gemini API error:', error); // Detailed log
  return res.status(500).json({ 
    success: false, 
    error: 'Could not process image' // Generic message
  });
}
```

---

## Comments

### When to Comment
- Complex logic that isn't obvious
- Why something is done a certain way (not what it does)
- TODOs for future improvements

```typescript
// ✅ Good
// Gemini API sometimes returns AM/PM in lowercase, normalize it
const time = rawTime.toUpperCase();

// ❌ Unnecessary
// Convert time to uppercase
const time = rawTime.toUpperCase();
```

---

### JSDoc for Functions
- Add JSDoc for exported utility functions
- Include examples if the function is non-trivial

```typescript
/**
 * Formats a Firestore timestamp into a human-readable string
 * @param timestamp - Firestore Timestamp object
 * @returns Formatted string like "Today, 5:00 PM" or "Tomorrow, 9:00 AM"
 * 
 * @example
 * formatEventTime(timestamp) // "Today, 5:00 PM"
 */
export function formatEventTime(timestamp: Timestamp): string {
  // ...
}
```

---

## Testing (Future)

### Unit Tests
- Test utilities and pure functions
- Use Jest + React Testing Library
- Filename: `*.test.ts` or `*.test.tsx`

### E2E Tests (Phase 2)
- Use Playwright for critical flows
- Test: Upload flyer → View in feed → Mark as gone

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

### Examples
```
feat(upload): Add AI-powered flyer extraction

Integrate Gemini 2.0 Flash API to extract event details
from uploaded flyer images. Includes human verification step.

---

fix(feed): Correct timezone handling for event times

Events were showing in UTC instead of local time.
Now correctly converts Firestore timestamps to Mountain Time.

---

docs(readme): Add setup instructions for local development
```

---

## Code Review Checklist

Before submitting a PR, verify:
- [ ] Code follows this style guide
- [ ] TypeScript types are correct (no `any`)
- [ ] Mobile-responsive (tested on 375px width)
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] No console.logs left in production code
- [ ] Comments explain "why" not "what"

---

## Performance Best Practices

### Images
- Compress images before upload (client-side)
- Use Next.js `<Image>` component (automatic optimization)
- Lazy load off-screen images

### Bundle Size
- Avoid large libraries (prefer native APIs)
- Code-split heavy components with `next/dynamic`
- Tree-shake unused Tailwind classes in production

### Firestore
- Index frequently queried fields
- Use pagination (don't load all posts at once)
- Unsubscribe from listeners when components unmount

---

## Accessibility

### Minimum Requirements
- All images have `alt` text
- Buttons have descriptive labels (no "Click here")
- Form inputs have associated `<label>` tags
- Keyboard navigation works (test with Tab key)
- Color contrast ratio ≥ 4.5:1 (WCAG AA)

```tsx
// ✅ Good
<button 
  aria-label="Upload flyer photo"
  className="bg-blue-500 text-white px-4 py-2"
>
  📷 Upload
</button>

// ❌ Avoid
<button className="bg-blue-200 text-blue-300">
  Click here
</button>
```

---

## Environment Variables

### Naming
- Prefix public vars with `NEXT_PUBLIC_`
- Use SCREAMING_SNAKE_CASE
- Never commit `.env.local` (gitignored)

```bash
# .env.local
GEMINI_API_KEY=secret_key              # Server-side only
NEXT_PUBLIC_FIREBASE_API_KEY=public    # Client-side accessible
```

### Usage
```typescript
// Server-side (API route)
const apiKey = process.env.GEMINI_API_KEY;

// Client-side (React component)
const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
```

---

## Common Patterns

### Date/Time Formatting
```typescript
// Use date-fns for consistent formatting
import { format, isToday, isTomorrow } from 'date-fns';

export function formatEventTime(date: Date): string {
  if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
}
```

### Loading States
```tsx
if (loading) {
  return <div className="animate-pulse">Loading...</div>;
}

if (error) {
  return <div className="text-red-500">{error}</div>;
}

return <div>{/* Actual content */}</div>;
```

---

## Tools & Linting

### Required
- ESLint (auto-fix on save)
- Prettier (consistent formatting)
- TypeScript strict mode

### Recommended VSCode Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Error Lens

---

## Anti-Patterns (Avoid These)

❌ **Prop drilling more than 2 levels** → Use Context  
❌ **Inline functions in JSX** → Define outside render  
❌ **Mutating state directly** → Always use `setState`  
❌ **Fetching in render** → Use `useEffect` or server-side  
❌ **Hardcoded strings** → Use constants file  
❌ **Magic numbers** → Name them (`const MAX_FILE_SIZE = 10_000_000`)

---

**When in doubt, prioritize readability. Code is read 10x more than it's written.**
