// Runs before every page: on the live site sends other addresses (www, vercel.app) to findmyuni.ro, adds the content security policy, keeps the sign-in session fresh and sends visitors who are not signed in away from the account and administration pages.
// The redirect is only a first, quick check; the real protection is in the Convex functions (convex/access.ts).
import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { buildCsp } from "./lib/csp";
import { SITE_URL } from "./lib/seo";

const isSignInPage = createRouteMatcher(["/conectare"]);
const isAccountPage = createRouteMatcher(["/cont(.*)", "/admin(.*)"]);

const authProxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/cont");
  }
  if (isAccountPage(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/conectare");
  }
});

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  // One official address, so search engines do not see the same site three times. Only on the live deployment: test links stay as they are.
  const official = new URL(SITE_URL);
  if (process.env.VERCEL_ENV === "production" && request.nextUrl.hostname !== official.hostname) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, official), 308);
  }
  // A fresh nonce per request: Next.js reads it from the request's policy and puts it on its own scripts.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const https = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const csp = buildCsp(nonce, { convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL, dev: process.env.NODE_ENV !== "production", https });
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);
  const response = (await authProxy(request, event)) ?? NextResponse.next({ request: { headers: request.headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Every route except static files.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
