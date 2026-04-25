const pad = (n: number) => String(n).padStart(2, "0");

export function formatShortDate(d: Date): string {
	return `${pad(d.getUTCMonth() + 1)} / ${pad(d.getUTCDate())}`;
}

export function formatYearMonth(d: Date): string {
	return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function formatLongDate(d: Date): string {
	return `${d.getUTCFullYear()} / ${pad(d.getUTCMonth() + 1)} / ${pad(d.getUTCDate())}`;
}
