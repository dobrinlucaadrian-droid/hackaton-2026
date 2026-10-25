// Sign-in page: reached when a page needs an account (for example "Contul meu"). Everyday sign-in happens in the account window; this page shows the same form, in the page language.
import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { SignInForm } from "@/components/SignInForm";
import { hasLang, tr } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/conectare">): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "en" ? "Sign in | FindMyUni" : "Conectare | FindMyUni", robots: { index: false } };
}

export default async function SignInPage({ params }: PageProps<"/[lang]/conectare">) {
  const { lang } = await params;
  const t = tr(hasLang(lang) ? lang : "ro");
  return (
    <Shell>
      <div className="rise mx-auto mt-6 max-w-md rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-ink">{t("Conectare", "Sign in")}</h1>
        <p className="mt-2 text-ink-soft">
          {t(
            "Intră cu numele de utilizator și parola. Dacă ești la prima vizită, îți faci un cont în câteva secunde.",
            "Sign in with your username and password. If this is your first visit, you can make an account in a few seconds.",
          )}
        </p>
        <SignInForm />
      </div>
    </Shell>
  );
}
