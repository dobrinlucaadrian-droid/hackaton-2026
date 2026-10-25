// Root layout: fonts, page metadata, the page language (ro at the plain addresses, en under /en), the database connection and the anonymous visit counter shared by every page.
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { LangProvider } from "@/components/LangProvider";
import { VisitTracker } from "@/components/VisitTracker";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { hasLang, LANGS } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const description =
  "FindMyUni te ajută să alegi domeniul de studiu potrivit: răspunzi la câteva întrebări și afli unde poți studia, în România sau în străinătate.";

// Only the two languages exist (any other first segment is a 404, below); the proxy sends the plain addresses to "ro".
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

// The icons come from icon.png, apple-icon.png and favicon.ico in the app folder; the link-preview image from opengraph-image.tsx next to this file.
const descriptionEn = "FindMyUni helps you choose a university in Romania: answer a few questions, find the field that fits you and where you can study it.";

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "en") {
    return {
      metadataBase: new URL(SITE_URL),
      title: "FindMyUni — find the right university in Romania",
      description: descriptionEn,
      openGraph: { title: "FindMyUni", description: descriptionEn, siteName: "FindMyUni", locale: "en_GB", type: "website", url: "/en" },
    };
  }
  return {
    metadataBase: new URL(SITE_URL),
    title: "FindMyUni — alege facultatea potrivită",
    description,
    openGraph: { title: "FindMyUni", description, siteName: "FindMyUni", locale: "ro_RO", type: "website", url: "/" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLang(lang)) notFound();
  // Vercel adds the visitor's country (two letters) to every request; nothing else about the visitor is read.
  const country = (await headers()).get("x-vercel-ip-country") ?? undefined;
  return (
    <ConvexAuthNextjsServerProvider>
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LangProvider lang={lang}>
          <ConvexClientProvider>
            <VisitTracker country={country} />
            {children}
            <WelcomeDialog />
          </ConvexClientProvider>
        </LangProvider>
      </body>
    </html>
    </ConvexAuthNextjsServerProvider>
  );
}
