import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createFlyer } from '@/services/flyers';

export async function uploadFlyer(args: { file: File }) {
  const { file } = args;

  // 1. Upload to Firebase Storage
  const timestamp = Date.now();
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `flyers/${timestamp}_${safeFilename}`;
  const storageRef = ref(storage, storagePath);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const uploadResult = await uploadBytes(storageRef, buffer, {
    contentType: file.type || 'application/octet-stream',
  });

  const downloadURL = await getDownloadURL(uploadResult.ref);

  // 2. Create Firestore Record
  const flyerId = await createFlyer({
    originalFilename: file.name,
    storagePath,
    downloadURL,
    status: 'uploaded',
    uploader: 'anonymous', // MVP
  });

  return { flyerId, downloadURL, storagePath };
}

