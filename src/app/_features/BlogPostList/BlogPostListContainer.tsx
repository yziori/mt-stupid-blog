import { BlogPostListUI } from "./BlogPostListUI";
import { client } from "@/app/_libs/microcms";
import type { GetBlogPostListResponse } from "@/app/_libs/microcms/blogs/types";

type BlogPostListContainerProps = {
	page: number;
};

async function getBlogPosts(page: number): Promise<GetBlogPostListResponse> {
	const data = await client.get({
		endpoint: "blogs",
		queries: {
			fields: "id,title,createdAt,tags,thumbnail",
			limit: 5,
			offset: (page - 1) * 5,
		},
	});
	return data;
}

export const BlogPostListContainer: React.FC<
	BlogPostListContainerProps
> = async ({ page }) => {
	const data = await getBlogPosts(page);
	const blogPosts = data.contents;
	const totalCount = data.totalCount;
	const totalPages = Math.ceil(totalCount / 12);

	return (
		<BlogPostListUI
			blogPosts={blogPosts}
			currentPage={page}
			totalPages={totalPages}
		/>
	);
};
