import { describe, expect, it } from "vitest";
import { aggregateTags, pickupPosts, relatedPosts } from "./posts";

type P = {
	id: string;
	data: {
		title: string;
		tags: string[];
		publishedAt: Date;
		featured?: boolean;
		pickupBadge?: "top" | "editor";
		draft?: boolean;
	};
};

const mk = (
	id: string,
	publishedAt: string,
	tags: string[],
	extra: Partial<P["data"]> = {},
): P => ({
	id,
	data: { title: id, tags, publishedAt: new Date(publishedAt), ...extra },
});

describe("aggregateTags", () => {
	it("counts tag occurrences and sorts by count desc", () => {
		const posts = [
			mk("a", "2026-01-01", ["ts", "react"]),
			mk("b", "2026-01-02", ["ts"]),
			mk("c", "2026-01-03", ["go"]),
		];
		expect(aggregateTags(posts)).toEqual([
			{ tag: "ts", count: 2 },
			{ tag: "react", count: 1 },
			{ tag: "go", count: 1 },
		]);
	});

	it("ignores draft posts", () => {
		const posts = [mk("a", "2026-01-01", ["ts"]), mk("b", "2026-01-02", ["ts"], { draft: true })];
		expect(aggregateTags(posts)).toEqual([{ tag: "ts", count: 1 }]);
	});
});

describe("pickupPosts", () => {
	it("returns featured first (newest first), filling with newest non-featured up to limit", () => {
		const posts = [
			mk("old-feat", "2026-01-01", [], { featured: true }),
			mk("new-feat", "2026-04-01", [], { featured: true }),
			mk("newest", "2026-05-01", []),
			mk("mid", "2026-03-01", []),
		];
		const r = pickupPosts(posts, 3).map((p) => p.id);
		expect(r).toEqual(["new-feat", "old-feat", "newest"]);
	});
});

describe("relatedPosts", () => {
	it("ranks by shared tag count then by publishedAt desc, excludes self", () => {
		const target = mk("self", "2026-04-20", ["a", "b"]);
		const candidates = [
			mk("self", "2026-04-20", ["a", "b"]),
			mk("two", "2026-04-10", ["a", "b"]),
			mk("one-new", "2026-04-19", ["a"]),
			mk("one-old", "2026-01-19", ["a"]),
			mk("none", "2026-05-01", ["x"]),
		];
		const r = relatedPosts(target, candidates, 3).map((p) => p.id);
		expect(r).toEqual(["two", "one-new", "one-old"]);
	});
});
