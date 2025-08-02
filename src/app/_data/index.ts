import { projects } from "./projects";
import { skills } from "./skills";
import { experience } from "./experience";
import { contact } from "./contact";
import type { PortfolioData } from "./types";

export const portfolioData: PortfolioData = {
	projects,
	skills,
	experience,
	contact,
};

export * from "./types";
export { projects, skills, experience, contact };