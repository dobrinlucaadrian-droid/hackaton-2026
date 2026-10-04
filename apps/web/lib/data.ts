// Loads the seeded JSON (profiles, questions, domains, universities, testimonials) as typed arrays.
import type { Domain, Profile, Question, Testimonial, University } from "./types";
import profilesJson from "../data/profiles.json";
import questionsJson from "../data/questions.json";
import domainsJson from "../data/domains.json";
import universitiesJson from "../data/universities.json";
import testimonialsJson from "../data/testimonials.json";

export const profiles = profilesJson as Profile[];
export const questions = questionsJson as Question[];
export const domains = domainsJson as Domain[];
export const universities = universitiesJson as University[];
export const testimonials = testimonialsJson as Testimonial[];
