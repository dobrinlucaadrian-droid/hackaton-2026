"use client";
// On a university sheet outside Romania: every bachelor programme of the institution from its country's official dataset, read from the database (those lists are too large to ship with the pages). Romanian sheets render the same list on the server, from the catalogue file.
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLang, useT } from "./LangProvider";
import { ProgramGroups, type ProgramGroupsProps } from "./ProgramGroups";

export function OfficialPrograms({ institutionId, ...rest }: { institutionId: string } & Omit<ProgramGroupsProps, "rows">) {
  const lang = useLang();
  const t = useT();
  const rows = useQuery(api.catalog.programsOf, { institutionId });
  if (rows === undefined) return <p className="text-sm text-ink-soft">{t("Se încarcă lista de programe...", "Loading the list of programmes...")}</p>;
  return <ProgramGroups rows={rows} {...rest} lang={lang} />;
}
