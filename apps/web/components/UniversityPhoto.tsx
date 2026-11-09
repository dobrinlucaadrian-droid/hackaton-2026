// A university's photo at the top of its sheet, outlined and "taped" on like a print, with the author and licence underneath (the free licences of Wikimedia Commons require them).
import Image from "next/image";
import type { Lang } from "@/lib/i18n";
import { photoOf } from "@/lib/photos";

/** Renders nothing when the university has no freely licensed photo. Server only (reads the photo list). */
export function UniversityPhoto({ universityId, alt, lang = "ro" }: { universityId: string; alt: string; lang?: Lang }) {
  const photo = photoOf(universityId);
  if (!photo) return null;
  return (
    <figure className="relative mt-6 -rotate-1">
      <Image src={photo.file} alt={alt} width={1280} height={720} priority sizes="(max-width: 768px) 100vw, 768px" className="drawn aspect-video w-full rounded-[1.6rem] object-cover [box-shadow:0_6px_0_var(--color-ink)]" />
      <span aria-hidden className="absolute -top-3 left-6 h-7 w-24 -rotate-6 bg-teal/60" />
      <span aria-hidden className="absolute -top-3 right-6 h-7 w-24 rotate-6 bg-teal/60" />
      <figcaption className="mt-2 text-right text-xs text-ink-soft">
        {lang === "en" ? "Photo" : "Foto"}: {photo.author} ·{" "}
        {photo.licenseUrl ? (
          <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{photo.license}</a>
        ) : (
          photo.license
        )}{" "}
        ·{" "}
        <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Wikimedia Commons</a>
      </figcaption>
    </figure>
  );
}
