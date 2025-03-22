import { BlogPostListUI } from "./BlogPostListUI";
import { client } from "@libs/microcms";

// TODO: typeの場所移動すること
// TODO: 呼び出し関数用のディレクトリを作成すること
type Tag = {
	id: string;
	name: string;
};

type Thumbnail = {
	url: string;
};

export type BlogPost = {
	id: string;
	title: string;
	tags: Tag[];
	createdAt: string;
	thumbnail?: Thumbnail;
};

type Response = {
	contents: BlogPost[];
	totalCount: number;
	offset: number;
	limit: number;
};

type BlogPostListContainerProps = {
	page: number;
};

async function getBlogPosts(page: number): Promise<Response> {
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
