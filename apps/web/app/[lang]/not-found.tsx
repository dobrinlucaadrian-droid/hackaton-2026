"use client";
// Friendly 404 page shown for unknown routes and unknown university ids, in the page language.
import { useT } from "@/components/LangProvider";
import { Notice, Shell } from "@/components/Shell";

export default function NotFound() {
  const t = useT();
  return (
    <Shell>
      <Notice
        title={t("Nu am găsit pagina", "We could not find that page")}
        text={t(
          "Poate adresa e greșită sau universitatea nu mai există în lista noastră. Caută-o din nou.",
          "Maybe the address is wrong or the university is no longer in our list. Try searching for it again.",
        )}
        href="/universitati"
        cta={t("Înapoi la universități", "Back to universities")}
      />
    </Shell>
  );
}
