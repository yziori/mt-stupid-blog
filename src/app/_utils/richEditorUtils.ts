import markdownToHtml from "zenn-markdown-html";

/**
 * microCMSから返却されるマークダウンコンテンツを
 * 適切にレンダリング可能なHTMLに変換する
 */
export function processMarkdownContent(markdown: string): string {
	try {
		// マークダウン → 適切なHTML
		const processedHtml = markdownToHtml(markdown, {
			embedOrigin: "https://embed.zenn.studio", // 埋め込みコンテンツ用
		});
		
		return processedHtml;
	} catch (error) {
		console.error("Failed to process markdown content:", error);
		// エラー時は元のマークダウンをそのまま返す
		return markdown;
	}
}