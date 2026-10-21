// Rules for search engines (/robots.txt): on the live site, everything public may be indexed except personal pages; test copies of the site are never indexed.
import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cont", "/admin", "/conectare", "/rezultat", "/quiz"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
