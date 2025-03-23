import { BlogPostListUI } from "./BlogPostListUI";
import { client } from "@/libs/microcms";
import type { BlogPost } from "@/libs/microcms/blogs/types";

export const BlogPostListContainer = async () => {
	async function getBlogPosts(): Promise<BlogPost[]> {
		const data = await client.get({
			endpoint: "blogs",
			queries: {
				fields: "id,title,createdAt,tags,thumbnail",
				limit: 5,
			},
		});
		return data.contents;
	}

	const posts = await getBlogPosts();

	return <BlogPostListUI posts={posts} />;
};
