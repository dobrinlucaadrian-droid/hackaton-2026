// @vitest-environment edge-runtime
// Tests the favourite universities: only for signed-in students, each sees and changes only their own, no duplicates, at most 30, gone with the account.
/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { MAX_FAVORITES } from "./favorites";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  const [alice, bob] = await t.run(async (ctx) => [
    await ctx.db.insert("users", { username: "alice01", name: "Alice Test", email: "alice@example.com", emailVerificationTime: 1 }),
    await ctx.db.insert("users", { username: "bob01", name: "Bob Test", email: "bob@example.com", emailVerificationTime: 1 }),
  ]);
  const as = (id: Id<"users">) => t.withIdentity({ subject: `${id}|test-session` });
  return { t, alice, bob, as };
}

const ubb = { universityId: "ubb", name: "Universitatea Babeș-Bolyai", place: "Cluj-Napoca, România" };

describe("favourite universities", () => {
  it("need an account", async () => {
    const { t } = await setup();
    await expect(t.mutation(api.favorites.add, ubb)).rejects.toThrow();
    await expect(t.query(api.favorites.mine, {})).rejects.toThrow();
  });

  it("are private to each student and never doubled", async () => {
    const { alice, bob, as } = await setup();
    await as(alice).mutation(api.favorites.add, ubb);
    await as(alice).mutation(api.favorites.add, ubb);
    expect(await as(alice).query(api.favorites.mine, {})).toHaveLength(1);
    expect(await as(bob).query(api.favorites.mine, {})).toHaveLength(0);
    await as(bob).mutation(api.favorites.remove, { universityId: "ubb" });
    expect(await as(alice).query(api.favorites.mine, {})).toHaveLength(1);
    await as(alice).mutation(api.favorites.remove, { universityId: "ubb" });
    expect(await as(alice).query(api.favorites.mine, {})).toHaveLength(0);
  });

  it("refuse bad ids and long texts, and stop at the limit", async () => {
    const { alice, as } = await setup();
    await expect(as(alice).mutation(api.favorites.add, { ...ubb, universityId: "../admin" })).rejects.toThrow();
    await expect(as(alice).mutation(api.favorites.add, { ...ubb, name: "x".repeat(200) })).rejects.toThrow();
    for (let i = 0; i < MAX_FAVORITES; i++) await as(alice).mutation(api.favorites.add, { ...ubb, universityId: `u-${i}` });
    await expect(as(alice).mutation(api.favorites.add, { ...ubb, universityId: "one-more" })).rejects.toThrow(/cel mult/);
  });

  it("are in the data copy and are deleted with the account", async () => {
    const { t, alice, as } = await setup();
    await as(alice).mutation(api.favorites.add, ubb);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the copy is a free-form object
    const copy = (await as(alice).query(api.account.exportMine, {})) as any;
    expect(copy.universitatiFavorite[0].universitate).toBe(ubb.name);
    await as(alice).mutation(api.account.remove, {});
    expect(await t.run(async (ctx) => ctx.db.query("favorites").collect())).toHaveLength(0);
  });
});
