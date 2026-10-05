// Runs before every page: keeps the sign-in session fresh and sends visitors who are not signed in away from the account and administration pages.
// This is only a first, quick check; the real protection is in the Convex functions (convex/access.ts).
import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/conectare"]);
const isAccountPage = createRouteMatcher(["/cont(.*)", "/admin(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/cont");
  }
  if (isAccountPage(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/conectare");
  }
});

export const config = {
  // Every route except static files.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
