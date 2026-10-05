"use client";
// "Salvează în contul meu" on the result page: saves the result when the student is signed in, otherwise keeps it on the device and sends them to sign in.
import { useConvexAuth, useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { setPendingResult, type PendingResult } from "@/lib/pendingSave";

export function SaveResult({ result }: { result: PendingResult }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const save = useMutation(api.results.save);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onClick() {
    if (!isAuthenticated) {
      setPendingResult(result);
      router.push("/conectare");
      return;
    }
    setState("saving");
    try {
      await save(result);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mx-auto mt-6 max-w-2xl rounded-3xl bg-card p-5 text-center shadow-sm ring-1 ring-line" data-save-result>
      {state === "saved" ? (
        <p className="font-bold text-teal-ink" role="status">
          Rezultatul e salvat în contul tău.{" "}
          <Link href="/cont" className="text-primary underline underline-offset-2">Vezi contul meu →</Link>
        </p>
      ) : (
        <>
          <p className="text-ink-soft">
            {isAuthenticated ? "Păstrează rezultatul ca să-l găsești și altă dată." : "Fă-ți un cont, fără parolă, ca să păstrezi rezultatul și să-l găsești și altă dată."}
          </p>
          <button
            type="button"
            onClick={() => void onClick()}
            disabled={isLoading || state === "saving"}
            className="mt-3 min-h-12 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-50"
          >
            {state === "saving" ? "Se salvează..." : "Salvează în contul meu"}
          </button>
          {state === "error" && (
            <p className="mt-2 text-sm font-bold text-primary-dark" role="alert">Nu am putut salva. Încearcă din nou.</p>
          )}
        </>
      )}
    </div>
  );
}
