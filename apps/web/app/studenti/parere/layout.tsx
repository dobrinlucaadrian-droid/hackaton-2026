// The opinion form's title in the browser tab (the page itself runs in the browser).
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Scrie o părere despre facultatea ta | FindMyUni" };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
