"use client";
// The heart on a university sheet (or, compact, in the corner of a search result card): adds the university to the student's favourites (shown in "Contul meu") or removes it; without an account it opens the account window and adds it once the student is signed in.
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { setPendingFavorite, type PendingFavorite } from "@/lib/pendingSave";
import { serverMessage } from "@/lib/serverMessages";
import { useLang, useT } from "./LangProvider";
import { openSignIn } from "./WelcomeDialog";

export function FavoriteButton({ university, compact = false }: { university: PendingFavorite; compact?: boolean }) {
  const t = useT();
  const lang = useLang();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const favorites = useQuery(api.favorites.mine, isAuthenticated ? {} : "skip");
  const add = useMutation(api.favorites.add);
  const remove = useMutation(api.favorites.remove);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const on = !!favorites?.some((f) => f.universityId === university.universityId);

  async function onClick() {
    setError(null);
    if (!isAuthenticated) {
      setPendingFavorite(university);
      openSignIn("signUp");
      return;
    }
    setBusy(true);
    try {
      if (on) await remove({ universityId: university.universityId });
      else await add(university);
    } catch (e) {
      setError(e instanceof ConvexError ? serverMessage(String(e.data), lang) : t("Nu a mers. Încearcă din nou.", "That did not work. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => void onClick()}
          disabled={isLoading || busy || (isAuthenticated && favorites === undefined)}
          aria-pressed={on}
          aria-label={on ? t(`Scoate ${university.name} de la favorite`, `Remove ${university.name} from favourites`) : t(`Adaugă ${university.name} la favorite`, `Add ${university.name} to favourites`)}
          title={on ? t("La favorite", "In your favourites") : t("Adaugă la favorite", "Add to favourites")}
          className={`flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-ink transition disabled:opacity-50 ${
            on ? "bg-primary text-white hover:bg-primary-dark" : "bg-card text-primary hover:bg-primary-tint"
          }`}
        >
          <Heart filled={on} />
        </button>
        {error && (
          <p className="drawn absolute right-0 top-12 z-20 w-56 rounded-xl bg-card p-2 text-xs font-bold text-primary-dark" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={isLoading || busy || (isAuthenticated && favorites === undefined)}
        aria-pressed={on}
        className={`inline-flex min-h-12 items-center gap-2 rounded-2xl border-[2.5px] px-5 font-extrabold transition hover:-translate-y-0.5 disabled:opacity-50 ${
          on ? "border-primary bg-primary text-white shadow-[0_3px_0_var(--color-primary-dark)] hover:bg-primary-dark" : "border-primary bg-card text-primary hover:bg-primary-tint"
        }`}
      >
        <Heart filled={on} />
        {on ? t("La favorite", "In your favourites") : t("Adaugă la favorite", "Add to favourites")}
      </button>
      {error && (
        <p className="mt-2 text-sm font-bold text-primary-dark" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** The drawn heart: outlined when the university is not a favourite, filled when it is. */
function Heart({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}
