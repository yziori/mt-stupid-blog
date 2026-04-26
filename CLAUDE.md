# CLAUDE.md

必ず日本語で回答してください。

## Stack
**Astro 5 SSG + React islands + Cloudflare Workers**。Next.js / Tailwind / shadcn/ui ではありません (パッケージ名から誤推測しがちなので明記)。

## Commands
- パッケージマネージャは **pnpm** 固定 (`npm` / `yarn` 不可)
- 型/スキーマ検証は `pnpm astro check` が本命。`tsc` は使いません
- ローカルでCloudflare配信を再現: `pnpm build && pnpm wrangler dev` (port 8787)
- デプロイ: `pnpm deploy` (= `pnpm build && wrangler deploy`)

それ以外のscript (`dev`/`build`/`test` 等) は `package.json` 参照。

## 規約
- 記事ファイル名は `src/content/blog/YYYY-MM-DD-<slug>.md` (READMEで規定)
- 記事一覧の絞込み・並び替え・集計は `src/lib/posts.ts` のヘルパー (`visiblePosts` / `sortedByPublished` / `aggregateTags` / `pickupPosts` / `relatedPosts`) を必ず通す。生配列を直接 `filter` / `sort` しない
- frontmatter の追加・変更は `src/content/config.ts` の zod スキーマも更新する (両方更新しないと `astro check` で落ちる)
- 新規ページは `BaseLayout` でラップし `current` propsを正しく渡す (Navのアクティブ表示に使う)
- React コンポーネントを islands として置く場合は `client:*` ディレクティブ必須 (付け忘れると静的HTML化してイベントが死ぬ)

## スタイリング
- **Tailwindは使わない**。`src/styles/theme.css` のCSS変数 + 各 `.astro` の scoped `<style>` のみ
- ダークモードは `<html class="dark">` トグル + `localStorage.theme` (`ThemeToggle.tsx` が正本)
- デザイン正本は `テックブログ作成/Mt Stupid *.html` (untracked / lint・型対象外 / 編集禁止)

## Pre-commit
Lefthookで `pnpm lint`（Oxlint）と `pnpm format:check`（Oxfmt）と `pnpm astro check` が走る。`--no-verify` でスキップしないでください。
