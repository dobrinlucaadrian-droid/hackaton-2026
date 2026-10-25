// The administration pages' title in the browser tab, in the page language (the pages themselves run in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/admin">): Promise<Metadata> {
  const { lang } = await params;
  return { title: `${lang === "en" ? "Administration" : "Administrare"} | FindMyUni`, robots: { index: false } };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
