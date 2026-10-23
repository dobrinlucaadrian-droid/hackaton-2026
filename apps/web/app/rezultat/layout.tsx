// The result page's title in the browser tab (the page itself runs in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Domeniile tale potrivite | FindMyUni" };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
