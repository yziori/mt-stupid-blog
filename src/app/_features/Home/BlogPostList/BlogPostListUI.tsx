import { BlogCard } from "@components/BlogCard";
import { Button } from "@components/ui/button";
import type { BlogPost } from "@libs/microcms/blogs/types";
import Link from "next/link";

type BlogPostListUIProps = {
	posts: BlogPost[];
};

/**
 * BlogListコンポーネントのUI部分
 */
export const BlogPostListUI: React.FC<BlogPostListUIProps> = ({ posts }) => {
	return (
		<section className="container mx-auto px-4 py-16">
			<h2 className="text-3xl font-bold text-[#023474] mb-8">Blog</h2>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{posts.map((post) => (
					<Link key={post.id} href={`/blog/${post.id}`} className="block">
						<BlogCard
							key={post.id}
							id={post.id}
							title={post.title}
							tags={post.tags}
							createdAt={post.createdAt}
							thumbnail={post.thumbnail?.url}
						/>
					</Link>
				))}
			</div>

			<div className="flex justify-center mt-12">
				<Link href={"/blog/page/1"}>
					<Button className="bg-[#023474] hover:bg-[#023474]/90 text-white px-8 py-2 rounded-full">
						もっと見る <span className="ml-2">→</span>
					</Button>
				</Link>
			</div>
		</section>
	);
};
