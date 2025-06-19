import Link from "next/link";
import { BlogPostList } from "@/app/_features/Home/BlogPostList";
import { About } from "@/app/_features/Home/About";

export const HomeUI: React.FC = () => {
	return (
		<>
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-[#022B92] to-[#00AEFE] z-0" />
				<div className="container mx-auto px-4 pt-32 relative z-10 pb-12">
					<div className="flex items-center max-w-5xl mx-auto">
						<div className="flex-1 text-white">
							<h1 className="text-7xl font-bold mb-4 leading-tight">
								Mt.STUPID
							</h1>
							<p className="text-2xl mb-8 font-semibold text-blue-100">
								TECH BLOG
							</p>
							<p className="text-lg leading-relaxed text-blue-50 max-w-lg">
								技術的な学びや経験を共有するためのブログ
								<br />
								フロントエンドを中心に、気になる技術の情報を発信
							</p>
						</div>
						<div className="flex-1 hidden lg:block flex-shrink-0">
							<div className="flex justify-self-end">
								<img
									src="/images/mt-stupid.png"
									alt="Mt.STUPID"
									width={350}
									height={350}
								/>
							</div>
						</div>
					</div>
				</div>
			</section>
			<About />
			<BlogPostList />
		</>
	);
};
