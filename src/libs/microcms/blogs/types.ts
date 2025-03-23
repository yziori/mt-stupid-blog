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

export type BlogResponse = {
	contents: BlogPost[];
	totalCount: number;
	offset: number;
	limit: number;
};
