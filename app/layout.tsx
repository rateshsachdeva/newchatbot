/* app/layout.tsx
   ──────────────────────────────────────────────────────────────────────────
   Global layout for the App Router:
   • Wraps the entire UI in <SessionProvider>  (Next-Auth v5)
   • Adds <ThemeProvider> so dark / light mode works
   • Shows a site-wide header that contains <AuthButton />
   • Exposes <Toaster /> for react-hot-toast notifications
   • Loads the Geist font and tailwind base styles
   ------------------------------------------------------------------------ */

import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

import AuthButton from "@/components/AuthButton";

import type { ReactNode } from "react";
import type { Metadata } from "next";

// ─── <head> metadata ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "newchatbot",
  description: "AI Chatbot powered by OpenAI and Google OAuth",
};

// ─── Root layout ────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        {/* Auth.js session context (client) */}
        <SessionProvider>
          {/* dark / light theme context */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* ─── Global header ─────────────────────────────────────────── */}
            <header className="flex items-center justify-between border-b px-6 py-4">
              <a href="/" className="text-lg font-semibold">
                newchatbot
              </a>
              <AuthButton />
            </header>

            {/* ─── Page content ─────────────────────────────────────────── */}
            <main>{children}</main>

            {/* ─── Toast notifications ─────────────────────────────────── */}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
