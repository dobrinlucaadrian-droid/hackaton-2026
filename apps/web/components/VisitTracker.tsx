"use client";
// Counts page views anonymously: sends only the page path and, on the first page of a visit, the country and the site the visitor came from. No cookie, no stored id.
import { useMutation } from "convex/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

// Kept in memory only: a full page load starts a new visit.
let visitStarted = false;
let lastPath: string | null = null;

export function VisitTracker({ country }: { country?: string }) {
  const pathname = usePathname();
  const track = useMutation(api.analytics.trackVisit);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (pathname === lastPath) return; // the same page rendered again, not a new view
    lastPath = pathname;
    const first = !visitStarted;
    visitStarted = true;
    let referrer: string | undefined;
    if (first && document.referrer) {
      try {
        // Pages of this site are not a "source"; only other sites are.
        if (new URL(document.referrer).host !== window.location.host) referrer = document.referrer.slice(0, 500);
      } catch {
        // ignore a malformed referrer
      }
    }
    track({ path: pathname, first, ...(referrer ? { referrer } : {}), ...(first && country ? { country } : {}) }).catch(() => {
      // statistics must never break a page
    });
  }, [pathname, track, country]);

  return null;
}
