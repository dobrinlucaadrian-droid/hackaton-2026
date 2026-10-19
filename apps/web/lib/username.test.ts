// Tests the username, password and email rules shared by the account forms and the server.
import { describe, expect, it } from "vitest";
import { cleanEmail, cleanUsername, validPassword } from "./username";

describe("account rules", () => {
  it("accepts simple usernames and stores them in lower case", () => {
    expect(cleanUsername("andrei.pop07")).toBe("andrei.pop07");
    expect(cleanUsername("  Ana_M ")).toBe("ana_m");
  });

  it("refuses usernames that are too short, too long or have other characters", () => {
    for (const bad of ["ab", "a".repeat(21), ".ana", "ana pop", "ana@x", "ană", "<b>", ""]) expect(cleanUsername(bad), bad).toBeNull();
  });

  it("needs a password of at least 8 characters", () => {
    expect(validPassword("1234567")).toBe(false);
    expect(validPassword("12345678")).toBe(true);
    expect(validPassword("x".repeat(129))).toBe(false);
  });

  it("checks the email address loosely and lower-cases it", () => {
    expect(cleanEmail(" Ana@Exemplu.RO ")).toBe("ana@exemplu.ro");
    for (const bad of ["ana", "ana@", "ana@exemplu", "a b@c.ro", ""]) expect(cleanEmail(bad), bad).toBeNull();
  });
});
