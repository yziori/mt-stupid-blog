"use client";

import type { BlogPost } from "@/app/_libs/microcms/blogs/types";
import { renderToc } from "./renderToc";
import { formatToDotDate } from "@utils/dataUtils";

type BlogPostDetailUIProps = {
	blogPost: BlogPost;
};

export const BlogPostDetailUI: React.FC<BlogPostDetailUIProps> = ({
	blogPost,
}) => {
	const post = blogPost;
	const toc = renderToc(post.content);

	return (
		<div className="relative">
			{/* 本文コンテナ：大画面時に右側に余白を追加 */}
			<div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-4 md:px-10 lg:pr-72">
				{/* Article Header */}
				<div className="mb-8">
					<div className="flex gap-2 text-sm text-gray-500 mb-2">
						<span>📅 {formatToDotDate(post.publishedAt)}</span>
						{post.updatedAt && (
							<span>📝 {formatToDotDate(post.updatedAt)}</span>
						)}
					</div>
					<h1 className="text-3xl font-bold mb-4">{post.title}</h1>
					<div className="flex gap-2 flex-wrap">
						{post.tags.map((tag, index) => (
							<span
								key={typeof tag === "object" ? tag.id || index : index}
								className="text-xs bg-gray-100 px-2 py-1 rounded-full"
							>
								#{typeof tag === "object" ? tag.name : tag}
							</span>
						))}
					</div>
				</div>

				{/* Article Body */}
				<article className="prose dark:prose-invert max-w-none">
					{/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
					<div dangerouslySetInnerHTML={{ __html: post.content }} />
				</article>
			</div>

			{/* Fixed TOC：画面スクロールに追従 */}
			<aside className="hidden lg:block fixed top-24 right-4 w-64">
				<SimpleTOC tableOfContents={toc} />
			</aside>
		</div>
	);
};

function SimpleTOC({
	tableOfContents,
}: {
	tableOfContents: { id: string; text: string; level: number }[];
}) {
	return (
		<div className="bg-[#d6e8ff] rounded-md p-4">
			<h2 className="font-bold border-b border-gray-300 pb-2 mb-2">目次</h2>
			<ul className="space-y-1">
				{tableOfContents.map((item) => (
					<li key={item.id} className={item.level > 2 ? "pl-4" : ""}>
						<a href={`#${item.id}`} className="text-sm hover:underline">
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
