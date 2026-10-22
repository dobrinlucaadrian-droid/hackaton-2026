// @vitest-environment edge-runtime
// Tests the account functions: the data copy shows only the signed-in user's own data, and the account limits stop floods.
/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  const [alice, bob] = await t.run(async (ctx) => [
    await ctx.db.insert("users", { username: "alice01", name: "Alice Test", email: "alice@example.com", emailVerificationTime: 1 }),
    await ctx.db.insert("users", { username: "bob01", name: "Bob Test", email: "bob@example.com" }),
  ]);
  const as = (id: Id<"users">) => t.withIdentity({ subject: `${id}|test-session` });
  return { t, alice, bob, as };
}

describe("copy of my data", () => {
  it("is empty for a visitor who is not signed in", async () => {
    const { t } = await setup();
    expect(await t.query(api.account.exportMine, {})).toBeNull();
  });

  it("contains only the signed-in user's own data and never a password", async () => {
    const { t, alice, as } = await setup();
    await as(alice).mutation(api.results.save, { profileId: "real-mate-info", where: "ro", cities: ["Iași"], choices: { "proiect-de-grup": 1 }, topDomains: ["informatica"] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the copy is a free-form object
    const copy = (await as(alice).query(api.account.exportMine, {})) as any;
    expect(copy).not.toBeNull();
    expect(copy.cont.numeUtilizator).toBe("alice01");
    expect(copy.cont.email).toBe("alice@example.com");
    expect(copy.rezultatSalvat.orase).toEqual(["Iași"]);
    const text = JSON.stringify(copy);
    expect(text).not.toContain("bob");
    expect(text).not.toMatch(/\$scrypt|secret/i);
    expect(await t.run(async (ctx) => ctx.db.query("results").collect())).toHaveLength(1);
  });
});

describe("account limits", () => {
  it("allow three new accounts per email in an hour, then refuse", async () => {
    const { t } = await setup();
    const tries = [];
    for (let i = 0; i < 4; i++) tries.push(await t.mutation(internal.authLimits.hit, { name: "signUpEmail", key: "x@example.com" }));
    expect(tries).toEqual([true, true, true, false]);
    // another address is not affected
    expect(await t.mutation(internal.authLimits.hit, { name: "signUpEmail", key: "y@example.com" })).toBe(true);
  });

  it("limit the codes sent to one address for a forgotten password", async () => {
    const { t } = await setup();
    const tries = [];
    for (let i = 0; i < 6; i++) tries.push(await t.mutation(internal.authLimits.hit, { name: "codeEmail", key: "x@example.com" }));
    expect(tries.filter(Boolean)).toHaveLength(5);
    expect(tries[5]).toBe(false);
  });

  it("answer whether a username is free, and the check is a counted mutation", async () => {
    const { t } = await setup();
    expect(await t.mutation(api.account.usernameFree, { username: "alice01" })).toBe(false);
    expect(await t.mutation(api.account.usernameFree, { username: "Nou.Elev" })).toBe(true);
    expect(await t.mutation(api.account.usernameFree, { username: "a" })).toBe(false);
  });
});

describe("security notice", () => {
  it("deleting an account schedules the 'account deleted' email to its confirmed address", async () => {
    const { t, alice, as } = await setup();
    await as(alice).mutation(api.account.remove, {});
    const scheduled = await t.run(async (ctx) => ctx.db.system.query("_scheduled_functions").collect());
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].name).toMatch(/email/);
    expect(scheduled[0].args[0]).toEqual({ to: "alice@example.com", kind: "accountDeleted" });
  });
});
