import Link from "next/link";
import { Search } from "lucide-react";
import { Switch } from "@components/ui/switch";
import { Input } from "@components/ui/input";

export const HeaderUI: React.FC = () => {
	return (
		<header className="px-4 py-4 fixed top-0 left-0 right-0 z-50">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white dark:bg-gray-800 rounded-full px-6 py-3 flex items-center justify-between shadow-lg">
					<div className="flex items-center gap-6">
						<Link
							href="/"
							className="text-xl font-bold text-gray-900 dark:text-white"
						>
							Mt.STUPID
						</Link>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
							<Input
								placeholder="フリーワードで検索..."
								className="pl-10 w-64 border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>
					<div className="flex items-center gap-6">
						<nav className="flex items-center gap-6">
							<Link
								href="/blog/page/1"
								className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
							>
								Blog
							</Link>
							<Link
								href="/tags"
								className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
							>
								Tag
							</Link>
							<Link
								href="/portfolio"
								className="text-gray-400 dark:text-gray-500 font-medium cursor-not-allowed"
								aria-disabled="true"
							>
								Portfolio
							</Link>
						</nav>
						<Switch />
					</div>
				</div>
			</div>
		</header>
	);
};
