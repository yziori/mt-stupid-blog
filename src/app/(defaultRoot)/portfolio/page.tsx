import type { Metadata } from "next";
import { Portfolio } from "@features/Portfolio";

export const metadata: Metadata = {
	title: "Portfolio | Mt.STUPID",
	description: "イオリのポートフォリオページ。スキル、プロジェクト、経歴について紹介しています。",
	openGraph: {
		title: "Portfolio | Mt.STUPID",
		description: "イオリのポートフォリオページ。スキル、プロジェクト、経歴について紹介しています。",
		type: "website",
	},
};

export default function PortfolioPage() {
	return <Portfolio />;
}