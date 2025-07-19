"use client";

import { useState } from "react";
import type { Project } from "@data/types";
import { filterProjectsByCategory, formatDate } from "@utils/portfolioUtils";
import { ProjectsSectionUI } from "./ProjectsSectionUI";

interface ProjectsSectionContainerProps {
	projects: Project[];
}

export const ProjectsSectionContainer: React.FC<ProjectsSectionContainerProps> = ({
	projects,
}) => {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const categories = ["all", ...Array.from(new Set(projects.map(p => p.category)))];
	const filteredProjects = filterProjectsByCategory(projects, selectedCategory);

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
	};

	return (
		<ProjectsSectionUI
			projects={filteredProjects}
			categories={categories}
			selectedCategory={selectedCategory}
			onCategoryChange={handleCategoryChange}
			formatDate={formatDate}
		/>
	);
};