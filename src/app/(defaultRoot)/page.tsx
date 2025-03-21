import Link from "next/link";
import { client } from "@/libs/microcms";
import { BlogPostList } from "@features/BlogPostList";
import { Header } from "@features/Header";
import { Footer } from "@features/Footer";

export default async function Home() {
	return (
		<main>
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-[#023474] to-[#6a98d0] z-0">
					<div className="absolute bottom-0 left-0 right-0">
						<svg
							viewBox="0 0 1440 320"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							role="img"
							aria-label="Decorative wave background"
						>
							<title>Wave background</title>
							<path
								d="M0,192L80,176C160,160,320,128,480,128C640,128,800,160,960,165.3C1120,171,1280,149,1360,138.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
								fill="white"
							/>
						</svg>
					</div>
				</div>

				<div className="container mx-auto px-4 pt-16 pb-32 relative z-10">
					<div className="max-w-2xl text-white">
						<h1 className="text-5xl font-bold mb-2">Mt. STUPID</h1>
						<p className="text-xl mb-6">Tech Blog presented by Iori</p>
						<p className="mb-6">
							このブログの詳細や経歴について、ブログ名の由来などを簡易的に書いてください。でされば2行程度に収めてください。
						</p>
						<Link
							href="/about"
							className="inline-flex items-center text-white hover:underline"
						>
							About me →
						</Link>
					</div>
				</div>
			</section>

			<BlogPostList />
		</main>
	);
}
