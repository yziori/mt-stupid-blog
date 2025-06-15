import { describe, it, expect } from "vitest";
import { renderToc } from "./renderToc";

describe("renderTocのテスト", () => {
	it("見出しがない場合は空の配列を返す", () => {
		const body = "<div>テキストのみ</div>";
		const result = renderToc(body);
		expect(result).toEqual([]);
	});

	it("TOCが正しく解析されて生成されていること", () => {
		const body = '<h1 id="heading1">見出し1</h1><h2 id="heading2">見出し2</h2>';
		const result = renderToc(body);
		expect(result).toEqual([
			{ text: "見出し1", id: "heading1", level: 1 },
			{ text: "見出し2", id: "heading2", level: 2 },
		]);
	});
});
