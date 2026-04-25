import type { Project } from "./types";

export const projects: Project[] = [
	{
		id: "mt-stupid-blog",
		title: "Mt.STUPID Tech Blog",
		description: "Next.js 15 + microCMSで構築した技術ブログサイト",
		longDescription: `
			Next.js 15のApp Routerを使用して開発した技術ブログサイトです。
			microCMSをヘッドレスCMSとして採用し、記事の管理を効率化しています。
			TypeScriptによる型安全性の確保、Tailwind CSSによるレスポンシブデザイン、
			Storybookを使用したコンポーネント開発など、モダンな開発手法を取り入れています。
		`,
		technologies: [
			"Next.js 15",
			"TypeScript",
			"Tailwind CSS",
			"microCMS",
			"Radix UI",
			"Storybook",
			"Biome",
			"Vitest",
		],
		images: ["/images/mt-stupid.png"],
		githubUrl: "https://github.com/yziori/mt-stupid-blog",
		demoUrl: "https://mt-stupid.vercel.app",
		startDate: "2024-01-01",
		status: "completed",
		relatedArticleIds: [],
		challenges: [
			"Next.js 15の新機能への対応",
			"microCMSとの効率的な連携",
			"SEO最適化の実装",
			"レスポンシブデザインの実装",
		],
		learnings: [
			"Next.js App Routerの活用方法",
			"TypeScriptによる型安全な開発",
			"ヘッドレスCMSの活用",
			"モダンなフロントエンド開発フロー",
		],
		category: "web",
	},
	{
		id: "portfolio-feature",
		title: "ポートフォリオ機能",
		description: "技術ブログサイトに追加したポートフォリオ表示機能",
		longDescription: `
			既存の技術ブログサイトに、スキル、プロジェクト、経歴を表示するポートフォリオ機能を追加。
			静的データ管理による高速な表示と、レスポンシブデザインによる優れたユーザー体験を実現。
			Container/UIパターンを採用し、保守性の高い設計を心がけました。
		`,
		technologies: [
			"Next.js 15",
			"TypeScript",
			"Tailwind CSS",
			"React",
		],
		images: ["/images/mt-stupid.png"],
		startDate: "2024-07-01",
		status: "in-progress",
		relatedArticleIds: [],
		challenges: [
			"既存アーキテクチャとの統合",
			"レスポンシブデザインの最適化",
			"データ管理戦略の選定",
		],
		learnings: [
			"静的データ管理の効果的な活用",
			"コンポーネント設計のベストプラクティス",
			"ユーザー体験の向上手法",
		],
		category: "web",
	},
];