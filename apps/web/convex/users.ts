// Server-only lookups by username, used by the sign-in code: the email behind a username never leaves the server.
import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

/** The email address of the account with this username (already cleaned), or null when there is none. */
export const emailOfUsername = internalQuery({
  args: { username: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { username }) => {
    const user = await ctx.db.query("users").withIndex("username", (q) => q.eq("username", username)).unique();
    return user?.email ?? null;
  },
});
