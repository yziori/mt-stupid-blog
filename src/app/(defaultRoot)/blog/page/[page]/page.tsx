import { client } from "@/app/_libs/microcms";
import { BlogPostList } from "@features/BlogPostList";

export async function generateStaticParams() {
	const data = await client.get({
		endpoint: "blogs",
		queries: {
			fields: "id",
			limit: 0,
		},
	});

	const totalCount = data.totalCount;
	const totalPages = Math.ceil(totalCount / 5);

	const pages = Array.from({ length: totalPages }, (_, i) => ({
		page: String(i + 1),
	}));

	return pages;
}

type BlogPostListPageParams = {
	params: { page: string };
};

export default async function BlogPostListPage({
	params,
}: BlogPostListPageParams) {
	const page = Number(params.page);

	return <BlogPostList page={page} />;
}
