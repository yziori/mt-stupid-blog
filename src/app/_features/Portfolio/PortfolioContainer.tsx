import { portfolioData } from "@data/index";
import { PortfolioUI } from "./PortfolioUI";

export const PortfolioContainer: React.FC = () => {
	const { projects, skills, experience, contact } = portfolioData;

	return (
		<PortfolioUI
			projects={projects}
			skills={skills}
			experience={experience}
			contact={contact}
		/>
	);
};