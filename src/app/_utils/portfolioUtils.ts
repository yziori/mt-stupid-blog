import type { Project, Skill } from "@data/types";

// 関連記事機能は将来実装予定
export async function getRelatedArticles(
	projectId: string,
	projects: Project[],
): Promise<never[]> {
	// TODO: microCMSとの連携は後で実装
	return [];
}

export function filterProjectsByCategory(
	projects: Project[],
	category?: string,
): Project[] {
	if (!category || category === "all") return projects;
	return projects.filter((project) => project.category === category);
}

export function getProjectsBySkill(
	projects: Project[],
	skillId: string,
): Project[] {
	return projects.filter((project) =>
		project.technologies.some((tech) =>
			tech.toLowerCase().includes(skillId.toLowerCase()),
		),
	);
}

export function groupSkillsByCategory(
	skills: Skill[],
): Record<string, Skill[]> {
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

export function validateProjectId(
	projectId: string,
	projects: Project[],
): boolean {
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
