// The questionnaire start page's title in the browser tab, in the page language (the page itself runs in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/test">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "en" ? "Quiz: what to study | FindMyUni" : "Chestionar: ce să studiezi | FindMyUni" };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
