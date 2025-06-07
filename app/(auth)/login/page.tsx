/* app/(auth)/login/page.tsx
   ────────────────────────────────────────────────────────────────
   Custom sign-in screen that offers:
     • Google OAuth  (one-click)
     • Optional e-mail / password form
*/

import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

/* ----------  Page wrapper (Server Component)  ---------- */
export default async function LoginPage() {
  // If already logged-in, bounce to home
  const session = await auth();
  if (session?.user) redirect("/");

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
  "use client";

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
