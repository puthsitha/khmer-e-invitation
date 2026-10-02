import {
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "./client";

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

/**
 * Checks whether an email address is registered in the system.
 * Checks email_lookup index, Cloud Firestore 'users' collection, and Firebase Authentication methods.
 */
export async function checkEmailRegistered(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  // 1. Check in 'email_lookup' dedicated collection if available
  try {
    const lookupRef = doc(db, "email_lookup", normalized);
    const lookupSnap = await getDoc(lookupRef);
    if (lookupSnap.exists()) {
      return true;
    }
  } catch (lookupErr) {
    // Fall through to users collection check
  }

  // 2. Check in Cloud Firestore 'users' collection
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", normalized), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return true;
    }

    if (email.trim() !== normalized) {
      const qExact = query(
        usersRef,
        where("email", "==", email.trim()),
        limit(1)
      );
      const snapExact = await getDocs(qExact);
      if (!snapExact.empty) {
        return true;
      }
    }
  } catch (error) {
    console.warn("[checkEmailRegistered] Firestore check error:", error);
  }

  // 2. Check in Firebase Authentication
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email.trim());
    if (methods && methods.length > 0) {
      return true;
    }
  } catch (error) {
    console.warn("[checkEmailRegistered] fetchSignInMethodsForEmail error:", error);
  }

  return false;
}
