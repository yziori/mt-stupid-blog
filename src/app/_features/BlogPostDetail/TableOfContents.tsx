"use client";

import { useState, useEffect } from "react";

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

export function TableOfContents({
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
							<a
								href={`#${item.id}`}
								className="text-sm hover:underline block py-1"
							>
								{item.text}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
