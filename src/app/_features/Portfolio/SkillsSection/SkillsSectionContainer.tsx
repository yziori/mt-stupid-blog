"use client";

import { useState } from "react";
import type { Skill } from "@data/types";
import { groupSkillsByCategory, getSkillLevel } from "@utils/portfolioUtils";
import { SkillsSectionUI } from "./SkillsSectionUI";

interface SkillsSectionContainerProps {
	skills: Skill[];
}

export const SkillsSectionContainer: React.FC<SkillsSectionContainerProps> = ({
	skills,
}) => {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const skillsByCategory = groupSkillsByCategory(skills);
	const categories = ["all", ...Object.keys(skillsByCategory)];

	const filteredSkills =
		selectedCategory === "all" ? skills : skillsByCategory[selectedCategory] || [];

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
	};

	return (
		<SkillsSectionUI
			skills={filteredSkills}
			categories={categories}
			selectedCategory={selectedCategory}
			onCategoryChange={handleCategoryChange}
			getSkillLevel={getSkillLevel}
		/>
	);
};