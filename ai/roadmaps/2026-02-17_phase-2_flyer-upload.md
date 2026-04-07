# Phase 2 — Flyer Upload (MVP)

## Goal
Allow a user to upload a flyer photo from mobile/desktop. Store the image in Firebase Storage and create a Firestore record referencing it. Display recent uploads.

## Requirements

### Upload UI
- Create an Upload page (mobile-first).
- User can select an image (camera roll / file picker).
- Show a preview before upload.
- Show upload progress + success/error states.
- Disable submit while uploading.

### Backend / API
- Use a Next.js API route to accept an upload request.
- Upload image bytes to Firebase Storage.
- Generate a public (or signed) URL for the file.
- Create a Firestore document in `flyers` with fields below.

### Firestore Data Model (flyers collection)
Create a document per upload:
- id (auto)
- createdAt (server timestamp)
- originalFilename (string)
- storagePath (string)
- downloadURL (string)
- status (string) = "uploaded"
- uploader (string) optional (can be "anonymous" for MVP)

### Display Recent Uploads
- On the upload page, show a list of the 10 most recent uploads (newest first)
- Each item shows:
  - thumbnail or image
  - createdAt
  - status

## Acceptance Criteria
- From a fresh clone:
  - user can run `npm run dev`
  - upload works locally
  - Firebase Storage contains the file
  - Firestore contains a new flyer doc with correct fields
  - UI shows the uploaded flyer in Recent Uploads list
- No secrets are committed
- Errors are handled cleanly

## Notes / Constraints
- No auth required for MVP.
- Use environment variables for Firebase config.
- Keep code clean and layered (UI vs services).
