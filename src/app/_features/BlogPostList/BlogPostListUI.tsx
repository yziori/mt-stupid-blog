"use client";

import type { BlogPost } from "@libs/microcms/blogs/types";
import { BlogCard } from "@components/BlogCard";
import { Pagination } from "@/app/_components/Pagination";
import { useRouter } from "next/navigation";
import Link from "next/link";

type BlogPostListUIProps = {
	blogPosts: BlogPost[];
	currentPage: number;
	totalPages: number;
};

export const BlogPostListUI: React.FC<BlogPostListUIProps> = ({
	blogPosts,
	currentPage,
	totalPages,
}) => {
	const router = useRouter();

	const handlePageChange = (page: number): void => {
		router.push(`/blog/page/${page}`);
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
						Blog
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						技術記事やプログラミングに関する情報を発信しています
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{blogPosts.map((post) => (
						<Link key={post.id} href={`/blog/${post.id}`} className="block group">
							<div className="transform transition-all duration-200 group-hover:scale-105">
								<BlogCard
									id={post.id}
									createdAt={post.createdAt}
									title={post.title}
									tags={post.tags}
									thumbnail={post.thumbnail?.url}
								/>
							</div>
						</Link>
					))}
				</div>

				{blogPosts.length === 0 && (
					<div className="text-center py-16">
						<p className="text-gray-500 dark:text-gray-400 text-lg">
							まだ記事がありません
						</p>
					</div>
				)}

				{totalPages > 1 && (
					<div className="mt-16 flex justify-center">
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChange}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
