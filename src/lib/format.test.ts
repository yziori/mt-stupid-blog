import { describe, expect, it } from "vitest";
import { formatShortDate, formatYearMonth } from "./format";

describe("formatShortDate", () => {
	it("returns MM / DD", () => {
		expect(formatShortDate(new Date("2026-04-20T00:00:00Z"))).toBe("04 / 20");
	});
});

describe("formatYearMonth", () => {
	it("returns YYYY-MM", () => {
		expect(formatYearMonth(new Date("2025-11-03T00:00:00Z"))).toBe("2025-11");
	});
});
