// Loads the seeded JSON (profiles, questions, domains, universities) as typed arrays.
import type { Domain, Profile, Question, University } from "./types";
import profilesJson from "../data/profiles.json";
import questionsJson from "../data/questions.json";
import domainsJson from "../data/domains.json";
import universitiesJson from "../data/universities.json";

export const profiles = profilesJson as Profile[];
export const questions = questionsJson as Question[];
export const domains = domainsJson as Domain[];
export const universities = universitiesJson as University[];
