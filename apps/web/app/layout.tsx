import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const description =
  "UniPath te ajută să alegi domeniul de studiu potrivit: răspunzi la câteva întrebări și afli unde poți studia, în România sau în străinătate.";

// The icons and the link-preview image (the team logo) come from icon.png, apple-icon.png, favicon.ico and opengraph-image.png in this folder.
export const metadata: Metadata = {
  metadataBase: new URL("https://unipath-taupe-mu.vercel.app"),
  title: "UniPath",
  description,
  openGraph: { title: "UniPath", description, siteName: "UniPath", locale: "ro_RO", type: "website", url: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
