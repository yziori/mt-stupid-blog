import type { Project, Skill } from "@data/types";
import { client } from "@libs/microcms";
import type { BlogPost } from "@libs/microcms/blogs/types";

export async function getRelatedArticles(projectId: string, projects: Project[]): Promise<BlogPost[]> {
	const project = projects.find((p) => p.id === projectId);
	if (!project || !project.relatedArticleIds.length) return [];

	try {
		const articles = await Promise.allSettled(
			project.relatedArticleIds.map((id) =>
				client.get({ endpoint: "blogs", contentId: id }),
			),
		);

		return articles
			.filter((result): result is PromiseFulfilledResult<BlogPost> => result.status === "fulfilled")
			.map((result) => result.value);
	} catch (error) {
		console.error("Failed to fetch related articles:", error);
		return [];
	}
}

export function filterProjectsByCategory(projects: Project[], category?: string): Project[] {
	if (!category || category === "all") return projects;
	return projects.filter((project) => project.category === category);
}

export function getProjectsBySkill(projects: Project[], skillId: string): Project[] {
	return projects.filter((project) =>
		project.technologies.some((tech) => tech.toLowerCase().includes(skillId.toLowerCase())),
	);
}

export function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
	return skills.reduce(
		(acc, skill) => {
			if (!acc[skill.category]) {
				acc[skill.category] = [];
			}
			acc[skill.category].push(skill);
			return acc;
		},
		{} as Record<string, Skill[]>,
	);
}

export function validateProjectId(projectId: string, projects: Project[]): boolean {
	return projects.some((project) => project.id === projectId);
}

export function handleDataError<T>(error: Error, fallbackData: T): T {
	console.error("Data loading error:", error);
	return fallbackData;
}

export function getSkillLevel(level: number): string {
	const levels = {
		1: "初心者",
		2: "初級",
		3: "中級",
		4: "上級",
		5: "エキスパート",
	};
	return levels[level as keyof typeof levels] || "不明";
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
	});
}