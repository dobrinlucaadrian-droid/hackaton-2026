"use client";
// Connects the pages to the Convex database and keeps the sign-in session available to every component.
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

// No "leave site?" prompt: the background visit counter must never stop a visitor from leaving or reloading.
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, { unsavedChangesWarning: false });

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>;
}
