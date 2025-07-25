import Link from "next/link";

export const AboutUI: React.FC = () => {
	return (
		<section className="container mx-auto px-4 py-16">
			<h2 className="text-3xl font-bold text-[#023474] mb-8">About</h2>

			<div className="bg-white rounded-lg p-8 mb-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<div className="flex-shrink-0">
						<img
							src="/images/profile.png"
							alt="Profile"
							className="w-40 h-40 rounded-full object-cover"
						/>
					</div>
					<div className="flex-1 text-center md:text-left">
						<h3 className="text-2xl font-semibold text-gray-900 mb-2">
							イオリ
						</h3>
						<p className="text-gray-700 mb-4 text-sm leading-relaxed">
							フロントエンド中心にWeb開発をしています。
							必要に応じてバックエンドやモバイルもさわっていて、試しながら学んでいるところです。
						</p>
						<div className="flex items-center justify-center md:justify-start gap-4">
							{/* Twitter/X アイコン */}
							<Link href="https://x.com/Yz_Iori" aria-label="Twitter/X">
								<svg
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="currentColor"
									role="img"
									aria-labelledby="x-title"
								>
									<title id="x-title">Twitter/X</title>
									<path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
								</svg>
							</Link>
							{/* Githubアイコン */}
							<Link href="https://github.com/yziori" aria-label="GitHub">
								<svg
									width="32"
									height="32"
									viewBox="0 0 98 96"
									fill="currentColor"
									role="img"
									aria-labelledby="github-title"
								>
									<title id="github-title">GitHub</title>
									<path
										fillRule="evenodd"
										clipRule="evenodd"
										d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
									/>
								</svg>
							</Link>
							{/* Qiitaアイコン */}
							<Link href="https://qiita.com/Yz_Iori" aria-label="Qiita">
								<div className="w-8 h-8">
									<img
										src="/images/qiita-icon.png"
										alt="Qiita"
										width={32}
										height={32}
										className="w-full h-full object-contain"
									/>
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
