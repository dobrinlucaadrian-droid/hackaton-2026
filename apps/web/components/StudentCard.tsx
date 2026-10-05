// One student opinion: photo (or initial), name, faculty and their own words. Used on the students page and on university sheets.
import Image from "next/image";
import type { Testimonial } from "@/lib/types";

export function StudentCard({ t, as: Tag = "li" }: { t: Testimonial; as?: "li" | "div" }) {
  return (
    <Tag className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <div className="flex items-center gap-4">
        {t.photo ? (
          <Image
            src={t.photo}
            alt={`Poză: ${t.name}`}
            width={320}
            height={320}
            loading="eager"
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-teal"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-tint text-3xl font-black text-primary ring-2 ring-teal"
          >
            {t.name.charAt(0)}
          </span>
        )}
        <div>
          <p className="text-xl font-extrabold text-ink">{t.name}</p>
          <p className="mt-1 text-sm font-bold text-primary">
            {t.faculty}
            {t.status ? ` · ${t.status}` : ""}
          </p>
        </div>
      </div>
      <blockquote className="mt-4 whitespace-pre-line border-l-4 border-teal pl-4 text-ink-soft">„{t.text}”</blockquote>
    </Tag>
  );
}
