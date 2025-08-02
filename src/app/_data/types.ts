export interface Project {
	id: string;
	title: string;
	description: string;
	longDescription: string;
	technologies: string[];
	images: string[];
	demoUrl?: string;
	githubUrl?: string;
	startDate: string;
	endDate?: string;
	status: "completed" | "in-progress" | "planned";
	relatedArticleIds: string[];
	challenges: string[];
	learnings: string[];
	category: "web" | "mobile" | "backend" | "tool" | "other";
}

export interface Skill {
	id: string;
	name: string;
	category: "frontend" | "backend" | "mobile" | "tool" | "other";
	level: 1 | 2 | 3 | 4 | 5;
	yearsOfExperience: number;
	certifications?: string[];
	relatedProjectIds: string[];
}

export interface Experience {
	id: string;
	company: string;
	position: string;
	period: string;
	description: string;
	technologies: string[];
}

export interface ContactInfo {
	email?: string;
	socialLinks: {
		github?: string;
		twitter?: string;
		qiita?: string;
		linkedin?: string;
	};
}

export interface PortfolioData {
	projects: Project[];
	skills: Skill[];
	experience: Experience[];
	contact: ContactInfo;
}