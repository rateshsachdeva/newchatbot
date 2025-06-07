"use client";                           // 🔑  make the whole file a client component

/* app/(auth)/login/page.tsx
   ────────────────────────────────────────────────────────────────
   Custom sign-in screen that offers:
     • Google OAuth  (one-click)
     • Optional e-mail / password form
*/

import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

import GoogleSignInButton from "@/components/GoogleSignInButton";

/* ----------  Page component (client)  ---------- */
export default function LoginPage() {
  // redirect if already logged-in
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/"); // bounce to home
    }
  }, [status, router]);

  // while session is loading just show nothing
  if (status === "loading") return null;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <h1 className="text-center text-2xl font-semibold">Sign In</h1>
      <p className="text-center text-sm text-gray-500">
        Use Google or your e-mail and password to sign in
      </p>

      {/* ─── Google OAuth button ─────────────────────────── */}
      <GoogleSignInButton />

      {/* separator line */}
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-500">or</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      {/* ─── Email / Password form ───────────────────────── */}
      <CredentialsForm />
    </div>
  );
}

/* ----------  Client sub-component for creds form  ---------- */
function CredentialsForm() {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="user@acme.com"
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/60"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black/60"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
