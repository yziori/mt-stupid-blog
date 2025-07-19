"use client";

import type { Skill } from "@data/types";

interface SkillsSectionUIProps {
	skills: Skill[];
	categories: string[];
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
	getSkillLevel: (level: number) => string;
}

const categoryLabels: Record<string, string> = {
	all: "すべて",
	frontend: "フロントエンド",
	backend: "バックエンド",
	mobile: "モバイル",
	tool: "ツール",
	other: "その他",
};

const getLevelColor = (level: number): string => {
	switch (level) {
		case 1:
			return "bg-gray-200 text-gray-700";
		case 2:
			return "bg-blue-200 text-blue-700";
		case 3:
			return "bg-green-200 text-green-700";
		case 4:
			return "bg-orange-200 text-orange-700";
		case 5:
			return "bg-red-200 text-red-700";
		default:
			return "bg-gray-200 text-gray-700";
	}
};

export const SkillsSectionUI: React.FC<SkillsSectionUIProps> = ({
	skills,
	categories,
	selectedCategory,
	onCategoryChange,
	getSkillLevel,
}) => {
	return (
		<section className="mb-16">
			<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
				Skills
			</h2>

			{/* Category Filter */}
			<div className="mb-8">
				<div className="flex flex-wrap gap-2">
					{categories.map((category) => (
						<button
							key={category}
							type="button"
							onClick={() => onCategoryChange(category)}
							className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
								selectedCategory === category
									? "bg-blue-600 text-white"
									: "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
							}`}
						>
							{categoryLabels[category] || category}
						</button>
					))}
				</div>
			</div>

			{/* Skills Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{skills.map((skill) => (
					<div
						key={skill.id}
						className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
					>
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								{skill.name}
							</h3>
							<span
								className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(
									skill.level,
								)}`}
							>
								{getSkillLevel(skill.level)}
							</span>
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
							経験年数: {skill.yearsOfExperience}年
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-500">
							{categoryLabels[skill.category] || skill.category}
						</div>
						{skill.certifications && skill.certifications.length > 0 && (
							<div className="mt-3">
								<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
									資格
								</h4>
								{skill.certifications.map((cert) => (
									<span
										key={cert}
										className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded mr-1 mb-1"
									>
										{cert}
									</span>
								))}
							</div>
						)}
					</div>
				))}
			</div>

			{skills.length === 0 && (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					該当するスキルが見つかりません
				</div>
			)}
		</section>
	);
};