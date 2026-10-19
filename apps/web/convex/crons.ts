// Scheduled jobs: once a day, delete the data that is older than its keeping period (convex/retention.ts).
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 03:30 UTC, when the site is quiet.
crons.daily("delete data past its keeping period", { hourUTC: 3, minuteUTC: 30 }, internal.retention.cleanup, {});

export default crons;
