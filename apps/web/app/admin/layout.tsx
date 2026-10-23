// The administration pages' title in the browser tab (the pages themselves run in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Administrare | FindMyUni", robots: { index: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
