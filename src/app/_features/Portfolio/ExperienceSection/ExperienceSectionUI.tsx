import type { Experience } from "@data/types";

interface ExperienceSectionUIProps {
	experience: Experience[];
}

export const ExperienceSectionUI: React.FC<ExperienceSectionUIProps> = ({
	experience,
}) => {
	return (
		<section className="mb-16">
			<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
				Experience
			</h2>

			<div className="space-y-6">
				{experience.map((exp) => (
					<div
						key={exp.id}
						className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
					>
						<div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
							<div className="flex-1">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
									{exp.position}
								</h3>
								<h4 className="text-lg text-blue-600 dark:text-blue-400 mb-2">
									{exp.company}
								</h4>
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400 md:text-right">
								{exp.period}
							</div>
						</div>

						<p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
							{exp.description}
						</p>

						{exp.technologies.length > 0 && (
							<div>
								<h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									使用技術
								</h5>
								<div className="flex flex-wrap gap-1">
									{exp.technologies.map((tech) => (
										<span
											key={tech}
											className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			{experience.length === 0 && (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					経歴情報が登録されていません
				</div>
			)}
		</section>
	);
};