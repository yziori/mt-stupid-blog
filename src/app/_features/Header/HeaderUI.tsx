import Link from "next/link";
import { Search, Moon } from "lucide-react";
import { Switch } from "@components/ui/switch";
import { Input } from "@components/ui/input";

export const HeaderUI: React.FC = () => {
	return (
		<header className="container mx-auto py-4 px-4 flex items-center justify-between">
			<Link href="/" className="font-bold text-xl">
				Mt.STUPID
			</Link>

			<div className="relative max-w-md w-full mx-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
				<Input
					className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-200"
					placeholder="フリーワードで検索..."
				/>
			</div>

			<nav className="hidden md:flex items-center gap-6">
				<Link href="/about" className="hover:text-[#023474]">
					About
				</Link>
				<Link href="/blog" className="hover:text-[#023474]">
					Blog
				</Link>
				<Link href="/tag" className="hover:text-[#023474]">
					Tag
				</Link>
				<Link href="/portfolio" className="hover:text-[#023474]">
					Portfolio
				</Link>
				<div className="flex items-center gap-2">
					<Moon className="h-4 w-4" />
					<Switch />
				</div>
			</nav>
		</header>
	);
};
