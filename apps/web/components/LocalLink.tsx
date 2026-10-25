"use client";
// A link inside the site that stays in the page's language: href="/universitati" becomes "/en/universitati" on the English pages. Use it instead of next/link for addresses of this site.
import Link from "next/link";
import type { ComponentProps } from "react";
import { useHref } from "./LangProvider";

export default function LocalLink({ href, ...rest }: ComponentProps<typeof Link>) {
  const local = useHref();
  return <Link href={typeof href === "string" ? local(href) : href} {...rest} />;
}
