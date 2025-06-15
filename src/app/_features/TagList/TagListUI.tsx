import type { Tag } from "@/app/_libs/microcms/tags/types";
import Link from "next/link";

export function TagListUI({ tags }: { tags: Tag[] }) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
						Tag
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						タグから関連する記事を探すことができます
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg p-6 lg:p-8 shadow-sm">
					<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
						タグ一覧 ({tags.length})
					</h2>

					{tags.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 dark:text-gray-400 text-lg">
								まだタグがありません
							</p>
						</div>
					) : (
						<div className="flex flex-wrap gap-3">
							{tags.map((tag) => (
								<Link
									key={tag.id}
									href={`/blog?tag=${encodeURIComponent(tag.name)}`}
									className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 hover:scale-105"
								>
									#{tag.name}
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
