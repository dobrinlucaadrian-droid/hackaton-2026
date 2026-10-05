// Convex Auth setup. Sign-in methods (email magic link, Google) are added in the accounts step; until then nobody can sign in.
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [],
});
