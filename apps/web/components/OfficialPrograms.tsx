"use client";
// On a university sheet outside Romania: every bachelor programme of the institution from its country's official dataset, read from the database (those lists are too large to ship with the pages). Romanian sheets render the same list on the server, from the catalogue file.
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProgramGroups, type ProgramGroupsProps } from "./ProgramGroups";

export function OfficialPrograms({ institutionId, ...rest }: { institutionId: string } & Omit<ProgramGroupsProps, "rows">) {
  const rows = useQuery(api.catalog.programsOf, { institutionId });
  if (rows === undefined) return <p className="text-sm text-ink-soft">Se încarcă lista de programe...</p>;
  return <ProgramGroups rows={rows} {...rest} />;
}
