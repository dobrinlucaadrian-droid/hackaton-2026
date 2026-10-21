/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as account from "../account.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as authLimits from "../authLimits.js";
import type * as catalog from "../catalog.js";
import type * as crons from "../crons.js";
import type * as favorites from "../favorites.js";
import type * as http from "../http.js";
import type * as results from "../results.js";
import type * as retention from "../retention.js";
import type * as reviews from "../reviews.js";
import type * as turnstile from "../turnstile.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  access: typeof access;
  account: typeof account;
  analytics: typeof analytics;
  auth: typeof auth;
  authLimits: typeof authLimits;
  catalog: typeof catalog;
  crons: typeof crons;
  favorites: typeof favorites;
  http: typeof http;
  results: typeof results;
  retention: typeof retention;
  reviews: typeof reviews;
  turnstile: typeof turnstile;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
