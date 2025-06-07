"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  // don’t flash anything while the session is loading
  if (status === "loading") return null;

  return !session ? (
    <button
      onClick={() => signIn("google")}
      className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
    >
      Sign in&nbsp;with Google
    </button>
  ) : (
    <button
      onClick={() => signOut()}
      className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
    >
      Sign out&nbsp;({session.user?.email})
    </button>
  );
}
