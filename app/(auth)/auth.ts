// app/(auth)/auth.ts
//-------------------------------------------------------------------
import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import Google      from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { createGuestUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";
import { DUMMY_PASSWORD } from "@/lib/constants";
import type { DefaultJWT } from "next-auth/jwt";

/* ─── Extra typings so session.user carries id + type ─────────────────── */
export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: { id: string; type: UserType } & DefaultSession["user"];
  }
  interface User {
    id?: string;
    email?: string | null;
    password?: string | null;
    type: UserType;
  }
}
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

/* ─── Auth.js v5 (NextAuth) configuration ─────────────────────────────── */
const nextAuth = NextAuth({
  ...authConfig,

  providers: [
    /* Google OAuth 2.0 */
    Google,

    /* Email + password (remove if not needed) */
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "E-mail",   type: "text"     },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds): Promise<any | null> {
        const email    = (creds?.email as string | undefined)    ?? "";
        const password = (creds?.password as string | undefined) ?? "";

        if (!email || !password) return null;

        const users = await getUser(email);
        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD); // constant-time dummy
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

    /* Anonymous “guest” login (remove if not needed) */
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

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = (user as any).id;
        token.type = (user as any).type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id;
        (session.user as any).type = token.type;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});

/* ─── Exports expected by the App Router ──────────────────────────────── */
export const GET  = nextAuth.handlers.GET;
export const POST = nextAuth.handlers.POST;
export const { auth, signIn, signOut } = nextAuth;
