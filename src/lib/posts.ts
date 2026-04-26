type Frontmatter = {
	title: string;
	tags: string[];
	publishedAt: Date;
	featured?: boolean;
	pickupBadge?: "top" | "editor";
	draft?: boolean;
};

type Post = { id: string; data: Frontmatter };

export function visiblePosts<P extends Post>(posts: P[]): P[] {
	return posts.filter((p) => !p.data.draft);
}

export function sortedByPublished<P extends Post>(posts: P[]): P[] {
	return [...posts].sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function aggregateTags<P extends Post>(posts: P[]): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	const order = new Map<string, number>();
	let tagIndex = 0;
	for (const p of visiblePosts(posts)) {
		for (const t of p.data.tags) {
			counts.set(t, (counts.get(t) ?? 0) + 1);
			if (!order.has(t)) {
				order.set(t, tagIndex++);
			}
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || order.get(a.tag)! - order.get(b.tag)!);
}

export function pickupPosts<P extends Post>(posts: P[], limit = 4): P[] {
	const visible = sortedByPublished(visiblePosts(posts));
	const featured = visible.filter((p) => p.data.featured);
	const filler = visible.filter((p) => !p.data.featured);
	return [...featured, ...filler].slice(0, limit);
}

export function relatedPosts<P extends Post>(target: P, all: P[], limit = 3): P[] {
	const tagSet = new Set(target.data.tags);
	return visiblePosts(all)
		.filter((p) => p.id !== target.id)
		.map((p) => ({
			post: p,
			shared: p.data.tags.filter((t) => tagSet.has(t)).length,
		}))
		.filter((x) => x.shared > 0)
		.sort(
			(a, b) =>
				b.shared - a.shared ||
				b.post.data.publishedAt.getTime() - a.post.data.publishedAt.getTime(),
		)
		.slice(0, limit)
		.map((x) => x.post);
}
