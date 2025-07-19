"use client";

import Link from "next/link";
import type { Project } from "@data/types";
import { ExternalLink, Github } from "lucide-react";

interface ProjectsSectionUIProps {
	projects: Project[];
	categories: string[];
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
	formatDate: (dateString: string) => string;
}

const categoryLabels: Record<string, string> = {
	all: "すべて",
	web: "Web",
	mobile: "モバイル",
	backend: "バックエンド",
	tool: "ツール",
	other: "その他",
};

const getStatusColor = (status: Project["status"]): string => {
	switch (status) {
		case "completed":
			return "bg-green-100 text-green-800";
		case "in-progress":
			return "bg-yellow-100 text-yellow-800";
		case "planned":
			return "bg-gray-100 text-gray-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

const getStatusLabel = (status: Project["status"]): string => {
	switch (status) {
		case "completed":
			return "完了";
		case "in-progress":
			return "進行中";
		case "planned":
			return "予定";
		default:
			return "不明";
	}
};

export const ProjectsSectionUI: React.FC<ProjectsSectionUIProps> = ({
	projects,
	categories,
	selectedCategory,
	onCategoryChange,
	formatDate,
}) => {
	return (
		<section className="mb-16">
			<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
				Projects
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

			{/* Projects Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{projects.map((project) => (
					<div
						key={project.id}
						className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
					>
						{/* Project Image */}
						{project.images.length > 0 && (
							<div className="aspect-video bg-gray-200 dark:bg-gray-700">
								<img
									src={project.images[0]}
									alt={project.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.src = "/images/mt-stupid.png";
									}}
								/>
							</div>
						)}

						<div className="p-6">
							{/* Project Header */}
							<div className="flex items-start justify-between mb-3">
								<div className="flex-1">
									<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
										{project.title}
									</h3>
									<div className="flex items-center gap-2 mb-2">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
												project.status,
											)}`}
										>
											{getStatusLabel(project.status)}
										</span>
										<span className="text-sm text-gray-500 dark:text-gray-400">
											{categoryLabels[project.category] || project.category}
										</span>
									</div>
								</div>
							</div>

							{/* Project Description */}
							<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
								{project.description}
							</p>

							{/* Technologies */}
							<div className="mb-4">
								<div className="flex flex-wrap gap-1">
									{project.technologies.slice(0, 6).map((tech) => (
										<span
											key={tech}
											className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
										>
											{tech}
										</span>
									))}
									{project.technologies.length > 6 && (
										<span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
											+{project.technologies.length - 6} more
										</span>
									)}
								</div>
							</div>

							{/* Date Range */}
							<div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
								{formatDate(project.startDate)}
								{project.endDate && ` - ${formatDate(project.endDate)}`}
							</div>

							{/* Project Links */}
							<div className="flex items-center gap-3">
								{project.demoUrl && (
									<Link
										href={project.demoUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
									>
										<ExternalLink className="w-4 h-4" />
										Demo
									</Link>
								)}
								{project.githubUrl && (
									<Link
										href={project.githubUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm font-medium"
									>
										<Github className="w-4 h-4" />
										Source
									</Link>
								)}
							</div>

							{/* Challenges & Learnings Preview */}
							{(project.challenges.length > 0 || project.learnings.length > 0) && (
								<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
									{project.challenges.length > 0 && (
										<div className="mb-2">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												主な課題:
											</span>
											<span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
												{project.challenges[0]}
												{project.challenges.length > 1 && " など"}
											</span>
										</div>
									)}
									{project.learnings.length > 0 && (
										<div>
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												学んだこと:
											</span>
											<span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
												{project.learnings[0]}
												{project.learnings.length > 1 && " など"}
											</span>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{projects.length === 0 && (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					該当するプロジェクトが見つかりません
				</div>
			)}
		</section>
	);
};