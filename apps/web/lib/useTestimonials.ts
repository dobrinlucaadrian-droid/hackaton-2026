"use client";
// All student opinions the pages can show: the ones gathered by the team (in the app's data) plus the approved ones from the database.
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { testimonials } from "./data";
import { universityIdOf } from "./testimonials";
import type { Testimonial } from "./types";

export function useTestimonials(): Testimonial[] {
  const approved = useQuery(api.reviews.listApproved);
  return useMemo(
    () => [
      ...testimonials,
      ...(approved ?? []).map((r) => ({
        name: r.name,
        // The form stores the faculty and the university separately; the card shows them together.
        faculty: r.university && !r.faculty.includes(r.university) ? `${r.faculty}, ${r.university}` : r.faculty,
        ...(r.university ? { university: r.university } : {}),
        ...(r.universityId ? { universityId: r.universityId } : {}),
        ...(r.status ? { status: r.status } : {}),
        text: r.text,
      })),
    ],
    [approved],
  );
}

/** The opinions about one university (team-gathered and approved ones). */
export function useTestimonialsFor(universityId: string): Testimonial[] {
  const all = useTestimonials();
  return useMemo(() => all.filter((t) => universityIdOf(t) === universityId), [all, universityId]);
}
