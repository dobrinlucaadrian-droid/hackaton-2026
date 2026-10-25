// Runs before every page: on the live site sends other addresses (www, vercel.app) to findmyuni.ro, serves the plain addresses in Romanian and /en in English, adds the content security policy, keeps the sign-in session fresh and sends visitors who are not signed in away from the account and administration pages.
// The redirect is only a first, quick check; the real protection is in the Convex functions (convex/access.ts).
import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { buildCsp } from "./lib/csp";
import { SITE_URL } from "./lib/seo";

const isSignInPage = createRouteMatcher(["/conectare", "/en/conectare"]);
const isAccountPage = createRouteMatcher(["/cont(.*)", "/admin(.*)", "/en/cont(.*)", "/en/admin(.*)"]);
const isEnglish = (path: string) => path === "/en" || path.startsWith("/en/");

const authProxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const path = request.nextUrl.pathname;
  const prefix = isEnglish(path) ? "/en" : "";
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, `${prefix}/cont`);
  }
  if (isAccountPage(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, `${prefix}/conectare`);
  }
  // The Romanian pages keep their plain addresses: inside, they are served from the "ro" language folder (app/[lang]).
  if (!prefix && !path.startsWith("/api/") && !path.startsWith("/ro/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/ro${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url, { request: { headers: request.headers } });
  }
});

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  // One official address, so search engines do not see the same site three times. Only on the live deployment: test links stay as they are.
  const official = new URL(SITE_URL);
  if (process.env.VERCEL_ENV === "production" && request.nextUrl.hostname !== official.hostname) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, official), 308);
  }
  // "/ro/..." is only the inside name of the Romanian pages: visitors are sent to the plain address (the share pictures, which Next.js links as /ro/.../opengraph-image, are served as they are).
  const path = request.nextUrl.pathname;
  if ((path === "/ro" || path.startsWith("/ro/")) && !path.endsWith("/opengraph-image")) {
    const url = request.nextUrl.clone();
    url.pathname = path.slice(3) || "/";
    return NextResponse.redirect(url, 308);
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
