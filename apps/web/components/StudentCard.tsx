"use client";
// One student opinion: photo (or initial), name, faculty and their own words. Used on the students page and on university sheets; the opinion stays in its original words, only the photo label is in the page language.
import Image from "next/image";
import type { Testimonial } from "@/lib/types";
import { useT } from "./LangProvider";

export function StudentCard({ t, as: Tag = "li" }: { t: Testimonial; as?: "li" | "div" }) {
  const tr = useT();
  return (
    <Tag className="drawn relative rounded-[1.6rem] bg-card p-6">
      <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-[2.5px] border-ink bg-teal" />
      <div className="flex items-center gap-4">
        {t.photo?.startsWith("https://") ? (
          // A photo sent with an approved opinion, served by the database (already a small square).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.photo}
            alt={tr(`Poză: ${t.name}`, `Photo: ${t.name}`)}
            width={320}
            height={320}
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-[3px] ring-ink"
          />
        ) : t.photo ? (
          <Image
            src={t.photo}
            alt={tr(`Poză: ${t.name}`, `Photo: ${t.name}`)}
            width={320}
            height={320}
            loading="eager"
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-[3px] ring-ink"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-tint text-3xl font-black text-primary ring-[3px] ring-ink"
          >
            {t.name.charAt(0)}
          </span>
        )}
        <div>
          <p className="hand text-3xl leading-none text-primary">{t.name}</p>
          <p className="mt-1 text-sm font-bold text-ink-soft">
            {t.faculty}
            {t.status ? ` · ${t.status}` : ""}
          </p>
        </div>
      </div>
      <blockquote className="mt-4 whitespace-pre-line text-ink">„{t.text}”</blockquote>
    </Tag>
  );
}
