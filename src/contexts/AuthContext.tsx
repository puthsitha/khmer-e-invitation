"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { auth } from "@/lib/firebase/client";
import { getUserDoc } from "@/lib/firebase/firestore";
import type { AppUser } from "@/types";

export const AUTH_USER_KEY = "khmer_einvitation_user";

interface AuthContextValue {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  appUser: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Immediately rehydrate cached user profile from localStorage on client mount
    let cachedAppUser: AppUser | null = null;
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        cachedAppUser = JSON.parse(stored) as AppUser;
        setAppUser(cachedAppUser);
      }
    } catch {
      // Ignore storage read errors
    }

    // 2. Listen to Firebase auth state changes
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // If we already have a matching cached user profile, unblock loading immediately
        if (cachedAppUser && cachedAppUser.uid === firebaseUser.uid) {
          setLoading(false);
        }

        try {
          const doc = await getUserDoc(firebaseUser.uid);
          setAppUser(doc);
          if (doc) {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(doc));
          } else {
            localStorage.removeItem(AUTH_USER_KEY);
          }
        } catch {
          // If offline or error, retain cachedAppUser if available
        } finally {
          setLoading(false);
        }
      } else {
        setAppUser(null);
        try {
          localStorage.removeItem(AUTH_USER_KEY);
        } catch {
          // Ignore storage error
        }
        setLoading(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
