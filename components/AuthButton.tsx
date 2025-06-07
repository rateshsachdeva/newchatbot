"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  // read the current session (undefined while loading)
  const { data: session, status } = useSession();

  // show nothing until the session query finishes
  if (status === "loading") return null;

  return !session ? (
    <button
      onClick={() => signIn("google")}
      className="rounded-lg border px-4 py-2 hover:bg-gray-100"
    >
      Sign in with Google
    </button>
  ) : (
    <button
      onClick={() => signOut()}
      className="rounded-lg border px-4 py-2 hover:bg-gray-100"
    >
      Sign out&nbsp;({session.user?.email})
    </button>
  );
}
