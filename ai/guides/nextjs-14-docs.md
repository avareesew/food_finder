# Next.js 14 Documentation
## Real Documentation from Context7

**Last Updated:** February 16, 2026  
**Source:** Next.js Official Docs (nextjs.org) - Version 14.3.0  
**GitHub:** vercel/next.js

---

## Overview

Next.js is a React framework for building full-stack web applications with:
- File-based routing (App Router)
- Server-side rendering (SSR)
- API routes (serverless functions)
- Image optimization
- Zero-config deployment to Vercel

**We're using:** Next.js 14 with App Router (modern pattern)

---

## Installation

```bash
npx create-next-app@latest scavenger-app
```

**Interactive prompts:**
- TypeScript? → Yes
- ESLint? → Yes
- Tailwind CSS? → Yes
- `src/` directory? → No (use `app/` directly)
- App Router? → Yes ✅
- Customize import alias? → No

This creates a Next.js 14 project with App Router.

---

## Project Structure (App Router)

```
scavenger-app/
├── app/
│   ├── page.tsx              # Home page (/)
│   ├── layout.tsx            # Root layout
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts      # API: POST /api/upload
│   │   └── posts/
│   │       └── route.ts      # API: GET /api/posts
│   └── globals.css           # Global styles
├── public/
│   └── images/               # Static assets
├── lib/
│   ├── firebase.ts           # Firebase init
│   └── gemini.ts             # Gemini API helpers
├── components/
│   ├── FeedComponent.tsx
│   └── UploadForm.tsx
├── .env.local                # Environment variables
├── next.config.js            # Next.js config
├── package.json
└── tsconfig.json
```

---

## API Routes (Serverless Functions)

### Create API Route: `/api/upload`

**File:** `app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Process image (convert to base64, etc.)
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    // TODO: Call Gemini API here
    
    return NextResponse.json({
      success: true,
      data: { message: 'Image uploaded' }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Key points:**
- File name MUST be `route.ts` (not `index.ts`)
- Export HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Use `NextRequest` and `NextResponse` types
- Runs as serverless function (no Express needed!)

---

### Create API Route: `/api/posts`

**File:** `app/api/posts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // TODO: Query Firestore for posts
    
    const posts = [
      { id: '1', eventName: 'CS Club Pizza' },
      { id: '2', eventName: 'Pre-Med Bagels' }
    ];
    
    return NextResponse.json({
      success: true,
      posts
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
```

---

## File Uploads: Client Side

**Component:** `components/UploadForm.tsx`

```typescript
'use client';

import { FormEvent, useState } from 'react';

export default function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(event.currentTarget);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData, // Send as multipart/form-data
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      console.log('Upload success:', data);
      // Handle success (redirect, show confirmation, etc.)
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="image" className="block text-sm font-medium">
          Upload Flyer Photo
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="mt-1 block w-full"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </form>
  );
}
```

**Key points:**
- Add `'use client';` at top (client component)
- `FormData` automatically handles file uploads
- `accept="image/*"` restricts to images only
- `capture="environment"` (optional) opens camera on mobile

---

## Image Optimization

Next.js has built-in image optimization with the `<Image>` component:

```typescript
import Image from 'next/image';

export default function EventCard({ post }) {
  return (
    <div>
      <Image
        src={post.imageUrl}
        alt={post.eventName}
        width={400}
        height={300}
        className="rounded-lg"
        priority={false} // Set true for above-fold images
      />
      <h2>{post.eventName}</h2>
    </div>
  );
}
```

**Benefits:**
- Automatic lazy loading
- Responsive images
- WebP conversion (smaller files)
- Prevents layout shift

---

## Server Components vs Client Components

### Server Components (Default)
- Render on server
- No JavaScript sent to client
- Can directly access databases/APIs
- **Cannot use hooks** (useState, useEffect, etc.)

```typescript
// app/page.tsx (server component by default)
export default async function HomePage() {
  // Can directly query database here!
  const posts = await fetchPostsFromFirestore();
  
  return <div>{/* Render posts */}</div>;
}
```

### Client Components
- Add `'use client';` at top
- Can use React hooks
- Interactive elements (buttons, forms)

```typescript
'use client';

import { useState } from 'react';

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

**Rule of thumb:**
- Default to server components
- Use client components only when you need interactivity or hooks

---

## Environment Variables

**File:** `.env.local` (gitignored automatically)

```bash
# Gemini API
GEMINI_API_KEY=your_key_here

# Firebase (client-side, so prefix with NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
# ... other Firebase vars
```

**Usage:**

Server-side (API routes):
```typescript
const apiKey = process.env.GEMINI_API_KEY;
```

Client-side (components):
```typescript
const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
```

**Important:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser!

---

## Deployment to Vercel

### Method 1: GitHub Integration (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Click "Deploy"

**Automatic deployments:**
- Push to `main` → deploys to production
- Push to any branch → creates preview deployment
- Pull requests get unique preview URLs

### Method 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel deploy
```

### Environment Variables in Vercel

1. Go to Vercel dashboard → your project
2. Settings → Environment Variables
3. Add each variable:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - etc.
4. Redeploy for changes to take effect

---

## Next.js Config

**File:** `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from Firebase Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
```

---

## Common Patterns for Our MVP

### 1. **Fetching Data in Server Component**

```typescript
// app/page.tsx
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default async function HomePage() {
  // Fetch on server (no client JS needed!)
  const postsSnapshot = await getDocs(collection(db, 'posts'));
  const posts = postsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.eventName}</div>
      ))}
    </div>
  );
}
```

### 2. **Real-Time Updates in Client Component**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function FeedComponent() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'posts'),
      (snapshot) => {
        const updatedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(updatedPosts);
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.eventName}</div>
      ))}
    </div>
  );
}
```

---

## Tailwind CSS (Built-in)

Tailwind is pre-configured in Next.js 14. Use utility classes:

```typescript
export default function Button() {
  return (
    <button className="
      px-4 py-2 
      bg-blue-500 hover:bg-blue-600 
      text-white font-semibold 
      rounded-lg shadow-md
      transition-colors duration-200
    ">
      Click Me
    </button>
  );
}
```

**Mobile-first responsive:**
```typescript
<div className="
  text-sm        /* Mobile: small text */
  sm:text-base   /* Tablet: normal text */
  md:text-lg     /* Desktop: large text */
">
  Responsive text
</div>
```

---

## TypeScript Support

Next.js has first-class TypeScript support. Types for common patterns:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// API Route
export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json();
  return NextResponse.json({ success: true });
}

// Component Props
interface EventCardProps {
  event: {
    id: string;
    eventName: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  return <div>{event.eventName}</div>;
}
```

---

## Development Workflow

```bash
# Start dev server
npm run dev
# Opens http://localhost:3000

# Build for production (test locally)
npm run build
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Key Differences from Pages Router (Old Pattern)

We're using **App Router** (new), not Pages Router (old):

| Feature | Pages Router (Old) | App Router (New) ✅ |
|---------|-------------------|-------------------|
| Directory | `pages/` | `app/` |
| API Routes | `pages/api/` | `app/api/` |
| File Names | `index.tsx` | `page.tsx` |
| Layouts | Manual HOC | `layout.tsx` |
| Server Components | No | Yes (default) |
| Data Fetching | `getServerSideProps` | Direct `async` components |

**We're using App Router everywhere in our project!**

---

## Testing Checklist

Before building:
- [ ] Create Next.js project with `create-next-app`
- [ ] Verify App Router is enabled (check for `app/` folder)
- [ ] Test dev server runs (`npm run dev`)
- [ ] Create test API route and verify it works
- [ ] Test file upload from client to API
- [ ] Deploy to Vercel (test production build)

---

## Key Takeaways

✅ **Next.js 14 with App Router is production-ready**  
✅ **Built-in API routes (serverless functions)**  
✅ **File uploads work with FormData**  
✅ **Server components reduce client JS**  
✅ **Image optimization is automatic**  
✅ **Zero-config Vercel deployment**  
✅ **TypeScript and Tailwind pre-configured**

---

**This is production-ready and exactly matches our architecture!** 🎉
