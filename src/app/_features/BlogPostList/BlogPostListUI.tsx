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
		<div className="container mx-auto px-4 py-12 flex-grow">
			<h1 className="text-5xl font-bold text-center mb-12">Blog</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{blogPosts.map((post) => (
					<Link key={post.id} href={`/blog/${post.id}`} className="block">
						<BlogCard
							id={post.id}
							createdAt={post.createdAt}
							title={post.title}
							tags={post.tags}
							thumbnail={post.thumbnail?.url}
						/>
					</Link>
				))}
			</div>

			{/* Pagination */}
			<div className="mt-12">
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			</div>
		</div>
	);
};
