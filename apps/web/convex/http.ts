// HTTP routes of the Convex backend: only the ones Convex Auth needs for sign-in.
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
