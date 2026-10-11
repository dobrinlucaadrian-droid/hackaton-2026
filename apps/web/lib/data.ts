// Loads the small seeded JSON (profiles, questions, domains, specializations, categories, testimonials) as typed arrays. The universities are apart: lib/universities.ts (index, for the browser) and lib/sheets.ts (full sheets, server only).
import type { Category, Domain, Profile, Question, Specialization, Testimonial } from "./types";
import profilesJson from "../data/profiles.json";
import questionsJson from "../data/questions.json";
import domainsJson from "../data/domains.json";
import specializationsJson from "../data/specializations.json";
import categoriesJson from "../data/categories.json";
import testimonialsJson from "../data/testimonials.json";

export const profiles = profilesJson as Profile[];
export const questions = questionsJson as Question[];
export const domains = domainsJson as Domain[];
export const specializations = specializationsJson as Specialization[];
export const categories = categoriesJson as Category[];
export const testimonials = testimonialsJson as Testimonial[];
