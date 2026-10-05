// Convex app setup: installs the rate-limiter component used by the public review form.
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(rateLimiter);

export default app;
