"use client";

import { useState, useEffect } from "react";
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
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
			<div className="relative">
				{/* 本文コンテナ：大画面時に右側に余白を追加 */}
				<div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-4 md:px-8 lg:px-10 lg:pr-80 py-8">
					{/* Article Header */}
					<div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
						<div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
							<span className="flex items-center gap-1">
								📅 {formatToDotDate(post.publishedAt)}
							</span>
							{post.updatedAt && (
								<span className="flex items-center gap-1">
									📝 {formatToDotDate(post.updatedAt)}
								</span>
							)}
						</div>
						<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
							{post.title}
						</h1>
						<div className="flex gap-2 flex-wrap">
							{post.tags.map((tag, index) => (
								<span
									key={typeof tag === "object" ? (tag.id ?? index) : index}
									className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium"
								>
									#{typeof tag === "object" ? tag.name : tag}
								</span>
							))}
						</div>
					</div>

					{/* Article Body */}
					<article className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg p-6 lg:p-8 shadow-sm">
						{/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
						<div dangerouslySetInnerHTML={{ __html: post.content }} />
					</article>
				</div>

				{/* Fixed TOC：画面スクロールに追従 */}
				<aside className="hidden lg:block fixed top-28 right-4 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto">
					<SimpleTOC tableOfContents={toc} offset={-100} />
				</aside>
			</div>
		</div>
	);
};

function useScrollSpy(ids: string[], offset = 0): string | null {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			const scrollPos = window.scrollY + Math.abs(offset);
			let current: string | null = null;

			for (const id of ids) {
				const el = document.getElementById(id);
				if (el) {
					const top = el.getBoundingClientRect().top + window.scrollY;
					if (scrollPos >= top) {
						current = id;
					}
				}
			}

			setActiveId(current);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll(); // initialize on mount
		return () => window.removeEventListener("scroll", handleScroll);
	}, [ids, offset]);

	return activeId;
}

function SimpleTOC({
	tableOfContents,
	offset,
}: {
	tableOfContents: { id: string; text: string; level: number }[];
	offset: number;
}) {
	const ids = tableOfContents.map((item) => item.id);
	const activeId = useScrollSpy(ids, offset);

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
			<h2 className="font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2 mb-3">
				目次
			</h2>
			<ul className="space-y-2">
				{tableOfContents.map((item) => {
					const isActive = item.id === activeId;
					return (
						<li
							key={item.id}
							className={`${item.level > 2 ? "pl-4" : ""} ${
								isActive
									? "text-blue-600 dark:text-blue-400 font-semibold"
									: "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
							}`}
						>
							<a href={`#${item.id}`} className="text-sm hover:underline block py-1">
								{item.text}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
