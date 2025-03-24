import { client } from "@/libs/microcms";

export async function generateStaticParams() {
	const data = await client.get({
		endpoint: "blogs",
		queries: {
			fields: "id",
		},
	});

	const slugs = data.contents.map((content: { id: string }) => content.id);

	const paths = slugs.map((slug: string) => ({
		params: { slug },
	}));

	return paths;
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
			<h1>BlogPostDetailPage</h1>
		</main>
	);
}
