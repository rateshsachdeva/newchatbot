'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  if (status === "loading") return null;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <h1 className="text-center text-2xl font-semibold">Sign In</h1>
      <p className="text-center text-sm text-gray-500">
        Use Google or your e-mail and password to sign in
      </p>

      <GoogleSignInButton />

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-500">or</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <CredentialsForm callbackUrl={callbackUrl} />
    </div>
  );
}

function CredentialsForm({ callbackUrl }: { callbackUrl: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    const password = form.password.value;

    setLoading(true);

    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl,
      });
    } catch (error) {
      console.error("Login error", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input name="email" type="email" required placeholder="Email" />
      <input name="password" type="password" required placeholder="Password" />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
