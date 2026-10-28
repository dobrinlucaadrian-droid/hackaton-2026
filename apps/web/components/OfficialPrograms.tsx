"use client";
// On a university sheet outside Romania: every bachelor programme of the institution from its country's official dataset, read from the database (those lists are too large to ship with the pages). Romanian sheets render the same list on the server, from the catalogue file.
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLang, useT } from "./LangProvider";
import { ProgramGroups, type ProgramGroupsProps } from "./ProgramGroups";

/** With `faculty`, only the programmes of the faculties whose name contains it (a school that has its own sheet). */
export function OfficialPrograms({ institutionId, faculty, ...rest }: { institutionId: string; faculty?: string } & Omit<ProgramGroupsProps, "rows">) {
  const lang = useLang();
  const t = useT();
  const rows = useQuery(api.catalog.programsOf, { institutionId });
  if (rows === undefined) return <p className="text-sm text-ink-soft">{t("Se încarcă lista de programe...", "Loading the list of programmes...")}</p>;
  const shown = faculty ? rows.filter((r) => r.faculty?.includes(faculty)) : rows;
  return <ProgramGroups rows={shown} {...rest} lang={lang} />;
}
