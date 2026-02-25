# Firebase & Firestore Documentation
## Real Documentation from Context7

**Last Updated:** February 16, 2026  
**Source:** Firebase Official Docs (firebase.google.com)

---

## Overview

Firebase is a comprehensive platform for building web and mobile applications. For our MVP, we're using:
- **Firestore:** NoSQL real-time database
- **Firebase Storage:** Image/file hosting
- **Firebase Auth:** (Future - not in MVP)

---

## Installation

```bash
npm install firebase
```

**Package Name:** `firebase` (official Firebase SDK v9+)

---

## Firebase Project Setup

### 1. Create Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "scavenger-food-finder" (or similar)
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

### 2. Get Firebase Config
1. In Firebase Console, click gear icon → Project settings
2. Scroll to "Your apps" section
3. Click Web icon (</>) to add web app
4. Register app nickname: "Scavenger Web"
5. Copy the `firebaseConfig` object

### 3. Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef
```

**Note:** These are prefixed with `NEXT_PUBLIC_` because they're used client-side.

---

## Initialization (Next.js)

Create `lib/firebase.ts`:

```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

**Usage in any component:**
```typescript
import { db } from '@/lib/firebase';
```

---

## Firestore: Core Operations

### 1. **Add Document with Auto-Generated ID**

```typescript
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function createPost(postData) {
  try {
    // Create document reference with auto-generated ID
    const postRef = doc(collection(db, 'posts'));
    
    // Set document data
    await setDoc(postRef, {
      ...postData,
      status: 'available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Post created with ID:', postRef.id);
    return { success: true, id: postRef.id };
    
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Usage
const newPost = {
  eventName: 'CS Club Pizza Social',
  location: { building: 'TMCB', room: '210' },
  dateTime: {
    start: new Date('2026-02-17T17:00:00'),
    end: new Date('2026-02-17T19:00:00')
  },
  foodDescription: '3 large pizzas',
  estimatedPortions: 20
};

await createPost(newPost);
```

---

### 2. **Read a Single Document**

```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getPost(postId: string) {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    
    if (postDoc.exists()) {
      return {
        id: postDoc.id,
        ...postDoc.data()
      };
    } else {
      console.log('Post not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}
```

---

### 3. **Query Documents with Filters**

```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getAvailablePosts() {
  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'available'),
      where('dateTime.start', '>=', new Date()),
      orderBy('dateTime.start', 'asc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${posts.length} available posts`);
    return posts;
    
  } catch (error) {
    console.error('Error querying posts:', error);
    throw error;
  }
}
```

---

### 4. **Real-Time Listener (CRITICAL FOR OUR FEED!)**

```typescript
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function listenToAvailablePosts(callback) {
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'available'),
    orderBy('dateTime.start', 'asc')
  );
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const posts = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('New post:', change.doc.data());
        }
        if (change.type === 'modified') {
          console.log('Modified post:', change.doc.data());
        }
        if (change.type === 'removed') {
          console.log('Removed post:', change.doc.id);
        }
      });
      
      // Get all docs
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      
      callback(posts);
    },
    (error) => {
      console.error('Listener error:', error);
    }
  );
  
  // Return unsubscribe function to stop listening
  return unsubscribe;
}

// Usage in React component
import { useEffect, useState } from 'react';

function FeedComponent() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const unsubscribe = listenToAvailablePosts((updatedPosts) => {
      setPosts(updatedPosts);
    });
    
    // Cleanup on unmount
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

**This is HUGE:** Firestore automatically pushes updates to all connected clients in real-time!

---

### 5. **Update Document (Mark as Gone)**

```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function markPostAsGone(postId: string) {
  try {
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      status: 'gone',
      updatedAt: serverTimestamp()
    });
    
    console.log('Post marked as gone');
    return { success: true };
    
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}
```

---

### 6. **Delete Document (If Needed)**

```typescript
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function deletePost(postId: string) {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    console.log('Post deleted');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}
```

---

## Firebase Storage: Image Uploads

### Upload Image

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

async function uploadFlyerImage(file: File, postId: string) {
  try {
    // Create storage reference
    const storageRef = ref(storage, `flyers/${postId}/${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload complete:', snapshot);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('File available at:', downloadURL);
    
    return downloadURL;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Usage
const imageUrl = await uploadFlyerImage(fileObject, 'post123');
// Store imageUrl in Firestore document
```

---

## Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Posts collection
    match /posts/{postId} {
      // Anyone can read posts
      allow read: if true;
      
      // Only allow writes from server (via Admin SDK)
      // For MVP, allow all writes (we'll restrict in Phase 2)
      allow write: if true;
      
      // Production rule (Phase 2):
      // allow write: if request.auth != null;
    }
  }
}
```

**For MVP:** Allow all reads/writes (we're serverless, no auth)  
**Phase 2:** Add authentication and restrict writes

---

## Firestore Indexes

Some queries require composite indexes. Firebase will tell you when you need one!

**Example error:**
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

Click the link to auto-create the index. Common indexes we'll need:

1. `status` (ascending) + `dateTime.start` (ascending)
2. `location.building` (ascending) + `status` (ascending)

---

## Data Model for Our Posts

```typescript
interface Post {
  id: string;                    // Auto-generated
  createdAt: Timestamp;          // Server timestamp
  updatedAt: Timestamp;
  
  eventName: string;
  location: {
    building: string;
    room: string;
  };
  dateTime: {
    start: Timestamp;            // Convert Date to Firestore Timestamp
    end: Timestamp;
  };
  foodDescription: string;
  estimatedPortions?: number;
  dietaryInfo?: string[];
  
  status: 'available' | 'gone';
  imageUrl?: string;             // Firebase Storage URL
  uploaderEditKey: string;       // UUID for no-auth editing
  source: 'flyer_photo' | 'manual';
}
```

**Converting Dates:**
```typescript
import { Timestamp } from 'firebase/firestore';

const startDate = new Date('2026-02-17T17:00:00');
const firestoreTimestamp = Timestamp.fromDate(startDate);
```

---

## Rate Limits & Quotas (Free Tier)

- **Reads:** 50,000 per day
- **Writes:** 20,000 per day
- **Deletes:** 20,000 per day
- **Storage:** 5 GB
- **Download:** 1 GB per day

For MVP (30-50 posts/week), we're well within limits!

---

## Best Practices

### 1. **Use Server Timestamps**
Always use `serverTimestamp()` instead of `new Date()`:
```typescript
createdAt: serverTimestamp()  // ✅ Good - uses server time
createdAt: new Date()         // ❌ Avoid - uses client time (can be wrong)
```

### 2. **Batch Operations**
If updating multiple documents:
```typescript
import { writeBatch, doc } from 'firebase/firestore';

const batch = writeBatch(db);
batch.update(doc(db, 'posts', 'post1'), { status: 'gone' });
batch.update(doc(db, 'posts', 'post2'), { status: 'gone' });
await batch.commit();
```

### 3. **Unsubscribe from Listeners**
Always cleanup listeners to avoid memory leaks:
```typescript
useEffect(() => {
  const unsubscribe = listenToAvailablePosts(setPosts);
  return () => unsubscribe(); // Cleanup!
}, []);
```

---

## Testing Checklist

Before building:
- [ ] Create Firebase project
- [ ] Add web app to project
- [ ] Copy config to `.env.local`
- [ ] Test Firestore write (create document)
- [ ] Test Firestore read (query documents)
- [ ] Test real-time listener (see live updates)
- [ ] Test Firebase Storage upload
- [ ] Set up Firestore security rules

---

## Key Takeaways

✅ **Firestore has real-time updates out of the box**  
✅ **NPM package: `firebase` (v9+ modular SDK)**  
✅ **No backend needed - direct client→Firestore**  
✅ **Free tier is generous (50k reads/day)**  
✅ **Security rules control access**  
✅ **Works seamlessly with Next.js**  
✅ **Firebase Storage for images**

---

**This is production-ready and exactly matches our architecture!** 🎉
