// ============================================
// Firestore CRUD Helpers (With In-Memory Index-Free Filtering)
// ============================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './config';

// ---- Generic CRUD ----

export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  try {
    const ref = collection(db, collectionName);
    const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (T & { id: string })[];
  } catch (error: any) {
    console.warn(`[Firestore] Read note for collection "${collectionName}":`, error?.message || error);
    return [];
  }
}

export async function getDocument<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  try {
    const ref = doc(db, collectionName, docId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
  } catch (error: any) {
    console.warn(`[Firestore] Read note for document "${collectionName}/${docId}":`, error?.message || error);
    return null;
  }
}

export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, {
    ...data,
    published: (data as any).published !== undefined ? (data as any).published : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const ref = doc(db, collectionName, docId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const ref = doc(db, collectionName, docId);
  await deleteDoc(ref);
}

// ---- Published Content Helpers (Index-Free & Instant) ----

export async function getPublishedDocuments<T extends DocumentData>(
  collectionName: string,
  orderField: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<(T & { id: string })[]> {
  try {
    const all = await getDocuments<T>(collectionName);
    if (!all || all.length === 0) return [];
    
    // Filter published (published !== false)
    const publishedOnly = all.filter((item: any) => item.published !== false);

    // Sort in memory to avoid needing composite Firestore indexes
    return publishedOnly.sort((a: any, b: any) => {
      let valA = a[orderField];
      let valB = b[orderField];

      // Handle Firestore timestamps if present
      if (valA && typeof valA.toMillis === 'function') valA = valA.toMillis();
      if (valB && typeof valB.toMillis === 'function') valB = valB.toMillis();

      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (orderDirection === 'desc') {
        return valB > valA ? 1 : valB < valA ? -1 : 0;
      }
      return valA > valB ? 1 : valA < valB ? -1 : 0;
    });
  } catch (err) {
    console.warn(`[Firestore] getPublishedDocuments failed for ${collectionName}:`, err);
    return [];
  }
}

export async function getRecentDocuments<T extends DocumentData>(
  collectionName: string,
  count: number = 6
): Promise<(T & { id: string })[]> {
  const docs = await getPublishedDocuments<T>(collectionName, 'createdAt', 'desc');
  return docs.slice(0, count);
}

// ---- Enquiry Helpers ----

export async function submitEnquiry(data: {
  name: string;
  phone: string;
  email: string;
  course: string;
  instrument: string;
  contactMethod: string;
  message: string;
}): Promise<string> {
  return addDocument('enquiries', {
    ...data,
    status: 'new',
  });
}

// ---- Site Settings ----

export async function getSiteSettings() {
  try {
    const docSnap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (docSnap.exists()) return docSnap.data();
    return null;
  } catch {
    return null;
  }
}

export async function updateSiteSettings(data: Record<string, unknown>) {
  const ref = doc(db, 'siteSettings', 'main');
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    // If doc doesn't exist, create it
    const { setDoc } = await import('firebase/firestore');
    await setDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

// Re-export query helpers for direct use
export { where, orderBy, limit, collection, query };
