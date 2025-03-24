import type { BlogPostResponse } from "@/libs/microcms/blogs/types";

type BlogPostDetailUIProps = {
	blogPost: BlogPostResponse;
};

export const BlogPostDetailUI: React.FC<BlogPostDetailUIProps> = ({
	blogPost,
}) => {
	return (
		<div>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
			<div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
		</div>
	);
};
