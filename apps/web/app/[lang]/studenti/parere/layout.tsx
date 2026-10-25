// The opinion form's title in the browser tab, in the page language (the page itself runs in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/studenti/parere">): Promise<Metadata> {
  const { lang } = await params;
  return { title: `${lang === "en" ? "Write an opinion about your faculty" : "Scrie o părere despre facultatea ta"} | FindMyUni` };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
