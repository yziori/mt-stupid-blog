import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			publishedAt: z.coerce.date(),
			updatedAt: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			thumbnail: image().optional(),
			featured: z.boolean().default(false),
			pickupBadge: z.enum(["top", "editor"]).optional(),
			coverTitle: z.string().optional(),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
