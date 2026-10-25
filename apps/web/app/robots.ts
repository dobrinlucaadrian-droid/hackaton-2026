// Rules for search engines (/robots.txt): on the live site, everything public may be indexed (in both languages) except personal pages; test copies of the site are never indexed.
import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cont", "/admin", "/conectare", "/rezultat", "/quiz", "/en/cont", "/en/admin", "/en/conectare", "/en/rezultat", "/en/quiz"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
