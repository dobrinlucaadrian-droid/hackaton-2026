// Shown the instant a link is pressed, while the next page comes from the server: the usual header and a small spinner, so a tap never looks ignored.
import { Shell } from "@/components/Shell";

export default function Loading() {
  return (
    <Shell>
      <div role="status" className="flex flex-col items-center gap-3 py-24 text-ink-soft">
        <span aria-hidden className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <span className="text-sm font-bold">Se încarcă…</span>
      </div>
    </Shell>
  );
}
