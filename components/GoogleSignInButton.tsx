"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";          // already in template deps

export default function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
    >
      <FcGoogle className="text-xl" />
      Sign in with Google
    </button>
  );
}
