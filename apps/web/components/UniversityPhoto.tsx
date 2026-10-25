// A university's photo at the top of its sheet, with the author and licence underneath (the free licences of Wikimedia Commons require them).
import Image from "next/image";
import type { Lang } from "@/lib/i18n";
import { photoOf } from "@/lib/photos";

/** Renders nothing when the university has no freely licensed photo. Server only (reads the photo list). */
export function UniversityPhoto({ universityId, alt, lang = "ro" }: { universityId: string; alt: string; lang?: Lang }) {
  const photo = photoOf(universityId);
  if (!photo) return null;
  return (
    <figure className="mt-5">
      <Image src={photo.file} alt={alt} width={1280} height={720} priority sizes="(max-width: 768px) 100vw, 768px" className="aspect-video w-full rounded-3xl object-cover shadow-sm ring-1 ring-line" />
      <figcaption className="mt-1 text-right text-xs text-ink-soft">
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
