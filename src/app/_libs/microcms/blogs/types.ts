type Tag = {
	id: string;
	name: string;
};

type Thumbnail = {
	url: string;
};

export type BlogPost = {
	id: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	reviseAt: string;
	title: string;
	content: string;
	tags: Tag[];
	thumbnail: Thumbnail;
};

export type GetBlogPostListResponse = {
	contents: BlogPost[];
	totalCount: number;
	offset: number;
	limit: number;
};
