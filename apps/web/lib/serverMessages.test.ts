// Tests that server messages are translated on English pages and left alone in Romanian.
import { describe, expect, it } from "vitest";
import { serverMessage } from "./serverMessages";

describe("serverMessage", () => {
  it("keeps Romanian as it is", () => {
    expect(serverMessage("Date nevalide.", "ro")).toBe("Date nevalide.");
  });
  it("translates exact messages", () => {
    expect(serverMessage("Date nevalide.", "en")).toBe("Invalid data.");
  });
  it("translates messages with numbers", () => {
    expect(serverMessage("Poți avea cel mult 30 universități favorite. Scoate una ca să adaugi alta.", "en")).toContain("at most 30");
  });
  it("falls back to the original", () => {
    expect(serverMessage("Ceva necunoscut", "en")).toBe("Ceva necunoscut");
  });
});
