// Loads the seeded JSON (profiles, questions, domains, universities, specializations, categories, testimonials) as typed arrays.
import type { Category, Domain, Profile, Question, Specialization, Testimonial, University } from "./types";
import profilesJson from "../data/profiles.json";
import questionsJson from "../data/questions.json";
import domainsJson from "../data/domains.json";
import universitiesRoJson from "../data/universities-ro.json";
import universitiesAbroadJson from "../data/universities-abroad.json";
import specializationsJson from "../data/specializations.json";
import categoriesJson from "../data/categories.json";
import testimonialsJson from "../data/testimonials.json";

export const profiles = profilesJson as Profile[];
export const questions = questionsJson as Question[];
export const domains = domainsJson as Domain[];
export const universities = [...(universitiesRoJson as University[]), ...(universitiesAbroadJson as University[])];
export const specializations = specializationsJson as Specialization[];
export const categories = categoriesJson as Category[];
export const testimonials = testimonialsJson as Testimonial[];
