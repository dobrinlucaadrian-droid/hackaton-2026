// The result page's title in the browser tab, in the page language (the page itself runs in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/rezultat">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "en" ? "Your matching fields | FindMyUni" : "Domeniile tale potrivite | FindMyUni" };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
