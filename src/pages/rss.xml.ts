import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { sortedByPublished, visiblePosts } from "@/lib/posts";

export async function GET(context: APIContext) {
	const posts = sortedByPublished(visiblePosts(await getCollection("blog")));
	return rss({
		title: "Mt. Stupid",
		description: "notes from the peak of my own confidence",
		site: context.site!,
		items: posts.map((p) => ({
			title: p.data.title,
			description: p.data.description,
			pubDate: p.data.publishedAt,
			link: `/blog/${p.slug}/`,
			categories: p.data.tags,
		})),
		customData: "<language>ja</language>",
	});
}
