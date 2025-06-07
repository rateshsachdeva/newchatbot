// app/(auth)/auth.ts
import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { createGuestUser, getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';

/* ------------------------------------------------------------------ */
/*  Type helpers so your session object carries id and user “type”.   */
/* ------------------------------------------------------------------ */

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: { id: string; type: UserType } & DefaultSession['user'];
  }
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

/* ------------------------------------------------------------------ */
/*  NextAuth (Auth.js v5) configuration                               */
/* ------------------------------------------------------------------ */

export const {
  handlers: { GET, POST },  // → expose /auth/* routes via app/(auth)/auth/[...nextauth]/route.ts
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,            // your existing config object (callbacks, pages, etc.)

  /* --------- Providers ---------- */
  providers: [
    /* Google OAuth 2 — picks up AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET automatically */
    Google,

    /* Email-and-password credentials (remove if you don’t need it) */
    Credentials({
      credentials: {
        email:    { label: 'E-mail', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }) {
        if (!email || !password) return null;

        const users = await getUser(email);
        if (users.length === 0) {
          // constant-time dummy compare prevents timing attacks
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;
        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const ok = await compare(password, user.password);
        return ok ? { ...user, type: 'regular' } : null;
      },
    }),

    /* One-click anonymous / guest login (remove if not needed) */
    Credentials({
      id: 'guest',
      name: 'Continue as guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),
  ],

  /* --------- Session / JWT tweaks ---------- */
  session: { strategy: 'jwt' },

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

  /* --------- Secret used to sign JWTs & cookies ---------- */
  secret: process.env.AUTH_SECRET,
});
