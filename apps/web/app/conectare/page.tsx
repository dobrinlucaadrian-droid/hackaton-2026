// Sign-in page: reached when a page needs an account (for example "Contul meu"). Everyday sign-in happens in the account window; this page shows the same form.
import { Shell } from "@/components/Shell";
import { SignInForm } from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <Shell>
      <div className="rise mx-auto mt-6 max-w-md rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-ink">Conectare</h1>
        <p className="mt-2 text-ink-soft">
          Intră cu numele de utilizator și parola. Dacă ești la prima vizită, îți faci un cont în câteva secunde.
        </p>
        <SignInForm />
      </div>
    </Shell>
  );
}
