import type { Project, Skill, Experience, ContactInfo } from "@data/types";
import { SkillsSection } from "./SkillsSection";
import { ProjectsSection } from "./ProjectsSection";
import { ExperienceSection } from "./ExperienceSection";

interface PortfolioUIProps {
	projects: Project[];
	skills: Skill[];
	experience: Experience[];
	contact: ContactInfo;
}

export const PortfolioUI: React.FC<PortfolioUIProps> = ({
	projects,
	skills,
	experience,
	contact,
}) => {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
			<div className="container mx-auto px-4 py-16">
				{/* Page Title */}
				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
						Portfolio
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						スキル、プロジェクト、経歴について紹介します
					</p>
				</div>

				{/* Skills Section */}
				<SkillsSection skills={skills} />

				{/* Projects Section */}
				<ProjectsSection projects={projects} />

				{/* Experience Section */}
				<ExperienceSection experience={experience} />
			</div>
		</div>
	);
};