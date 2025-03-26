import { BlogPostDetail } from "@/app/_features/BlogPostDetail";
import { client } from "@/app/_libs/microcms";

export async function generateStaticParams() {
	const data = await client.get({
		endpoint: "blogs",
		queries: {
			fields: "id",
		},
	});

	return data.contents.map((content: { id: string }) => ({
		id: content.id,
	}));
}

type BlogPostDetailPageParams = {
	params: { slug: string };
};

export default async function BlogPostDetailPage({
	params,
}: BlogPostDetailPageParams) {
	const blogPostId = params.slug;

	return (
		<main>
			<BlogPostDetail blogPostId={blogPostId} />
		</main>
	);
}
