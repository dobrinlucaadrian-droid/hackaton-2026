// Limits on the account steps that cost us emails or invite guessing: new accounts, codes sent by email, sign-in attempts per username and "is this username free?" checks. Convex does not see the visitor's IP, so the keys are the email, the username or the whole site.
import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const limiter = new RateLimiter(components.rateLimiter, {
  // New accounts: per email address, and for the whole site (a script cannot make thousands of accounts).
  signUpEmail: { kind: "token bucket", rate: 3, period: HOUR, capacity: 3 },
  signUpSite: { kind: "fixed window", rate: 60, period: HOUR },
  // Codes sent by email for a forgotten password: per address, and for the whole site (protects the email quota).
  codeEmail: { kind: "token bucket", rate: 5, period: HOUR, capacity: 5 },
  codeSite: { kind: "fixed window", rate: 200, period: HOUR },
  // Sign-in steps per username, including usernames that do not exist (wrong passwords and codes are also limited by Convex Auth).
  signInUsername: { kind: "token bucket", rate: 30, period: HOUR, capacity: 30 },
  // "Is this username free?" checks from the sign-up form, for the whole site.
  usernameCheck: { kind: "token bucket", rate: 120, period: MINUTE, capacity: 120 },
});

/** The counters are kept under a SHA-256 fingerprint of the email or username, so the limiter tables hold no readable personal data. */
async function fingerprint(key: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key.toLowerCase())));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type LimitName = "signUpEmail" | "signUpSite" | "codeEmail" | "codeSite" | "signInUsername" | "usernameCheck";

/** Spends one try from the named limit (for `key`, or for the whole site); returns false when the limit is used up. */
export const hit = internalMutation({
  args: {
    name: v.union(
      v.literal("signUpEmail"),
      v.literal("signUpSite"),
      v.literal("codeEmail"),
      v.literal("codeSite"),
      v.literal("signInUsername"),
      v.literal("usernameCheck"),
    ),
    key: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, { name, key }) => (await limiter.limit(ctx, name, key === undefined ? {} : { key: await fingerprint(key) })).ok,
});

export const TOO_MANY = "Prea multe încercări într-un timp scurt. Încearcă din nou peste o oră.";
