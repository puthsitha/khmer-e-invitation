import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./client";

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}
