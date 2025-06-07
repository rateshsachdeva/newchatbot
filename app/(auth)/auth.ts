// app/(auth)/auth.ts
//-------------------------------------------------------------------
// Next-Auth v5 configuration for:
// • Google OAuth (loads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET automatically)
// • Optional e-mail/password credentials login
// • Optional anonymous “guest” login
// • JWT sessions (no DB needed for session storage)
//-------------------------------------------------------------------

import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { createGuestUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";
import { DUMMY_PASSWORD } from "@/lib/constants";
import type { DefaultJWT } from "next-auth/jwt";

/* ------------------------------------------------------------------
   Extra typings so `session.user` carries `id` + `type`
------------------------------------------------------------------- */
export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: { id: string; type: UserType } & DefaultSession["user"];
  }
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    password?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

/* ------------------------------------------------------------------
   Auth.js (Next-Auth v5) setup
------------------------------------------------------------------- */
export const {
  GET,          // for App Router route handler re-export
  POST,
  auth,         // `auth()` helper in server components
  signIn,
  signOut,
} = NextAuth({
  ...authConfig, // keep whatever pages / theme settings you already had

  // ---------- Providers ----------------------------------------------------
  providers: [
    /* Google OAuth 2.0 */
    Google,

    /* Email + password (remove if you don’t need it) */
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        /* `creds` is Record<string, unknown> | undefined in v5 */
        const email = (creds?.email as string | undefined) ?? "";
        const password = (creds?.password as string | undefined) ?? "";

        if (!email || !password) return null;

        const users = await getUser(email);
        if (users.length === 0) {
          // Constant-time dummy compare prevents timing attacks
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;
        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const ok = await compare(password, user.password);
        return ok ? { ...user, type: "regular" as const } : null;
      },
    }),

    /* One-click anonymous / guest login (remove if you don’t need it) */
    Credentials({
      id: "guest",
      name: "Continue as guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" as const };
      },
    }),
  ],

  // ---------- Session / JWT -----------------------------------------------
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.type = (user as any).type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).type = token.type;
      }
      return session;
    },
  },

  // ---------- Secret used to sign JWT & cookies ----------------------------
  secret: process.env.AUTH_SECRET,
});
