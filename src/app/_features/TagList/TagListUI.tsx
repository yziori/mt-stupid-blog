import type { Tag } from "@/app/_libs/microcms/tags/types";
import Link from "next/link";

export function TagListUI({ tags }: { tags: Tag[] }) {
	return (
		<div className="container mx-auto px-4 py-16 flex-grow">
			<h1 className="text-5xl font-bold text-center mb-16">Tag</h1>

			<div className="max-w-4xl mx-auto">
				<h2 className="text-2xl font-bold mb-8">タグから探す</h2>

				<div className="flex flex-wrap gap-3">
					{tags.map((tag) => (
						<Link
							key={tag.id}
							href={`/blog?tag=${encodeURIComponent(tag.name)}`}
							className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition-colors"
						>
							#{tag.name}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
