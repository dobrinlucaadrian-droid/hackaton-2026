"use client";
// The heart on a university sheet: adds the university to the student's favourites (shown in "Contul meu") or removes it; without an account it opens the account window and adds it once the student is signed in.
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { setPendingFavorite, type PendingFavorite } from "@/lib/pendingSave";
import { openSignIn } from "./WelcomeDialog";

export function FavoriteButton({ university }: { university: PendingFavorite }) {
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
      setError(e instanceof ConvexError ? String(e.data) : "Nu a mers. Încearcă din nou.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={isLoading || busy || (isAuthenticated && favorites === undefined)}
        aria-pressed={on}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-5 font-bold transition disabled:opacity-50 ${
          on ? "border-primary bg-primary text-white hover:bg-primary-dark" : "border-primary text-primary hover:bg-primary-tint"
        }`}
      >
        <span aria-hidden className="text-lg leading-none">{on ? "♥" : "♡"}</span>
        {on ? "La favorite" : "Adaugă la favorite"}
      </button>
      {error && (
        <p className="mt-2 text-sm font-bold text-primary-dark" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
