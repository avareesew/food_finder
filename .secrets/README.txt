Place your Firebase service account JSON in this folder (any filename is fine).

Set FIREBASE_SERVICE_ACCOUNT_PATH in .env to match, e.g.:

  .secrets/food-finder-b392a-firebase-adminsdk-fbsvc-e495e9deee.json

Download from Firebase Console → Project settings → Service accounts → Generate new private key.

This folder is listed in .gitignore — do not commit keys.
