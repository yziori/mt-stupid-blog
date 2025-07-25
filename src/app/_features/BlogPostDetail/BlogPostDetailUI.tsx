import type { BlogPost } from "@/app/_libs/microcms/blogs/types";
import { renderToc } from "./renderToc";
import { formatToDotDate } from "@utils/dataUtils";
import { TableOfContents } from "./TableOfContents";
import "zenn-content-css";
import markdownToHtml from "zenn-markdown-html";

type BlogPostDetailUIProps = {
	blogPost: BlogPost;
};

export const BlogPostDetailUI: React.FC<BlogPostDetailUIProps> = ({
	blogPost,
}) => {
	const post = blogPost;
	const html = markdownToHtml(blogPost.content);
	const toc = renderToc(html);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
			<div className="relative">
				{/* 本文コンテナ：大画面時に右側に余白を追加 */}
				<div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full px-4 md:px-8 lg:px-10 lg:pr-80 py-8">
					{/* Article Header */}
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm pb-0">
						<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
							{post.title}
						</h1>
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
					<article className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
						<div
							className="znc"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</article>
				</div>

				{/* Fixed TOC：画面スクロールに追従 */}
				<aside className="hidden lg:block fixed top-28 right-8 xl:right-12 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto">
					<TableOfContents tableOfContents={toc} offset={-100} />
				</aside>
			</div>
		</div>
	);
};
