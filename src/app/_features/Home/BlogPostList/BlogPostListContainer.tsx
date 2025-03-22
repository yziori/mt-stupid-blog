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
