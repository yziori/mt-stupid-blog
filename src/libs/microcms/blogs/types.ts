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

export type BlogPostResponse = {
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

export type BlogPostListResponse = {
	contents: BlogPost[];
	totalCount: number;
	offset: number;
	limit: number;
};
