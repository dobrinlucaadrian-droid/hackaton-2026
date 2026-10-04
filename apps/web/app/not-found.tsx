// Friendly 404 page shown for unknown routes and unknown university ids.
import { Notice, Shell } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell>
      <Notice title="Nu am găsit pagina" text="Poate adresa e greșită sau universitatea nu mai există în lista noastră. Caută-o din nou." href="/universitati" cta="Înapoi la universități" />
    </Shell>
  );
}
