import Link from "next/link";

export const FooterUI: React.FC = () => {
	return (
		<footer className="bg-[#262626] text-white py-6 mt-auto">
			<div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
				<p>©2024 Copyright</p>
				<div className="flex gap-6 mt-4 md:mt-0">
					<Link href="/terms" className="text-sm hover:underline">
						利用規約
					</Link>
					<Link href="/privacy" className="text-sm hover:underline">
						プライバシーポリシー
					</Link>
				</div>
			</div>
		</footer>
	);
};
