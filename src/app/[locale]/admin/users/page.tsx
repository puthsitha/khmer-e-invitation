"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { listAllUsers, setUserStatus } from "@/lib/firebase/firestore";
import type { AppUser } from "@/types";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    listAllUsers().then(setUsers);
  }, []);

  async function toggleSuspended(u: AppUser) {
    await setUserStatus(u.uid, { suspended: !u.suspended });
    setUsers((prev) =>
      prev.map((x) => (x.uid === u.uid ? { ...x, suspended: !x.suspended } : x)),
    );
  }

  async function toggleRole(u: AppUser) {
    const role = u.role === "admin" ? "user" : "admin";
    await setUserStatus(u.uid, { role });
    setUsers((prev) => prev.map((x) => (x.uid === u.uid ? { ...x, role } : x)));
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-[family-name:var(--font-heading-km)] text-2xl text-maroon">
        Users
      </h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gold/30 text-foreground/60">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.uid} className="border-b border-gold/10">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.suspended ? "Suspended" : "Active"}</td>
              <td className="flex gap-2 py-2">
                <button
                  type="button"
                  onClick={() => toggleSuspended(u)}
                  disabled={u.uid === currentUser?.uid}
                  className="rounded-full border border-gold/60 px-3 py-1 text-xs text-maroon disabled:opacity-40"
                >
                  {u.suspended ? "Reinstate" : "Suspend"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleRole(u)}
                  disabled={u.uid === currentUser?.uid}
                  className="rounded-full border border-gold/60 px-3 py-1 text-xs text-maroon disabled:opacity-40"
                >
                  {u.role === "admin" ? "Demote" : "Make admin"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
