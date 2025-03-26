import { client } from "@/app/_libs/microcms";
import type { BlogPostListResponse } from "@/app/_libs/microcms/blogs/types";
import { BlogPostDetailUI } from "./BlogPostDetailUI";

async function getBlogPost(contentId: string): Promise<BlogPostListResponse> {
	const data = await client.get({
		endpoint: "blogs",
		contentId,
	});

	return data;
}

type BlogPostDetailContainerProps = {
	blogPostId: string;
};

export const BlogPostDetailContainer: React.FC<
	BlogPostDetailContainerProps
> = async ({ blogPostId }) => {
	const blogPost = await getBlogPost(blogPostId);

	return (
		<>
			<BlogPostDetailUI blogPost={blogPost} />
		</>
	);
};
