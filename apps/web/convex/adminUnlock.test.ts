// @vitest-environment edge-runtime
// Tests the administrators' second step: admin functions stay locked without the email code, a wrong code is counted and stops after 5 tries, the right one unlocks only that session, and only for administrators.
/// <reference types="vite/client" />
import rateLimiterTest from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { ADMIN_LOCKED, MAX_TRIES } from "./adminUnlock";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

async function sha256(text: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function setup() {
  const t = convexTest(schema, modules);
  rateLimiterTest.register(t);
  const [admin, student] = await t.run(async (ctx) => [
    await ctx.db.insert("users", { email: "admin@example.com", emailVerificationTime: 1, role: "admin" }),
    await ctx.db.insert("users", { email: "elev@example.com", emailVerificationTime: 1 }),
  ]);
  const as = (id: Id<"users">, session = "session-a") => t.withIdentity({ subject: `${id}|${session}` });
  // A known code, as sendCode would store it (the real one goes by email).
  const giveCode = async (userId: Id<"users">, code = "123456") => t.mutation(internal.adminUnlock.storeCode, { userId, codeHash: await sha256(code) });
  return { t, admin, student, as, giveCode };
}

describe("admin second step", () => {
  it("keeps the admin functions locked without the code, even for an administrator", async () => {
    const { admin, as } = await setup();
    await expect(as(admin).query(api.reviews.listByState, { state: "pending" })).rejects.toThrow(ADMIN_LOCKED);
    expect(await as(admin).query(api.adminUnlock.status, {})).toEqual({ admin: true, unlockedUntil: null });
  });

  it("unlocks with the right code, only for that session", async () => {
    const { admin, as, giveCode } = await setup();
    await giveCode(admin);
    expect(await as(admin).mutation(api.adminUnlock.verify, { code: "123456" })).toEqual({ ok: true });
    expect(await as(admin).query(api.reviews.listByState, { state: "pending" })).toEqual([]);
    await expect(as(admin, "session-b").query(api.reviews.listByState, { state: "pending" })).rejects.toThrow(ADMIN_LOCKED);
    // A code works once.
    expect((await as(admin, "session-b").mutation(api.adminUnlock.verify, { code: "123456" })).ok).toBe(false);
  });

  it("counts wrong codes and stops after the limit, even if the right one comes later", async () => {
    const { admin, as, giveCode } = await setup();
    await giveCode(admin);
    for (let i = 0; i < MAX_TRIES; i++) expect((await as(admin).mutation(api.adminUnlock.verify, { code: "000000" })).ok).toBe(false);
    expect(await as(admin).mutation(api.adminUnlock.verify, { code: "123456" })).toMatchObject({ ok: false, message: expect.stringMatching(/Prea multe/) });
    await expect(as(admin).query(api.reviews.listByState, { state: "pending" })).rejects.toThrow(ADMIN_LOCKED);
  });

  it("refuses an expired code", async () => {
    const { t, admin, as, giveCode } = await setup();
    await giveCode(admin);
    await t.run(async (ctx) => {
      const row = await ctx.db.query("adminCodes").withIndex("by_user", (q) => q.eq("userId", admin)).unique();
      await ctx.db.patch(row!._id, { expires: Date.now() - 1 });
    });
    expect((await as(admin).mutation(api.adminUnlock.verify, { code: "123456" })).ok).toBe(false);
  });

  it("is not for students, and an unlock cannot be borrowed by another user", async () => {
    const { t, admin, student, as, giveCode } = await setup();
    await expect(as(student).mutation(api.adminUnlock.verify, { code: "123456" })).rejects.toThrow("Nu ai drept de administrator");
    expect(await as(student).query(api.adminUnlock.status, {})).toEqual({ admin: false, unlockedUntil: null });
    await giveCode(admin);
    await as(admin).mutation(api.adminUnlock.verify, { code: "123456" });
    // The student's role flips to admin in the database but they never typed a code: still locked.
    await t.run(async (ctx) => ctx.db.patch(student, { role: "admin" }));
    await expect(as(student, "session-a").query(api.reviews.listByState, { state: "pending" })).rejects.toThrow(ADMIN_LOCKED);
  });
});
