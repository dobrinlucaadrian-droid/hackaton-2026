// The questionnaire's title in the browser tab, in the page language (the page itself runs in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/quiz">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "en" ? "Quiz | FindMyUni" : "Chestionar | FindMyUni" };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
