import type { BlogPostListResponse } from "@/app/_libs/microcms/blogs/types";

type BlogPostDetailUIProps = {
	blogPost: BlogPostListResponse;
};

export const BlogPostDetailUI: React.FC<BlogPostDetailUIProps> = ({
	blogPost,
}) => {
	return (
		<div>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
			<div dangerouslySetInnerHTML={{ __html: blogPost.contents[0].content }} />
		</div>
	);
};
