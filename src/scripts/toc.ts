// TOC active section + scroll progress
export {};

(function () {
	const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc a"));
	const sections = tocLinks
		.map((a) => document.querySelector<HTMLElement>(a.getAttribute("href") || ""))
		.filter((s): s is HTMLElement => s !== null);
	const progPct = document.getElementById("progress-pct");
	const progFill = document.getElementById("progress-fill");

	function onScroll() {
		const y = window.scrollY + 120;
		let activeIdx = 0;
		sections.forEach((s, i) => {
			if (s.offsetTop <= y) activeIdx = i;
		});
		tocLinks.forEach((a, i) => a.classList.toggle("active", i === activeIdx));

		if (progFill && progPct) {
			const docH = document.documentElement.scrollHeight - window.innerHeight;
			const pct = docH > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / docH) * 100))) : 0;
			progFill.style.width = pct + "%";
			progPct.textContent = pct + "%";
		}
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	tocLinks.forEach((a) => {
		a.addEventListener("click", (e) => {
			e.preventDefault();
			const target = document.querySelector<HTMLElement>(a.getAttribute("href") || "");
			if (target) window.scrollTo({ top: target.offsetTop - 24, behavior: "smooth" });
		});
	});
})();
