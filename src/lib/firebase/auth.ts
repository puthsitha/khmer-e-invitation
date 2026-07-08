import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./client";
import { createUserDocIfMissing } from "./firestore";

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await createUserDocIfMissing({ uid: credential.user.uid, name, email });
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  await createUserDocIfMissing({
    uid: credential.user.uid,
    name: credential.user.displayName ?? "",
    email: credential.user.email ?? "",
  });
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}
