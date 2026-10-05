// Vitest setup: the Convex function tests run with convex-test, which must be bundled by Vitest.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    server: { deps: { inline: ["convex-test"] } },
  },
});
