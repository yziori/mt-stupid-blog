# Mt. Stupid ブログ Astro 移行 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 15 + microCMS で動いている `mt-stupid-blog` を、Astro 5 + リポジトリ内 Markdown + Cloudflare Workers Static Assets 配信へ作り直し、デザインも `テックブログ作成/Mt Stupid *.html` の世界観に刷新した MVP を立ち上げる。

**Architecture:** `output: 'static'` の純 SSG。`src/content/blog/*.md` を Content Collections で型付き読み込み、Astro コンポーネントで描画、UI 用 React island は `ThemeToggle` 1 個のみ。CSS は Tailwind を捨て、デザイン HTML から抽出した vanilla CSS(arsenal palette 固定 + light/dark)。Worker 側は静的アセット配信のみで、adapter は使わない。

**Tech Stack:** Astro 5.x / TypeScript / pnpm / Vitest / Biome / Lefthook / `@astrojs/react` / `@astrojs/sitemap` / `@astrojs/rss` / `rehype-slug` / `rehype-autolink-headings` / Shiki(`vitesse-dark`) / Wrangler v3。

**Spec:** `docs/superpowers/specs/2026-04-25-astro-migration-design.md`(commit `85220d7`)。

**作業ブランチ:** `feature/astro-migration`(`develop` から派生)。すべての作業はこのブランチ上で行う。MVP 完成後にレビューを経て `develop` にマージする想定。

**全体の流れ:**
- Task 1 〜 2: ブランチ作成 + 既存ソース一掃 + Astro 雛形セットアップ
- Task 3 〜 6: グローバル CSS / コンテンツモデル / ポートフォリオデータ / 純関数
- Task 7 〜 9: 共通レイアウト(Nav, Footer, ThemeToggle, BaseLayout)
- Task 10 〜 11: 共通コンポーネント(TagPill, SectionHead, Pagination, BlogCard\*)
- Task 12 〜 19: ページ実装(Top, Blog 一覧, Tag, Article, About, Work, 404)
- Task 20 〜 22: RSS/sitemap、Wrangler 設定、ツール仕上げ

---

## Task 1: 作業ブランチを切って既存ソースを一掃する

**Files:**
- Modify: ワークツリー全体(後述)

新しい `feature/astro-migration` ブランチを作り、Next.js のソース・Tailwind 設定・Storybook 設定・microCMS クライアントなど **これから捨てるもの** を削除する。デザインモック (`テックブログ作成/`)、`docs/`、`README.md`、`LICENSE`、`.git`、`.vscode` は残す。

- [ ] **Step 1: 現在のブランチが develop でクリーンであることを確認**

```bash
git status
git branch --show-current
```

期待: `develop` ブランチで `nothing to commit, working tree clean`。

- [ ] **Step 2: 作業ブランチを作成**

```bash
git checkout -b feature/astro-migration
```

期待: `Switched to a new branch 'feature/astro-migration'`。

- [ ] **Step 3: 削除対象を確認(ドライラン)**

```bash
ls -la
ls src/
```

確認: `src/`, `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `components.json`, `.markuplintrc`, `.storybook/`, `vitest.config.ts`, `biome.json` が見える。

- [ ] **Step 4: 削除する**

```bash
rm -rf src/ public/fonts/
rm -f next.config.ts tailwind.config.ts postcss.config.mjs components.json .markuplintrc
rm -rf .storybook/
rm -f package.json pnpm-lock.yaml vitest.config.ts
rm -f biome.json
```

メモ:
- `public/images/mt-stupid.png` は残したいので `public/` 自体は削除しない(`public/fonts/` だけ削除)
- `biome.json` は Astro 用に書き直すので一旦削除
- `.kiro/`, `テックブログ作成/`, `docs/`, `README.md`, `LICENSE`, `.git`, `.gitignore`, `.npmrc`, `.biomeignore`, `lefthook.yml`, `tsconfig.json` は残す

- [ ] **Step 5: 残骸を確認**

```bash
ls -la
ls public/
```

期待: `public/` には `images/` のみ残っている。`src/` は無い。

- [ ] **Step 6: コミット**

```bash
git add -A
git commit -m "🔥 chore: 旧 Next.js + microCMS 実装を一掃"
```

---

## Task 2: Astro プロジェクトをスクラッチで構築する

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`(上書き)
- Create: `biome.json`
- Create: `.gitignore`(追記)
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro`(暫定の hello)

公式ドキュメント: <https://docs.astro.build/en/install-and-setup/>。手動でセットアップする(`create astro` のテンプレートは不要なファイルが多いので)。

- [ ] **Step 1: package.json を作成**

```bash
cat > package.json <<'EOF'
{
  "name": "mt-stupid-blog",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest",
    "biome:check": "biome check src",
    "biome:format": "biome format src --write",
    "deploy": "pnpm build && wrangler deploy"
  },
  "dependencies": {
    "@astrojs/react": "^4.2.0",
    "@astrojs/rss": "^4.0.10",
    "@astrojs/sitemap": "^3.2.1",
    "astro": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-slug": "^6.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "1.9.4",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "lefthook": "^1.11.3",
    "typescript": "^5.6.0",
    "vitest": "^3.0.8",
    "wrangler": "^3.90.0"
  }
}
EOF
```

- [ ] **Step 2: tsconfig.json を Astro 用に書き直す**

```bash
cat > tsconfig.json <<'EOF'
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules", "テックブログ作成"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
EOF
```

- [ ] **Step 3: astro.config.mjs を作成**

```bash
cat > astro.config.mjs <<'EOF'
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://mt-stupid.example.com', // TODO: 独自ドメイン設定時に差し替え
  output: 'static',
  trailingSlash: 'always',
  integrations: [react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark',
      wrap: false,
    },
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
});
EOF
```

- [ ] **Step 4: biome.json を Astro 用に作成**

`.astro` は Biome で完全には扱えないが、`src/**/*.{ts,tsx,js,jsx}` を対象に絞る。

```bash
cat > biome.json <<'EOF'
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "double", "semicolons": "always" }
  },
  "files": {
    "ignore": ["dist", ".astro", "node_modules", "テックブログ作成"]
  }
}
EOF
```

- [ ] **Step 5: .gitignore に Astro 用の項目を追記**

既存の `.gitignore` を確認し、下記が無ければ末尾に追記。

```bash
cat >> .gitignore <<'EOF'

# Astro
dist/
.astro/

# Wrangler
.wrangler/
.dev.vars
EOF
```

- [ ] **Step 6: src の最小構造と hello page を作成**

```bash
mkdir -p src/pages src/layouts src/components src/content src/styles src/scripts src/lib
cat > src/env.d.ts <<'EOF'
/// <reference path="../.astro/types.d.ts" />
EOF
cat > src/pages/index.astro <<'EOF'
---
---
<!doctype html>
<html lang="ja">
<head><meta charset="utf-8" /><title>Mt. Stupid</title></head>
<body><h1>Mt. Stupid (placeholder)</h1></body>
</html>
EOF
```

- [ ] **Step 7: 依存をインストール**

```bash
pnpm install
```

期待: warnings はあっても fatal error なし。`node_modules/.pnpm/astro@5.*` が存在する。

- [ ] **Step 8: dev server で動作確認**

```bash
pnpm dev
```

期待: `http://localhost:4321/` で "Mt. Stupid (placeholder)" が表示される。確認したら `Ctrl+C` で停止。

- [ ] **Step 9: ビルドが通ることを確認**

```bash
pnpm build
```

期待: `dist/index.html` が生成される、エラーなし。

- [ ] **Step 10: コミット**

```bash
git add -A
git commit -m "✨ chore: Astro 5 プロジェクトの雛形を構築"
```

---

## Task 3: グローバル CSS(arsenal palette 固定)を design HTML から移植

**Files:**
- Create: `src/styles/theme.css`
- Create: `src/styles/article.css`
- Reference: `テックブログ作成/Mt Stupid Top Hi-Fi.html`(arsenal palette 部分)、`テックブログ作成/Mt Stupid Article.html`(article 用 css)

design HTML 内で multiple palette が定義されているが、MVP は arsenal 固定。`:root` に arsenal の light、`:root.dark` に arsenal の dark を採用し、他パレット定義(`pal-blueprint`, `pal-terminal`, `pal-rice`, `pal-moleskine`, `pal-sunset`)と密度切替(`compact`, `cozy`)は **削除** する。

- [ ] **Step 1: src/styles/theme.css を作成(arsenal light を root、arsenal dark を root.dark に)**

`テックブログ作成/Mt Stupid Top Hi-Fi.html` の `:root.pal-arsenal` ブロック(line 145〜157)を `:root` 直下に置き換え、`:root.pal-arsenal.dark`(line 158〜170)を `:root.dark` に置き換える。

```bash
cat > src/styles/theme.css <<'EOF'
/* Mt. Stupid theme — arsenal palette only */
:root {
  --paper: #f5ecd4;
  --paper-2: #ebdfbd;
  --ink: #0a1a2f;
  --ink-soft: #2d4161;
  --ink-faint: #7a8599;
  --line: #d4c288;
  --red: #ef0107;
  --red-deep: #b3000a;
  --blue: #9c824a;
  --wash: #ecdfba;
  --stage: #d8c78e;
  --base-size: 16px;
  --pad-x: 44px;
  --gap-section: 40px;
}

:root.dark {
  --paper: #0c1524;
  --paper-2: #07101d;
  --ink: #f5ecd4;
  --ink-soft: #b8a97b;
  --ink-faint: #6a6148;
  --line: #1f2d4a;
  --red: #ef0107;
  --red-deep: #b3000a;
  --blue: #c9a961;
  --wash: #10192c;
  --stage: #050912;
}

* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: var(--stage);
  color: var(--ink);
  font-family: "Inter", -apple-system, sans-serif;
  font-size: var(--base-size);
  transition: background .3s, color .3s;
}
.mono { font-family: "JetBrains Mono", monospace; }
.hand { font-family: "Caveat", cursive; }
.serif { font-family: "Fraunces", serif; }

/* paper frame: the whole site on a big sheet of paper */
.paper {
  max-width: 1120px;
  margin: 40px auto;
  background: var(--paper);
  background-image:
    radial-gradient(ellipse at top left, rgba(180,150,90,0.08), transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(120,90,50,0.06), transparent 50%),
    repeating-linear-gradient(0deg, transparent 0 28px, rgba(90,123,153,0.05) 28px 29px);
  transition: background .3s;
  box-shadow:
    0 2px 4px rgba(30,20,10,0.08),
    0 20px 60px rgba(30,20,10,0.15),
    inset 0 0 60px rgba(180,150,100,0.08);
  border: 1px solid rgba(30,20,10,0.08);
  position: relative;
  overflow: hidden;
}
.paper::before {
  content: "";
  position: absolute; left: 0; right: 0; top: -3px; height: 6px;
  background-image:
    linear-gradient(45deg, transparent 33%, var(--paper) 33%),
    linear-gradient(-45deg, transparent 33%, var(--paper) 33%);
  background-size: 8px 8px;
  background-position: 0 0;
  transform: rotate(180deg);
}

/* common pill */
.pill {
  font-family: "JetBrains Mono", monospace;
  font-size: 10px; letter-spacing: 0.3px;
  padding: 3px 9px; border-radius: 20px;
  border: 1px solid var(--ink);
  color: var(--ink); background: transparent;
  text-decoration: none;
  transition: background .15s, color .15s;
}
.pill:hover { background: var(--ink); color: var(--paper); }
.pill.red { border-color: var(--red); color: var(--red); }
.pill.red:hover { background: var(--red); color: var(--paper); }

/* common section head */
.section-head {
  display: flex; align-items: center; gap: 14px;
  padding: 0 var(--pad-x);
  margin: var(--gap-section) 0 20px;
}
.section-kicker {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px; letter-spacing: 2px;
  color: var(--ink-soft);
  text-transform: uppercase;
  display: flex; align-items: center; gap: 8px;
}
.section-kicker .bar { display: inline-block; width: 24px; height: 1.5px; background: var(--red); }
.section-head .rule { flex: 1; height: 1px; background: var(--line); }
.section-head .meta { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--ink-faint); }
EOF
```

- [ ] **Step 2: src/styles/article.css を作成**

`テックブログ作成/Mt Stupid Article.html` の `<style>` 内 article 関連(line 12〜309)から、article-body / code-block / pullquote / figure 周りを抽出して移植する。

```bash
cat > src/styles/article.css <<'EOF'
/* article body styles */
.article-body {
  max-width: 680px;
  font-family: "Fraunces", serif;
  font-size: 18px;
  line-height: 1.72;
  color: var(--ink);
}
.article-body h2 {
  font-family: "Fraunces", serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 1.15;
  letter-spacing: -0.6px;
  margin: 48px 0 16px;
  position: relative;
  scroll-margin-top: 24px;
}
.article-body h2:first-child { margin-top: 8px; }
.article-body h3 { font-family: "Fraunces", serif; font-weight: 600; font-size: 24px; margin: 32px 0 12px; }
.article-body p { margin: 0 0 16px; }
.article-body p.lead::first-letter {
  font-family: "Fraunces", serif; font-weight: 700;
  font-size: 62px; line-height: 0.9;
  float: left; padding: 4px 10px 0 0;
  color: var(--red);
}
.article-body ul, .article-body ol { margin: 0 0 18px; padding-left: 24px; }
.article-body li { margin-bottom: 6px; }
.article-body a { color: var(--red); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.article-body strong { font-weight: 700; color: var(--ink); }
.article-body em { font-style: italic; }
.article-body code {
  font-family: "JetBrains Mono", monospace; font-size: 0.85em;
  background: var(--wash); padding: 1px 6px;
  border: 1px solid var(--line); border-radius: 3px;
  color: var(--red-deep);
}

/* code block (Shiki output) */
.article-body pre {
  font-family: "JetBrains Mono", monospace; font-size: 13px;
  background: var(--paper-2) !important;
  border: 1.5px solid var(--ink);
  padding: 16px 20px;
  margin: 20px 0 24px;
  border-left: 4px solid var(--red);
  line-height: 1.6;
  overflow-x: auto;
}
.article-body pre code { background: transparent; border: none; padding: 0; color: inherit; }

/* pull quote */
.article-body blockquote {
  margin: 32px 0;
  padding: 20px 0 20px 28px;
  border-left: 3px solid var(--red);
  font-family: "Caveat", cursive;
  font-size: 26px;
  line-height: 1.3;
  color: var(--ink);
}

/* image */
.article-body img { max-width: 100%; height: auto; border: 1.5px solid var(--ink); margin: 18px 0; }

/* horizontal rule */
.article-body hr { border: 0; border-top: 1px dashed var(--line); margin: 36px 0; }

/* table */
.article-body table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 15px; }
.article-body th, .article-body td { border: 1px solid var(--line); padding: 8px 12px; text-align: left; }
.article-body th { background: var(--wash); font-family: "Fraunces", serif; font-weight: 600; }
EOF
```

- [ ] **Step 3: コミット**

```bash
git add src/styles/
git commit -m "🎨 style: arsenal palette のグローバル CSS と article CSS を追加"
```

---

## Task 4: Content Collections のスキーマ定義 + ダミー記事 5 件

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/2026-04-20-rewrite-again.md`
- Create: `src/content/blog/2026-04-17-typescript-puzzle.md`
- Create: `src/content/blog/2026-04-14-go-cli.md`
- Create: `src/content/blog/2026-04-10-rust-ownership.md`
- Create: `src/content/blog/2026-04-06-sql-window.md`

公式: <https://docs.astro.build/en/guides/content-collections/>

- [ ] **Step 1: src/content/config.ts を作成**

```ts
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      thumbnail: image().optional(),
      featured: z.boolean().default(false),
      pickupBadge: z.enum(["top", "editor"]).optional(),
      coverTitle: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
```

- [ ] **Step 2: ダミー記事 1 — 2026-04-20-rewrite-again.md(featured: true / pickupBadge: top)**

`src/content/blog/2026-04-20-rewrite-again.md`:

```markdown
---
title: "Why I rewrote my site (again)"
description: "三度目の書き直し。Astro + RSC で、今度こそ続く、はず。"
publishedAt: 2026-04-20
tags: ["react", "typescript", "meta"]
featured: true
pickupBadge: top
coverTitle: "the third rewrite"
---

## なぜまた書き直すのか

前のサイトは Next.js 12 だった。触るたびに気が重かった。`next.config.js` を開くと、なぜここに書いたのか思い出せない設定が並んでいて、「週末にちょっと直すか」と言ったその週末は、結局何もせずに終わった。

半年。それが、自分が続けられなかった長さだ。記事を書きたくなくなったわけじゃない。**書き始めるまでの摩擦** が、書く気力より大きかっただけ。

> 重要なのは書くこと。道具が邪魔するなら、まず道具を直す。

## 新しいスタック

今回選んだのは **Astro + React (島々) + Cloudflare Workers**。理由はシンプルで、次の3つを満たしていたから。

- **Markdown が一等市民** — 記事はただの `.md` ファイル
- **デフォルトで JS ゼロ** — インタラクションが要る所だけ `client:load`
- **ビルドが速い** — 数十記事でも 8秒未満

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://mt-stupid.dev',
  integrations: [react()],
});
```

## デプロイ

Cloudflare Workers Static Assets。リポジトリを繋いで `pnpm build && wrangler deploy` を指定するだけ。
```

- [ ] **Step 3: ダミー記事 2〜5 — 各記事 100〜200 文字程度の本文 + frontmatter**

それぞれ下記を作成:

`src/content/blog/2026-04-17-typescript-puzzle.md`:

```markdown
---
title: "TypeScript の型パズルで溶けた週末"
description: "週末が消えた。でも面白かった、たぶん。conditional type で引数の型を引き剥がす小ネタ。"
publishedAt: 2026-04-17
tags: ["typescript"]
featured: true
pickupBadge: editor
---

## 問題

関数の引数の型を引き剥がしたい。`Parameters<T>` で取れるのは知っている。でも、第一引数だけ取りたい。

## 解

```ts
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
```

これで終わりだった。週末が、消えた。
```

`src/content/blog/2026-04-14-go-cli.md`:

```markdown
---
title: "Go で書いた小さな CLI"
description: "500 LOC で日報生成。cobra + goldmark。十分に小さく、自分で読める。"
publishedAt: 2026-04-14
tags: ["go"]
---

## 動機

毎日書く日報のテンプレを生成したかった。シェルスクリプトで書こうとしたが、すぐ Go に逃げた。

## 構成

`cobra` でコマンド、`goldmark` で Markdown レンダリング。CLI のスケルトンは 30 分で動いた。
```

`src/content/blog/2026-04-10-rust-ownership.md`:

```markdown
---
title: "Rust の所有権、まだ分かってない"
description: "借用チェッカーにまた叱られた。clone() で逃げるのをやめたい、けど今日はやめない。"
publishedAt: 2026-04-10
tags: ["rust"]
featured: true
pickupBadge: editor
---

## 借用チェッカー

何度も読んだのに、何度も叱られる。借用と所有の違いは分かる。lifetime も、まあ分かる。でもいざ書くと、コンパイラが正しい。

## 今日の妥協

`clone()` で逃げた。明日もたぶん逃げる。
```

`src/content/blog/2026-04-06-sql-window.md`:

```markdown
---
title: "SQL 窓関数を勘違いしていた"
description: "PARTITION BY は GROUP BY の親戚じゃなかった。ROW_NUMBER() で救われた日の記録。"
publishedAt: 2026-04-06
tags: ["db", "sql"]
featured: true
pickupBadge: top
---

## 勘違い

`PARTITION BY` は、行を集約せずに、グループ内の順位や累計を取るためのもの。集約じゃない。`GROUP BY` とは別物。

## 救われた瞬間

```sql
SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM events;
```

これで、ユーザーごとに最新N件、が一発で取れる。
```

- [ ] **Step 4: ビルドで型エラーがないことを確認**

```bash
pnpm astro check
```

期待: エラー 0 件。`src/content/blog/*.md` の frontmatter が schema を満たしている。

- [ ] **Step 5: コミット**

```bash
git add src/content/
git commit -m "✨ feat: Content Collections スキーマと初期ダミー記事 5 件を追加"
```

---

## Task 5: ポートフォリオの静的データを移植する

**Files:**
- Create: `src/content/portfolio/types.ts`
- Create: `src/content/portfolio/projects.ts`
- Create: `src/content/portfolio/skills.ts`
- Create: `src/content/portfolio/experience.ts`
- Create: `src/content/portfolio/contact.ts`
- Create: `src/content/portfolio/index.ts`

旧 `src/app/_data/*.ts` の内容を新パスへ移植する。`relatedArticleIds` は microCMS の id を参照していたので、新 slug 体系に合わせて空配列で初期化する(Work ページでは表示しない)。

- [ ] **Step 1: 旧ブランチから _data の中身を取り出して内容を確認**

```bash
git show develop:src/app/_data/types.ts
git show develop:src/app/_data/projects.ts
git show develop:src/app/_data/skills.ts
git show develop:src/app/_data/experience.ts
git show develop:src/app/_data/contact.ts
git show develop:src/app/_data/index.ts
```

- [ ] **Step 2: types.ts を移植(`relatedProjectIds`, `relatedArticleIds` の意味は維持、ただし MVP では空でよい)**

`src/content/portfolio/types.ts` の内容は旧 `_data/types.ts` のままコピー。

- [ ] **Step 3: projects.ts / skills.ts / experience.ts / contact.ts を内容そのままコピー**

`relatedArticleIds: ["microcms-id-xxx"]` のような microCMS id を参照している箇所があれば、すべて `[]` に置換する。

```bash
# projects.ts に対して、確認
grep -n "relatedArticleIds" src/content/portfolio/projects.ts
```

期待: すべて `[]` または存在しない。

- [ ] **Step 4: index.ts で集約 export**

`src/content/portfolio/index.ts`:

```ts
export * from "./types";
export { projects } from "./projects";
export { skills } from "./skills";
export { experience } from "./experience";
export { contact } from "./contact";
```

- [ ] **Step 5: 型チェック**

```bash
pnpm astro check
```

期待: エラー 0 件。

- [ ] **Step 6: コミット**

```bash
git add src/content/portfolio/
git commit -m "✨ feat: ポートフォリオの静的データを src/content/portfolio へ移植"
```

---

## Task 6: 純関数(タグ集計 / Pickup 選定 / Related 選定 / 日付フォーマット)を TDD で実装

**Files:**
- Create: `src/lib/posts.ts`
- Create: `src/lib/posts.test.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/format.test.ts`
- Create: `vitest.config.ts`

これらは Astro に依存しない純粋な型と関数。`CollectionEntry<'blog'>['data']` の最小サブセットを `BlogFrontmatter` 型として再定義し、テスタブルに保つ。

- [ ] **Step 1: vitest.config.ts を作成**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: src/lib/format.test.ts を書く(失敗するテスト)**

```ts
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
```

- [ ] **Step 3: テストを走らせて落ちることを確認**

```bash
pnpm test
```

期待: FAIL "Cannot find module './format'"。

- [ ] **Step 4: src/lib/format.ts を実装**

```ts
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
```

- [ ] **Step 5: テストが通ることを確認**

```bash
pnpm test
```

期待: 2 passed。

- [ ] **Step 6: src/lib/posts.test.ts を書く(失敗するテスト)**

```ts
import { describe, expect, it } from "vitest";
import { aggregateTags, pickupPosts, relatedPosts } from "./posts";

type P = {
  slug: string;
  data: {
    title: string;
    tags: string[];
    publishedAt: Date;
    featured?: boolean;
    pickupBadge?: "top" | "editor";
    draft?: boolean;
  };
};

const mk = (
  slug: string,
  publishedAt: string,
  tags: string[],
  extra: Partial<P["data"]> = {},
): P => ({
  slug,
  data: { title: slug, tags, publishedAt: new Date(publishedAt), ...extra },
});

describe("aggregateTags", () => {
  it("counts tag occurrences and sorts by count desc", () => {
    const posts = [
      mk("a", "2026-01-01", ["ts", "react"]),
      mk("b", "2026-01-02", ["ts"]),
      mk("c", "2026-01-03", ["go"]),
    ];
    expect(aggregateTags(posts)).toEqual([
      { tag: "ts", count: 2 },
      { tag: "react", count: 1 },
      { tag: "go", count: 1 },
    ]);
  });

  it("ignores draft posts", () => {
    const posts = [
      mk("a", "2026-01-01", ["ts"]),
      mk("b", "2026-01-02", ["ts"], { draft: true }),
    ];
    expect(aggregateTags(posts)).toEqual([{ tag: "ts", count: 1 }]);
  });
});

describe("pickupPosts", () => {
  it("returns featured first (newest first), filling with newest non-featured up to limit", () => {
    const posts = [
      mk("old-feat", "2026-01-01", [], { featured: true }),
      mk("new-feat", "2026-04-01", [], { featured: true }),
      mk("newest", "2026-05-01", []),
      mk("mid", "2026-03-01", []),
    ];
    const r = pickupPosts(posts, 3).map((p) => p.slug);
    expect(r).toEqual(["new-feat", "old-feat", "newest"]);
  });
});

describe("relatedPosts", () => {
  it("ranks by shared tag count then by publishedAt desc, excludes self", () => {
    const target = mk("self", "2026-04-20", ["a", "b"]);
    const candidates = [
      mk("self", "2026-04-20", ["a", "b"]),
      mk("two", "2026-04-10", ["a", "b"]),
      mk("one-new", "2026-04-19", ["a"]),
      mk("one-old", "2026-01-19", ["a"]),
      mk("none", "2026-05-01", ["x"]),
    ];
    const r = relatedPosts(target, candidates, 3).map((p) => p.slug);
    expect(r).toEqual(["two", "one-new", "one-old"]);
  });
});
```

- [ ] **Step 7: テストを走らせて落ちることを確認**

```bash
pnpm test
```

期待: FAIL "Cannot find module './posts'"。

- [ ] **Step 8: src/lib/posts.ts を実装**

```ts
type Frontmatter = {
  title: string;
  tags: string[];
  publishedAt: Date;
  featured?: boolean;
  pickupBadge?: "top" | "editor";
  draft?: boolean;
};

type Post = { slug: string; data: Frontmatter };

export function visiblePosts<P extends Post>(posts: P[]): P[] {
  return posts.filter((p) => !p.data.draft);
}

export function sortedByPublished<P extends Post>(posts: P[]): P[] {
  return [...posts].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function aggregateTags<P extends Post>(
  posts: P[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of visiblePosts(posts)) {
    for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function pickupPosts<P extends Post>(posts: P[], limit = 4): P[] {
  const visible = sortedByPublished(visiblePosts(posts));
  const featured = visible.filter((p) => p.data.featured);
  const filler = visible.filter((p) => !p.data.featured);
  return [...featured, ...filler].slice(0, limit);
}

export function relatedPosts<P extends Post>(
  target: P,
  all: P[],
  limit = 3,
): P[] {
  const tagSet = new Set(target.data.tags);
  return visiblePosts(all)
    .filter((p) => p.slug !== target.slug)
    .map((p) => ({
      post: p,
      shared: p.data.tags.filter((t) => tagSet.has(t)).length,
    }))
    .filter((x) => x.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.post.data.publishedAt.getTime() - a.post.data.publishedAt.getTime(),
    )
    .slice(0, limit)
    .map((x) => x.post);
}
```

- [ ] **Step 9: テストが通ることを確認**

```bash
pnpm test
```

期待: 6 passed。

- [ ] **Step 10: コミット**

```bash
git add src/lib/ vitest.config.ts
git commit -m "✨ feat: posts/format ユーティリティを TDD で実装"
```

---

## Task 7: BrandMark / Nav / Footer コンポーネント

**Files:**
- Create: `src/components/BrandMark.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`

design HTML(`Mt Stupid Top Hi-Fi.html` line 567〜594, 776〜790)からマークアップとスタイルを抽出。

- [ ] **Step 1: BrandMark.astro を作成**

`src/components/BrandMark.astro`:

```astro
---
---
<div class="brand-mark">
  <svg width="54" height="44" viewBox="0 0 54 44" aria-hidden="true">
    <path d="M3 40 L18 10 L28 24 L35 14 L51 40 Z" stroke="var(--ink)" stroke-width="1.8" fill="var(--paper)" stroke-linejoin="round" />
    <path d="M3 40 L18 10 L28 24" stroke="var(--ink)" stroke-width="1.8" fill="none" stroke-linejoin="round" />
    <circle cx="18" cy="10" r="2.8" fill="var(--red)" stroke="var(--ink)" stroke-width="1.3" />
    <path d="M8 34 Q16 32 22 33" stroke="var(--blue)" stroke-width="0.8" fill="none" stroke-dasharray="2 2" />
  </svg>
</div>

<style>
  .brand-mark {
    width: 54px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
</style>
```

- [ ] **Step 2: Nav.astro を作成**

```astro
---
import BrandMark from "./BrandMark.astro";
import { getCollection } from "astro:content";
import { visiblePosts } from "@/lib/posts";

type Props = { current: "home" | "about" | "work" | "tags" };
const { current } = Astro.props;
const allPosts = await getCollection("blog");
const totalPosts = visiblePosts(allPosts).length;
---

<nav class="top">
  <a href="/" class="brand">
    <BrandMark />
    <div>
      <div class="brand-name">Mt<span class="dot">.</span> Stupid</div>
      <div class="brand-sub">— notes from the peak of my own confidence</div>
    </div>
  </a>

  <div class="nav-links">
    <a href="/" class={current === "home" ? "current" : ""}>home</a>
    <a href="/about/" class={current === "about" ? "current" : ""}>about</a>
    <a href="/work/" class={current === "work" ? "current" : ""}>work</a>
    <a href="/tags/" class={current === "tags" ? "current" : ""}>tags</a>
  </div>

  <div class="altitude">
    <span class="dot-live"></span>
    <span>N5 · {totalPosts} POSTS · COYG</span>
  </div>
</nav>

<style>
  nav.top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px var(--pad-x) 24px;
    border-bottom: 1.5px solid var(--ink);
    position: relative;
  }
  :global(:root.dark) nav.top { border-bottom-color: #1f2d4a; }
  .brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; }
  .brand-name {
    font-family: "Fraunces", serif;
    font-weight: 700; font-size: 32px; line-height: 1;
    letter-spacing: -0.8px;
  }
  .brand-name .dot { color: var(--red); }
  .brand-sub {
    font-family: "Caveat", cursive;
    font-size: 17px; line-height: 1;
    color: var(--ink-soft);
    margin-top: 4px;
    font-weight: 500;
  }
  .nav-links { display: flex; gap: 26px; font-family: "JetBrains Mono", monospace; font-size: 12px; }
  .nav-links a {
    color: var(--ink-soft);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-bottom: 2px;
    position: relative;
    transition: color .2s;
  }
  .nav-links a:hover { color: var(--ink); }
  .nav-links a.current { color: var(--red); font-weight: 600; }
  .nav-links a.current::after {
    content: ""; position: absolute; left: 0; right: 0; bottom: -4px;
    height: 2px; background: var(--red);
  }
  .altitude {
    position: absolute;
    top: 28px; right: var(--pad-x);
    transform: translateY(46px);
    font-family: "JetBrains Mono", monospace;
    font-size: 10px; color: var(--ink-faint);
    letter-spacing: 0.6px;
    display: flex; gap: 8px; align-items: center;
  }
  .dot-live {
    width: 6px; height: 6px; border-radius: 3px;
    background: var(--red);
    box-shadow: 0 0 8px rgba(239,1,7,.6);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 50% { opacity: .4; } }
</style>
```

- [ ] **Step 3: Footer.astro を作成**

```astro
---
---
<footer class="site">
  <div>
    <div>IORI · 2026</div>
    <div class="built">built on Mt. Stupid · Astro · Cloudflare Workers</div>
  </div>
  <div class="quote">"Victory through harmony" — but mostly I just post about code.</div>
  <div class="links">
    <a href="https://github.com/yziori" target="_blank" rel="noreferrer">github</a>
    <a href="/rss.xml">rss</a>
    <a href="https://www.arsenal.com/" target="_blank" rel="noreferrer" class="coyg" title="Come On You Gunners">COYG</a>
  </div>
</footer>

<style>
  footer.site {
    padding: 32px var(--pad-x);
    border-top: 1.5px solid var(--ink);
    background: var(--paper-2);
    display: flex; justify-content: space-between; align-items: baseline;
    font-family: "JetBrains Mono", monospace; font-size: 11px;
    color: var(--ink-soft);
  }
  :global(:root.dark) footer.site { border-top-color: #1f2d4a; }
  .built { margin-top: 4px; color: var(--ink-faint); }
  .quote { font-family: "Caveat", cursive; font-size: 18px; color: var(--ink); max-width: 40%; }
  .links { display: flex; gap: 16px; }
  .links a { color: var(--ink-soft); text-decoration: none; }
  .links a:hover { color: var(--red); }
  .links a.coyg { color: var(--red); font-weight: 600; }
</style>
```

- [ ] **Step 4: 動作確認は次タスク(BaseLayout)後にまとめて**

- [ ] **Step 5: コミット**

```bash
git add src/components/BrandMark.astro src/components/Nav.astro src/components/Footer.astro
git commit -m "✨ feat: BrandMark / Nav / Footer コンポーネントを実装"
```

---

## Task 8: ThemeToggle(React island)+ FOUC 防止 inline スクリプト

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/components/ThemeInit.astro`(`<head>` に挿入する inline スクリプト用)

`<html>` に paint 前に `dark` クラスを付けることで初期表示のちらつきを防ぐ。React island はクリック時の切替と localStorage 永続化のみ担当。

- [ ] **Step 1: src/components/ThemeInit.astro を作成**

```astro
---
---
<script is:inline>
  (function () {
    const stored = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefers;
    if (dark) document.documentElement.classList.add("dark");
  })();
</script>
```

- [ ] **Step 2: src/components/ThemeToggle.tsx を作成**

```tsx
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="theme-toggle"
    >
      {dark ? "☾ dark" : "☀ light"}
      <style>{`
        .theme-toggle {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px; letter-spacing: 0.6px;
          padding: 4px 10px;
          border: 1px solid var(--ink-soft);
          background: transparent; color: var(--ink-soft);
          cursor: pointer;
          text-transform: lowercase;
          transition: color .15s, border-color .15s;
        }
        .theme-toggle:hover { color: var(--ink); border-color: var(--ink); }
      `}</style>
    </button>
  );
}
```

- [ ] **Step 3: コミット**

```bash
git add src/components/ThemeToggle.tsx src/components/ThemeInit.astro
git commit -m "✨ feat: ThemeToggle (React island) と FOUC 防止スクリプトを追加"
```

---

## Task 9: BaseLayout を作成、index.astro を仮実装で動作確認

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

OGP / sitemap 用メタも `BaseLayout` に集約。`<html class="pal-arsenal">` を常時付与(将来パレット切替を入れる際の余地を残す)。

- [ ] **Step 1: src/layouts/BaseLayout.astro を作成**

```astro
---
import "@/styles/theme.css";
import Nav from "@/components/Nav.astro";
import Footer from "@/components/Footer.astro";
import ThemeInit from "@/components/ThemeInit.astro";
import ThemeToggle from "@/components/ThemeToggle.tsx";

type Props = {
  title: string;
  description: string;
  current: "home" | "about" | "work" | "tags";
  ogImage?: string;
};
const { title, description, current, ogImage = "/images/mt-stupid.png" } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---

<!doctype html>
<html lang="ja" class="pal-arsenal">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="alternate" type="application/rss+xml" title="Mt. Stupid" href="/rss.xml" />
    <link rel="sitemap" href="/sitemap-index.xml" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />

    <ThemeInit />
  </head>
  <body>
    <div class="paper">
      <Nav current={current} />
      <slot />
      <Footer />
    </div>
    <div class="theme-toggle-wrap">
      <ThemeToggle client:load />
    </div>

    <style>
      .theme-toggle-wrap {
        position: fixed; right: 20px; bottom: 20px;
        z-index: 9999;
      }
    </style>
  </body>
</html>
```

- [ ] **Step 2: src/pages/index.astro を仮で BaseLayout に差し替える**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---
<BaseLayout
  title="Mt. Stupid — notes from the peak of my own confidence"
  description="登りながら書く、技術と思考の手帳"
  current="home"
>
  <section style="padding: 60px var(--pad-x);">
    <h1 style="font-family: 'Fraunces', serif; font-size: 48px;">Mt. Stupid</h1>
    <p>placeholder — Top page coming next.</p>
  </section>
</BaseLayout>
```

- [ ] **Step 3: dev server で確認**

```bash
pnpm dev
```

ブラウザ `http://localhost:4321/` で確認:
- ヘッダーに `Mt. Stupid` ロゴ + nav (`home/about/work/tags`) が表示
- `home` が赤くアンダーライン
- 右に `N5 · 5 POSTS · COYG`(記事 5 件のはず)
- フッターに固定文言 + COYG リンク
- 右下に theme toggle ボタン
- toggle を押すとライト/ダーク切替、リロードしても保持

`Ctrl+C` で停止。

- [ ] **Step 4: ビルドが通ることを確認**

```bash
pnpm build
```

期待: エラーなし。

- [ ] **Step 5: コミット**

```bash
git add src/layouts/ src/pages/index.astro
git commit -m "✨ feat: BaseLayout を実装し index を BaseLayout 経由で表示"
```

---

## Task 10: TagPill / SectionHead / Pagination 共通コンポーネント

**Files:**
- Create: `src/components/TagPill.astro`
- Create: `src/components/SectionHead.astro`
- Create: `src/components/Pagination.astro`

- [ ] **Step 1: TagPill.astro**

```astro
---
type Props = { tag: string; variant?: "default" | "red"; href?: string };
const { tag, variant = "default", href = `/tags/${tag}/` } = Astro.props;
---
<a href={href} class={`pill ${variant === "red" ? "red" : ""}`}>#{tag}</a>
```

(`.pill` のスタイルは theme.css 共通)

- [ ] **Step 2: SectionHead.astro**

```astro
---
type Props = { kicker: string; meta?: string };
const { kicker, meta } = Astro.props;
---
<div class="section-head">
  <div class="section-kicker"><span class="bar"></span>{kicker}</div>
  <div class="rule"></div>
  {meta && <div class="meta">{meta}</div>}
</div>
```

(スタイルは theme.css 共通)

- [ ] **Step 3: Pagination.astro**

```astro
---
type Props = {
  currentPage: number;
  lastPage: number;
  basePath: string; // "/blog" or "/tags/typescript"
};
const { currentPage, lastPage, basePath } = Astro.props;
const prevHref =
  currentPage <= 1
    ? null
    : currentPage === 2
      ? `${basePath}/`
      : `${basePath}/page/${currentPage - 1}/`;
const nextHref =
  currentPage >= lastPage ? null : `${basePath}/page/${currentPage + 1}/`;
---

<nav class="pagination" aria-label="ページ送り">
  {prevHref ? <a href={prevHref} rel="prev">← prev</a> : <span class="disabled">← prev</span>}
  <span class="page-info">page {currentPage} / {lastPage}</span>
  {nextHref ? <a href={nextHref} rel="next">next →</a> : <span class="disabled">next →</span>}
</nav>

<style>
  .pagination {
    display: flex; justify-content: space-between; align-items: center;
    padding: 24px var(--pad-x);
    font-family: "JetBrains Mono", monospace; font-size: 12px;
    color: var(--ink-soft);
    border-top: 1px dashed var(--line);
    margin-top: 24px;
  }
  .pagination a { color: var(--ink); text-decoration: none; padding: 6px 12px; border: 1px solid var(--ink-soft); transition: all .15s; }
  .pagination a:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .pagination .disabled { color: var(--ink-faint); padding: 6px 12px; border: 1px solid var(--line); }
  .page-info { letter-spacing: 0.5px; }
</style>
```

- [ ] **Step 4: コミット**

```bash
git add src/components/TagPill.astro src/components/SectionHead.astro src/components/Pagination.astro
git commit -m "✨ feat: TagPill / SectionHead / Pagination 共通部品を実装"
```

---

## Task 11: BlogCard 一式(Hero / Pickup / Archive / Related)

**Files:**
- Create: `src/components/BlogCardHero.astro`
- Create: `src/components/BlogCardPickup.astro`
- Create: `src/components/BlogCardArchive.astro`
- Create: `src/components/BlogCardRelated.astro`

それぞれ design HTML(`Mt Stupid Top Hi-Fi.html` line 603〜636 = Hero, line 646〜712 = Pickup, line 722〜770 = Archive、`Mt Stupid Article.html` line 517〜535 = Related)に対応。

- [ ] **Step 1: BlogCardHero.astro**

```astro
---
import type { CollectionEntry } from "astro:content";
import { Image } from "astro:assets";
import TagPill from "./TagPill.astro";
import { formatLongDate } from "@/lib/format";
type Props = { post: CollectionEntry<"blog"> };
const { post } = Astro.props;
const tags = post.data.tags.slice(0, 3);
---

<section class="hero">
  <div class="hero-cover">
    {
      post.data.thumbnail ? (
        <Image src={post.data.thumbnail} alt="" class="cov-img" widths={[480, 800]} />
      ) : (
        <div class="topo-bg"></div>
      )
    }
    <svg class="lines" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="rgba(255,220,150,0.35)" stroke-width="0.8">
        <path d="M-20 260 Q 100 230, 200 180 T 420 240" />
        <path d="M-20 230 Q 100 200, 200 150 T 420 210" />
        <path d="M-20 200 Q 100 170, 200 120 T 420 180" />
        <path d="M-20 170 Q 100 140, 200 90 T 420 150" />
      </g>
    </svg>
    <div class="stamp">{formatLongDate(post.data.publishedAt)}</div>
    <div class="pin-label">
      <div class="pin-dot"></div>
      <div class="pin-txt">latest</div>
    </div>
  </div>

  <div class="hero-body">
    <div class="hero-tags">
      {tags.map((t, i) => <TagPill tag={t} variant={i === tags.length - 1 ? "red" : "default"} />)}
    </div>
    <h1 class="hero-title">{post.data.title}</h1>
    <p class="hero-dek">{post.data.description}</p>
    <div class="hero-footer">
      <span>{formatLongDate(post.data.publishedAt)}</span>
      <a href={`/blog/${post.slug}/`} class="read-link">read →</a>
    </div>
  </div>
</section>

<style>
  .hero { padding: 0 var(--pad-x); display: grid; grid-template-columns: 1.4fr 1fr; gap: 32px; align-items: stretch; }
  .hero-cover { position: relative; background: linear-gradient(135deg, #2a3848, #1a2430); border: 1.5px solid var(--ink); aspect-ratio: 4 / 3; overflow: hidden; box-shadow: 6px 6px 0 rgba(30,20,10,.1); }
  .topo-bg { position: absolute; inset: 0; background-image: radial-gradient(ellipse 60% 40% at 50% 55%, rgba(255,200,120,0.15), transparent 70%), radial-gradient(ellipse 30% 20% at 50% 40%, rgba(255,220,150,0.25), transparent 70%); }
  .cov-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .lines { position: absolute; inset: 0; width: 100%; height: 100%; }
  .stamp { position: absolute; top: 16px; right: 16px; font-family: "JetBrains Mono", monospace; font-size: 10px; letter-spacing: 1.5px; color: rgba(255,240,200,.65); border: 1px solid rgba(255,240,200,.35); padding: 4px 8px; transform: rotate(3deg); }
  .pin-label { position: absolute; left: 50%; top: 42%; transform: translate(-50%,-50%); display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .pin-dot { width: 14px; height: 14px; border-radius: 7px; background: var(--red); box-shadow: 0 0 0 3px rgba(239,1,7,.3), 0 0 0 8px rgba(239,1,7,.12); }
  .pin-txt { font-family: "Caveat", cursive; font-size: 22px; color: #f5ecd4; transform: rotate(-2deg); }

  .hero-body { display: flex; flex-direction: column; }
  .hero-tags { display: flex; gap: 6px; margin-bottom: 16px; }
  .hero-title { font-family: "Fraunces", serif; font-weight: 700; font-size: 48px; line-height: 1.02; letter-spacing: -1.5px; color: var(--ink); margin: 0 0 16px; }
  .hero-dek { font-family: "Fraunces", serif; font-size: 17px; line-height: 1.55; color: var(--ink-soft); margin: 0 0 auto; }
  .hero-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; padding-top: 16px; border-top: 1px dashed var(--line); font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--ink-soft); }
  .read-link { font-family: "Fraunces", serif; font-style: italic; font-size: 16px; color: var(--red); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: gap .2s; }
  .read-link:hover { gap: 12px; }
</style>
```

- [ ] **Step 2: BlogCardPickup.astro**

```astro
---
import type { CollectionEntry } from "astro:content";
import { Image } from "astro:assets";
import { formatYearMonth } from "@/lib/format";
type Props = { post: CollectionEntry<"blog"> };
const { post } = Astro.props;
const badgeLabel = post.data.pickupBadge === "editor" ? "editor's" : "★ top";
const badgeClass = post.data.pickupBadge === "editor" ? "editor" : "";
---

<a class="pickup" href={`/blog/${post.slug}/`}>
  <div class="pickup-img">
    <span class={`pickup-badge ${badgeClass}`}>{badgeLabel}</span>
    {post.data.thumbnail && <Image src={post.data.thumbnail} alt="" class="cov-img" />}
  </div>
  <div class="pickup-body">
    <h3 class="pickup-title">{post.data.title}</h3>
    <div class="pickup-meta">
      <span>{formatYearMonth(post.data.publishedAt)}</span>
    </div>
  </div>
</a>

<style>
  .pickup { position: relative; background: var(--paper); border: 1.5px solid var(--ink); box-shadow: 3px 3px 0 rgba(30,20,10,.1); transition: transform .2s, box-shadow .2s; cursor: pointer; display: flex; flex-direction: column; text-decoration: none; color: inherit; }
  .pickup:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 rgba(30,20,10,.12); }
  .pickup-img { aspect-ratio: 1 / 1; position: relative; border-bottom: 1.5px solid var(--ink); overflow: hidden; background: linear-gradient(135deg, #1e2b3a, #3a4a5c); }
  .cov-img { width: 100%; height: 100%; object-fit: cover; }
  .pickup-badge { position: absolute; top: 8px; left: 8px; background: var(--red); color: var(--paper); font-family: "JetBrains Mono", monospace; font-size: 9px; letter-spacing: 0.8px; padding: 3px 7px; border: 1px solid var(--ink); text-transform: uppercase; z-index: 1; }
  .pickup-badge.editor { background: var(--ink); }
  .pickup-body { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; }
  .pickup-title { font-family: "Fraunces", serif; font-weight: 600; font-size: 16px; line-height: 1.2; margin: 0 0 8px; }
  .pickup-meta { margin-top: auto; display: flex; justify-content: space-between; align-items: baseline; font-family: "JetBrains Mono", monospace; font-size: 10px; color: var(--ink-soft); }
</style>
```

- [ ] **Step 3: BlogCardArchive.astro**

```astro
---
import type { CollectionEntry } from "astro:content";
import TagPill from "./TagPill.astro";
import { formatShortDate } from "@/lib/format";
type Props = { post: CollectionEntry<"blog"> };
const { post } = Astro.props;
---

<a class="arch-row" href={`/blog/${post.slug}/`}>
  <div class="arch-date">{formatShortDate(post.data.publishedAt)}</div>
  <div class="arch-main">
    <div class="arch-title">{post.data.title}</div>
    <div class="arch-sub">{post.data.description}</div>
  </div>
  <div class="arch-tags">{post.data.tags.slice(0, 2).map((t) => <TagPill tag={t} />)}</div>
</a>

<style>
  .arch-row { display: grid; grid-template-columns: 72px 1fr auto; gap: 20px; padding: 18px 0; border-top: 1px solid var(--line); align-items: baseline; cursor: pointer; transition: padding .2s; text-decoration: none; color: inherit; }
  .arch-row:hover { padding-left: 10px; }
  .arch-row:last-of-type { border-bottom: 1px solid var(--line); }
  .arch-date { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--blue); font-weight: 500; }
  .arch-main { display: flex; flex-direction: column; gap: 4px; }
  .arch-title { font-family: "Fraunces", serif; font-size: 20px; font-weight: 600; line-height: 1.25; color: var(--ink); }
  .arch-sub { font-family: "Inter", sans-serif; font-size: 13px; color: var(--ink-soft); line-height: 1.45; }
  .arch-tags { display: flex; gap: 4px; align-items: center; }
  .arch-tags :global(.pill) { font-size: 9px; padding: 2px 7px; }
</style>
```

- [ ] **Step 4: BlogCardRelated.astro**

```astro
---
import type { CollectionEntry } from "astro:content";
import { formatLongDate } from "@/lib/format";
type Props = { post: CollectionEntry<"blog"> };
const { post } = Astro.props;
---

<a class="rel-card" href={`/blog/${post.slug}/`}>
  <div class="rel-date">{formatLongDate(post.data.publishedAt)}</div>
  <div class="rel-title">{post.data.title}</div>
  <div class="rel-sub">{post.data.description}</div>
  <div class="rel-tag">{post.data.tags.slice(0, 1).map((t) => `#${t}`).join("")}</div>
</a>

<style>
  .rel-card { border: 1.5px solid var(--ink); background: var(--paper); padding: 18px 20px; text-decoration: none; color: var(--ink); display: flex; flex-direction: column; transition: transform .2s, box-shadow .2s; }
  .rel-card:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 rgba(30,20,10,.12); }
  .rel-date { font-family: "JetBrains Mono", monospace; font-size: 10px; color: var(--blue); margin-bottom: 8px; letter-spacing: 0.5px; }
  .rel-title { font-family: "Fraunces", serif; font-weight: 600; font-size: 17px; line-height: 1.25; margin-bottom: 6px; }
  .rel-sub { font-size: 12px; color: var(--ink-soft); line-height: 1.45; flex: 1; }
  .rel-tag { font-family: "JetBrains Mono", monospace; font-size: 9px; color: var(--ink-faint); margin-top: 10px; letter-spacing: 0.5px; }
</style>
```

- [ ] **Step 5: コミット**

```bash
git add src/components/BlogCard*.astro
git commit -m "✨ feat: BlogCard 一式 (Hero/Pickup/Archive/Related) を実装"
```

---

## Task 12: Top ページ(Hero + Pickups + Archive)

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: src/pages/index.astro を本実装に差し替え**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import BlogCardHero from "@/components/BlogCardHero.astro";
import BlogCardPickup from "@/components/BlogCardPickup.astro";
import BlogCardArchive from "@/components/BlogCardArchive.astro";
import SectionHead from "@/components/SectionHead.astro";
import { getCollection } from "astro:content";
import { pickupPosts, sortedByPublished, visiblePosts } from "@/lib/posts";
import { formatLongDate } from "@/lib/format";

const all = sortedByPublished(visiblePosts(await getCollection("blog")));
const hero = all[0];
const pickups = pickupPosts(all, 4);
const archive = all.slice(0, 6);
const today = new Date();
---

<BaseLayout
  title="Mt. Stupid — notes from the peak of my own confidence"
  description="登りながら書く、技術と思考の手帳。"
  current="home"
>
  <SectionHead kicker="LATEST" meta={formatLongDate(today)} />
  {hero && <BlogCardHero post={hero} />}

  <SectionHead kicker="★ PICKUPS" meta={`hand-picked · ${pickups.length} of ${all.length}`} />
  <section class="pickups">
    {pickups.map((p) => <BlogCardPickup post={p} />)}
  </section>

  <section class="archive">
    <SectionHead kicker="ARCHIVE" meta="all posts · newest first" />
    <div class="arch-list">
      {archive.map((p) => <BlogCardArchive post={p} />)}
    </div>
    <a href="/blog/" class="more">all {all.length} posts</a>
  </section>
</BaseLayout>

<style>
  .pickups { padding: 0 var(--pad-x); display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
  .archive { padding: 0 var(--pad-x) var(--gap-section); margin-top: var(--gap-section); }
  .arch-list { display: flex; flex-direction: column; }
  .more { display: inline-flex; align-items: center; gap: 8px; margin-top: 28px; font-family: "Fraunces", serif; font-style: italic; font-size: 16px; color: var(--ink); text-decoration: none; }
  .more::after { content: ""; width: 60px; height: 1px; background: var(--ink); transition: width .25s; }
  .more:hover::after { width: 100px; }

  @media (max-width: 860px) {
    .pickups { grid-template-columns: repeat(2, 1fr); }
  }
</style>
```

- [ ] **Step 2: dev server で確認**

```bash
pnpm dev
```

ブラウザ `http://localhost:4321/`:
- Hero に最新記事 `Why I rewrote my site (again)` が表示
- Pickups に 4 件、それぞれバッジ(★ top / editor's)が出る
- Archive に最新 6 件
- `all 5 posts` リンクが `/blog/` に飛ぶ(まだ作っていないので 404 で良い)
- ライト/ダーク切替が機能

`Ctrl+C` で停止。

- [ ] **Step 3: コミット**

```bash
git add src/pages/index.astro
git commit -m "✨ feat: Top ページ (Hero + Pickups + Archive) を実装"
```

---

## Task 13: Blog 一覧 + ページネーション

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/page/[page].astro`

`paginate()` ヘルパで両方をひとつのテンプレートで生成する代わりに、シンプルさのため index と `[page]` を別ファイルにする。1 ページ 10 件。

- [ ] **Step 1: src/pages/blog/index.astro を作成(1 ページ目)**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import BlogCardArchive from "@/components/BlogCardArchive.astro";
import SectionHead from "@/components/SectionHead.astro";
import Pagination from "@/components/Pagination.astro";
import { getCollection } from "astro:content";
import { sortedByPublished, visiblePosts } from "@/lib/posts";

const PAGE_SIZE = 10;
const all = sortedByPublished(visiblePosts(await getCollection("blog")));
const lastPage = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
const posts = all.slice(0, PAGE_SIZE);
---

<BaseLayout title="Blog — Mt. Stupid" description="記事一覧" current="home">
  <SectionHead kicker="ALL POSTS" meta={`${all.length} posts`} />
  <section style="padding: 0 var(--pad-x);">
    <div class="arch-list">
      {posts.map((p) => <BlogCardArchive post={p} />)}
    </div>
  </section>
  <Pagination currentPage={1} lastPage={lastPage} basePath="/blog" />
</BaseLayout>

<style>
  .arch-list { display: flex; flex-direction: column; }
</style>
```

- [ ] **Step 2: src/pages/blog/page/[page].astro を作成**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import BlogCardArchive from "@/components/BlogCardArchive.astro";
import SectionHead from "@/components/SectionHead.astro";
import Pagination from "@/components/Pagination.astro";
import { getCollection } from "astro:content";
import { sortedByPublished, visiblePosts } from "@/lib/posts";

const PAGE_SIZE = 10;

export async function getStaticPaths() {
  const all = sortedByPublished(visiblePosts(await getCollection("blog")));
  const lastPage = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  // 1ページ目は /blog/ で出すので、2ページ目以降のみ生成
  return Array.from({ length: lastPage - 1 }, (_, i) => i + 2).map((page) => ({
    params: { page: String(page) },
    props: { page, lastPage, all },
  }));
}

const { page, lastPage, all } = Astro.props as {
  page: number;
  lastPage: number;
  all: Awaited<ReturnType<typeof getCollection<"blog">>>;
};
const posts = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
---

<BaseLayout title={`Blog · page ${page} — Mt. Stupid`} description="記事一覧" current="home">
  <SectionHead kicker="ALL POSTS" meta={`page ${page} / ${lastPage}`} />
  <section style="padding: 0 var(--pad-x);">
    <div class="arch-list">
      {posts.map((p) => <BlogCardArchive post={p} />)}
    </div>
  </section>
  <Pagination currentPage={page} lastPage={lastPage} basePath="/blog" />
</BaseLayout>

<style>
  .arch-list { display: flex; flex-direction: column; }
</style>
```

- [ ] **Step 3: 動作確認**

```bash
pnpm dev
```

`/blog/` で 5 件全部が出る、`/blog/page/2/` は 404(2 ページ目に該当する記事がないので)。Top の `all 5 posts` が `/blog/` に正しく飛ぶ。

- [ ] **Step 4: コミット**

```bash
git add src/pages/blog/
git commit -m "✨ feat: Blog 一覧とページネーションを実装"
```

---

## Task 14: Tag ページ(`/tags/`, `/tags/[tag]/`)

**Files:**
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`

design HTML(`Mt Stupid Tags.html`)を参考に。MVP では `BY GROUP` は出さず、**全タグ一覧 + Top 10** のシンプル版にする。

- [ ] **Step 1: src/pages/tags/index.astro を作成**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import SectionHead from "@/components/SectionHead.astro";
import { getCollection } from "astro:content";
import { aggregateTags } from "@/lib/posts";

const all = await getCollection("blog");
const tags = aggregateTags(all);
const total = tags.reduce((s, t) => s + t.count, 0);
const top10 = tags.slice(0, 10);
---

<BaseLayout title="Tags — Mt. Stupid" description="タグ一覧" current="tags">
  <section class="tags-hero">
    <div>
      <div class="kicker"><span class="bar"></span>TAGS</div>
      <h1>Tags, <em>grouped</em>.</h1>
      <p class="dek">記事を支える単語たち。クリックで該当記事一覧へ。</p>
    </div>
    <div class="summary">
      <div class="big">{tags.length}</div>
      <div class="row"><span>posts indexed</span><span class="v">{total}</span></div>
      <div class="row"><span>unique tags</span><span class="v">{tags.length}</span></div>
    </div>
  </section>

  <SectionHead kicker="TOP 10 OVERALL" />
  <section class="tag-list-wrap">
    <div class="tag-list">
      {top10.map(({ tag, count }, i) => (
        <a href={`/tags/${tag}/`} class={`tag-pill ${i < 3 ? "hot" : ""}`}>
          #{tag}
          <span class="tag-count">{count}</span>
        </a>
      ))}
    </div>
  </section>

  <SectionHead kicker="ALL TAGS" meta={`${tags.length} tags`} />
  <section class="tag-list-wrap">
    <div class="tag-list">
      {tags.map(({ tag, count }) => (
        <a href={`/tags/${tag}/`} class="tag-pill">
          #{tag}
          <span class="tag-count">{count}</span>
        </a>
      ))}
    </div>
  </section>
</BaseLayout>

<style>
  .tags-hero { padding: 52px var(--pad-x) 24px; display: grid; grid-template-columns: 1.3fr 1fr; gap: 40px; align-items: end; }
  .tags-hero .kicker { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--red); letter-spacing: 2px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .tags-hero .kicker .bar { width: 24px; height: 1.5px; background: var(--red); }
  .tags-hero h1 { font-family: "Fraunces", serif; font-weight: 700; font-size: 64px; line-height: 0.98; letter-spacing: -2px; margin: 0 0 14px; }
  .tags-hero h1 em { color: var(--red); font-style: italic; font-weight: 600; }
  .tags-hero .dek { font-family: "Fraunces", serif; font-size: 17px; line-height: 1.55; color: var(--ink-soft); margin: 0; max-width: 520px; }
  .summary { border: 1.5px solid var(--ink); background: var(--paper-2); padding: 18px 22px; box-shadow: 3px 3px 0 rgba(30,20,10,.1); font-family: "JetBrains Mono", monospace; font-size: 11px; }
  .summary .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--line); color: var(--ink-soft); }
  .summary .row:last-child { border-bottom: none; }
  .summary .row .v { color: var(--ink); font-weight: 500; }
  .summary .big { font-family: "Fraunces", serif; font-size: 28px; font-weight: 700; color: var(--ink); line-height: 1; margin-bottom: 12px; }

  .tag-list-wrap { padding: 0 var(--pad-x) 24px; }
  .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .tag-pill {
    display: inline-flex; align-items: baseline;
    padding: 5px 4px 5px 11px;
    border: 1px solid var(--ink);
    border-radius: 18px;
    text-decoration: none;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    color: var(--ink);
    background: var(--paper);
    transition: all .15s;
  }
  .tag-pill:hover { background: var(--ink); color: var(--paper); }
  .tag-pill.hot { border-color: var(--red); color: var(--red); }
  .tag-pill.hot:hover { background: var(--red); color: var(--paper); }
  .tag-count { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 18px; padding: 0 6px; margin-left: 8px; border-radius: 10px; background: var(--wash); font-size: 10px; font-weight: 600; color: var(--ink-soft); border: 1px solid var(--line); }
  .tag-pill:hover .tag-count { background: rgba(255,255,255,.18); color: var(--paper); border-color: transparent; }
</style>
```

- [ ] **Step 2: src/pages/tags/[tag].astro を作成**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import SectionHead from "@/components/SectionHead.astro";
import BlogCardArchive from "@/components/BlogCardArchive.astro";
import { getCollection } from "astro:content";
import { aggregateTags, sortedByPublished, visiblePosts } from "@/lib/posts";

export async function getStaticPaths() {
  const all = await getCollection("blog");
  const tags = aggregateTags(all);
  return tags.map(({ tag }) => ({ params: { tag }, props: { tag } }));
}

const { tag } = Astro.props as { tag: string };
const all = await getCollection("blog");
const posts = sortedByPublished(visiblePosts(all)).filter((p) => p.data.tags.includes(tag));
---

<BaseLayout
  title={`#${tag} — Mt. Stupid`}
  description={`${tag} に関する記事 ${posts.length} 件`}
  current="tags"
>
  <section class="tag-hero">
    <a href="/tags/" class="back">← all tags</a>
    <h1>#<em>{tag}</em></h1>
    <div class="meta">{posts.length} posts</div>
  </section>

  <SectionHead kicker="POSTS" />
  <section style="padding: 0 var(--pad-x) 40px;">
    <div class="arch-list">
      {posts.map((p) => <BlogCardArchive post={p} />)}
    </div>
  </section>
</BaseLayout>

<style>
  .tag-hero { padding: 52px var(--pad-x) 24px; }
  .back { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--ink-soft); text-decoration: none; letter-spacing: 1px; text-transform: uppercase; }
  .back:hover { color: var(--red); }
  .tag-hero h1 { font-family: "Fraunces", serif; font-size: 64px; font-weight: 700; line-height: 1; letter-spacing: -2px; margin: 18px 0 8px; }
  .tag-hero h1 em { color: var(--red); font-style: italic; }
  .tag-hero .meta { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--ink-faint); letter-spacing: 1px; }
  .arch-list { display: flex; flex-direction: column; }
</style>
```

- [ ] **Step 3: 動作確認**

```bash
pnpm dev
```

`/tags/` で全タグ一覧、`/tags/typescript/` で TypeScript タグの記事が出る。Pickup や Hero のタグピルから飛んで遷移できる。

- [ ] **Step 4: コミット**

```bash
git add src/pages/tags/
git commit -m "✨ feat: タグ一覧 / タグ別記事一覧を実装"
```

---

## Task 15: TableOfContents + scripts/toc.ts(vanilla JS)+ ArticleCover

**Files:**
- Create: `src/components/TableOfContents.astro`
- Create: `src/components/ArticleCover.astro`
- Create: `src/scripts/toc.ts`

`Astro.props` 経由で `headings` を受け取り、TOC マークアップを描画。スクロール監視は `src/scripts/toc.ts` を `<script src=...>` で読み込む。

- [ ] **Step 1: src/scripts/toc.ts を作成**

```ts
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
```

- [ ] **Step 2: src/components/TableOfContents.astro を作成**

```astro
---
import type { MarkdownHeading } from "astro";
type Props = { headings: MarkdownHeading[] };
const { headings } = Astro.props;
const h2s = headings.filter((h) => h.depth === 2);
---

<div class="side-block">
  <div class="side-label"><span class="bar"></span>CONTENTS</div>
  <nav class="toc">
    {h2s.map((h, i) => (
      <a href={`#${h.slug}`} class={i === 0 ? "active" : ""}>
        <span class="toc-num">{String(i + 1).padStart(2, "0")}</span>{h.text}
      </a>
    ))}
  </nav>
  <div class="progress-block">
    <span>PROGRESS</span>
    <span id="progress-pct">0%</span>
  </div>
  <div class="progress-bar"><div class="fill" id="progress-fill"></div></div>
</div>

<style>
  .side-block { margin-bottom: 28px; }
  .side-label { font-size: 10px; letter-spacing: 2px; color: var(--ink-faint); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .side-label .bar { width: 14px; height: 1px; background: var(--red); }
  .toc { border-left: 1.5px solid var(--ink); margin-left: -6px; }
  .toc a { display: block; padding: 6px 0 6px 14px; margin-left: -1.5px; color: var(--ink-soft); text-decoration: none; border-left: 2px solid transparent; line-height: 1.3; transition: color .15s, border-color .15s, padding .2s; font-family: "JetBrains Mono", monospace; font-size: 11px; }
  .toc a:hover { color: var(--ink); padding-left: 18px; }
  .toc a.active { color: var(--red); font-weight: 600; border-left-color: var(--red); }
  .toc .toc-num { color: var(--ink-faint); margin-right: 6px; font-weight: 400; }
  .toc a.active .toc-num { color: var(--red); }
  .progress-block { display: flex; justify-content: space-between; align-items: baseline; font-size: 10px; color: var(--ink-faint); margin-top: 8px; font-family: "JetBrains Mono", monospace; }
  .progress-bar { height: 2px; background: var(--line); margin-top: 6px; position: relative; overflow: hidden; }
  .progress-bar :global(.fill) { position: absolute; left: 0; top: 0; bottom: 0; background: var(--red); width: 0%; transition: width .1s; }
</style>
```

- [ ] **Step 3: src/components/ArticleCover.astro を作成**

```astro
---
type Props = { coverTitle?: string; stamp?: string };
const { coverTitle, stamp = "DRAFT" } = Astro.props;
---

<div class="article-cover">
  <div class="cover-frame">
    <div class="topo-bg"></div>
    <svg class="gridlines" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="rgba(245,236,212,0.3)" stroke-width="0.7">
        <path d="M-20 160 Q 80 140, 200 110 T 420 150" />
        <path d="M-20 140 Q 80 120, 200 90 T 420 130" />
        <path d="M-20 120 Q 80 100, 200 70 T 420 110" />
        <path d="M-20 100 Q 80 80, 200 50 T 420 90" />
      </g>
    </svg>
    <div class="stamp">{stamp}</div>
    {coverTitle && <div class="cov-title">{coverTitle}</div>}
  </div>
</div>

<style>
  .article-cover { padding: 0 var(--pad-x); margin-bottom: 36px; }
  .cover-frame { position: relative; background: linear-gradient(135deg, #162030, #0a1420); border: 1.5px solid var(--ink); aspect-ratio: 21 / 9; overflow: hidden; box-shadow: 6px 6px 0 rgba(30,20,10,.1); }
  .topo-bg { position: absolute; inset: 0; background-image: radial-gradient(ellipse 50% 40% at 30% 60%, rgba(239,1,7,0.18), transparent 70%), radial-gradient(ellipse 30% 25% at 70% 40%, rgba(201,169,97,0.22), transparent 70%); }
  .gridlines { position: absolute; inset: 0; width: 100%; height: 100%; }
  .cov-title { position: absolute; bottom: 22px; left: 26px; font-family: "Caveat", cursive; font-size: 40px; color: #f5ecd4; transform: rotate(-2deg); text-shadow: 1px 1px 0 rgba(0,0,0,.3); }
  .stamp { position: absolute; top: 16px; right: 16px; font-family: "JetBrains Mono", monospace; font-size: 10px; letter-spacing: 1.5px; color: rgba(245,236,212,.65); border: 1px solid rgba(245,236,212,.35); padding: 4px 8px; transform: rotate(2deg); }
</style>
```

- [ ] **Step 4: コミット**

```bash
git add src/components/TableOfContents.astro src/components/ArticleCover.astro src/scripts/toc.ts
git commit -m "✨ feat: TOC / ArticleCover / toc.ts (vanilla) を実装"
```

---

## Task 16: 記事詳細(`blog/[slug].astro` + ArticleLayout)

**Files:**
- Create: `src/layouts/ArticleLayout.astro`
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: src/layouts/ArticleLayout.astro を作成**

```astro
---
import "@/styles/article.css";
import type { CollectionEntry, MarkdownHeading } from "astro:content";
import BaseLayout from "./BaseLayout.astro";
import TagPill from "@/components/TagPill.astro";
import ArticleCover from "@/components/ArticleCover.astro";
import TableOfContents from "@/components/TableOfContents.astro";
import SectionHead from "@/components/SectionHead.astro";
import BlogCardRelated from "@/components/BlogCardRelated.astro";
import { formatLongDate } from "@/lib/format";

type Props = {
  post: CollectionEntry<"blog">;
  headings: MarkdownHeading[];
  related: CollectionEntry<"blog">[];
};
const { post, headings, related } = Astro.props;
const data = post.data;
---

<BaseLayout
  title={`${data.title} — Mt. Stupid`}
  description={data.description}
  current="home"
  ogImage={data.thumbnail?.src}
>
  <a href="/blog/" class="back-link">← back to index</a>

  <header class="article-head">
    <div class="article-tags">
      {data.tags.map((t, i) => <TagPill tag={t} variant={i === data.tags.length - 1 ? "red" : "default"} />)}
    </div>
    <h1 class="article-title">{data.title}</h1>
    <p class="article-dek">{data.description}</p>
    <div class="article-meta">
      <span class="avatar">I</span>
      <span class="author">IORI</span>
      <span>·</span>
      <span>{formatLongDate(data.publishedAt)}</span>
    </div>
  </header>

  <ArticleCover coverTitle={data.coverTitle} stamp={`v${data.publishedAt.getUTCFullYear()}`} />

  <div class="article-layout">
    <article class="article-body">
      <slot />
    </article>
    <aside class="article-side">
      <TableOfContents headings={headings} />
    </aside>
  </div>

  {related.length > 0 && (
    <section style="padding: 0 var(--pad-x) 60px;">
      <SectionHead kicker="RELATED" meta={`${related.length} posts · by tag`} />
      <div class="related-grid">
        {related.map((p) => <BlogCardRelated post={p} />)}
      </div>
    </section>
  )}
</BaseLayout>

<script>
  import "@/scripts/toc";
</script>

<style>
  .back-link { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--ink-soft); text-decoration: none; letter-spacing: 1px; text-transform: uppercase; padding: 0 var(--pad-x); margin: 36px 0 16px; display: inline-block; }
  .back-link:hover { color: var(--red); }
  .article-head { padding: 0 var(--pad-x); max-width: 920px; margin: 0 auto 36px; }
  .article-tags { display: flex; gap: 6px; margin-bottom: 20px; }
  .article-title { font-family: "Fraunces", serif; font-weight: 700; font-size: 64px; line-height: 0.98; letter-spacing: -2px; margin: 0 0 18px; }
  .article-dek { font-family: "Fraunces", serif; font-size: 20px; line-height: 1.55; color: var(--ink-soft); margin: 0 0 22px; max-width: 680px; }
  .article-meta { display: flex; gap: 20px; align-items: center; font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--ink-faint); letter-spacing: 0.5px; padding-top: 18px; border-top: 1px dashed var(--line); }
  .article-meta .avatar { width: 32px; height: 32px; border-radius: 16px; background: var(--wash); border: 1.5px solid var(--ink); display: inline-flex; align-items: center; justify-content: center; font-family: "Fraunces", serif; font-weight: 700; color: var(--ink); font-size: 13px; }
  .article-meta .author { color: var(--ink); font-weight: 600; }
  .article-layout { padding: 0 var(--pad-x) 60px; display: grid; grid-template-columns: 1fr 240px; gap: 56px; align-items: start; }
  .article-side { position: sticky; top: 24px; }
  .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; }
  @media (max-width: 860px) {
    .article-layout { grid-template-columns: 1fr; }
    .article-side { position: static; }
    .article-title { font-size: 42px; }
    .related-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: src/pages/blog/[slug].astro を作成**

```astro
---
import { getCollection } from "astro:content";
import ArticleLayout from "@/layouts/ArticleLayout.astro";
import { relatedPosts, visiblePosts } from "@/lib/posts";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}

const { post } = Astro.props;
const all = await getCollection("blog");
const related = relatedPosts(post, visiblePosts(all), 3);
const { Content, headings } = await post.render();
---

<ArticleLayout post={post} headings={headings} related={related}>
  <Content />
</ArticleLayout>
```

- [ ] **Step 3: 動作確認**

```bash
pnpm dev
```

確認:
- `/blog/2026-04-20-rewrite-again/` を直接開く
- 大きいタイトル + dek + cover が表示
- 右サイドに TOC、`なぜまた書き直すのか / 新しいスタック / デプロイ` が並ぶ
- スクロールに合わせてアクティブな見出しが切り替わる、進捗バーが伸びる
- TOC リンクをクリックするとスムーズスクロール
- Related に同タグの他記事が出る(`react`/`typescript`/`meta` を持つ別記事があれば)
- コードブロックが Shiki(`vitesse-dark`)で塗られている
- 引用が手書き風に大きく表示される
- ライト/ダーク切替が動く

- [ ] **Step 4: ビルドが通ることを確認**

```bash
pnpm build
```

期待:`dist/blog/<slug>/index.html` が記事ぶん生成される。

- [ ] **Step 5: コミット**

```bash
git add src/layouts/ArticleLayout.astro src/pages/blog/\[slug\].astro
git commit -m "✨ feat: 記事詳細 (ArticleLayout + TOC + Related) を実装"
```

---

## Task 17: About ページ

**Files:**
- Create: `src/pages/about.astro`
- Reference: `テックブログ作成/Mt Stupid About.html`

ポートフォリオデータの一部(skills 上位、experience 直近、contact)を流し込む。詳細セクションは MVP では portrait-card / hero / 簡易グリッドで完結させる(design HTML をフルに再現するのは大きすぎるので、見栄えする最小実装にする)。

- [ ] **Step 1: src/pages/about.astro を作成**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import SectionHead from "@/components/SectionHead.astro";
import { skills, experience, contact } from "@/content/portfolio";

const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);
const recent = [...experience].slice(0, 3);
---

<BaseLayout
  title="About — Mt. Stupid"
  description="IORI のプロフィールと活動。"
  current="about"
>
  <section class="about-hero">
    <div>
      <div class="intro-kicker"><span class="bar"></span>ABOUT</div>
      <h1>Hi, I'm <em>IORI</em>.<br />Still climbing.</h1>
      <p class="dek">
        コードを書いて、<strong>たまにそれを文章にする</strong>人。
        いま登っているのは Dunning-Kruger の最初の山、<strong>Mt. Stupid</strong>。
        分かった気でいる方がモチベーションが続く、というだけのこと。
      </p>
      <div class="peak-stamp"><span class="dot"></span>currently · climbing</div>
    </div>
    <div class="portrait-card">
      <div class="portrait-img"></div>
      <div class="portrait-caption"><span class="arrow">→</span> me, mostly debugging</div>
      <div class="portrait-small">
        <span>est. 2020</span>
        <span>v3</span>
      </div>
    </div>
  </section>

  <SectionHead kicker="WHAT I REACH FOR" meta={`${topSkills.length} of ${skills.length}`} />
  <section class="grid-skills">
    {topSkills.map((s) => (
      <div class="skill-card">
        <div class="skill-name">{s.name}</div>
        <div class="skill-meta">
          <span>{s.category}</span>
          <span>· {s.yearsOfExperience}y</span>
        </div>
      </div>
    ))}
  </section>

  <SectionHead kicker="RECENT WORK" meta={`${recent.length} of ${experience.length}`} />
  <section class="exp-list">
    {recent.map((e) => (
      <article class="exp-card">
        <div class="exp-period">{e.period}</div>
        <div>
          <h3 class="exp-title">{e.position} · {e.company}</h3>
          <p class="exp-desc">{e.description}</p>
          <div class="exp-tech">{e.technologies.join(" · ")}</div>
        </div>
      </article>
    ))}
  </section>

  <SectionHead kicker="PLACES I SHOW UP" />
  <section class="links-block">
    {contact.socialLinks.github && <a class="big-link" href={contact.socialLinks.github} target="_blank" rel="noreferrer">github →</a>}
    {contact.socialLinks.twitter && <a class="big-link" href={contact.socialLinks.twitter} target="_blank" rel="noreferrer">x / twitter →</a>}
    {contact.socialLinks.qiita && <a class="big-link" href={contact.socialLinks.qiita} target="_blank" rel="noreferrer">qiita →</a>}
    {contact.socialLinks.linkedin && <a class="big-link" href={contact.socialLinks.linkedin} target="_blank" rel="noreferrer">linkedin →</a>}
  </section>
</BaseLayout>

<style>
  .about-hero { padding: 60px var(--pad-x) 20px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center; }
  .intro-kicker { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--red); letter-spacing: 2px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .intro-kicker .bar { width: 24px; height: 1.5px; background: var(--red); }
  .about-hero h1 { font-family: "Fraunces", serif; font-weight: 700; font-size: 68px; line-height: 0.96; letter-spacing: -2.5px; margin: 0 0 20px; }
  .about-hero h1 em { color: var(--red); font-style: italic; font-weight: 600; }
  .dek { font-family: "Fraunces", serif; font-size: 19px; line-height: 1.55; color: var(--ink-soft); margin: 0 0 24px; max-width: 480px; }
  .dek strong { color: var(--ink); font-weight: 600; }
  .peak-stamp { display: inline-flex; align-items: center; gap: 10px; font-family: "JetBrains Mono", monospace; font-size: 11px; padding: 6px 12px; border: 1px dashed var(--red); color: var(--red); letter-spacing: 0.5px; }
  .peak-stamp .dot { width: 6px; height: 6px; border-radius: 3px; background: var(--red); }
  .portrait-card { position: relative; background: var(--paper); border: 1.5px solid var(--ink); box-shadow: 8px 8px 0 rgba(30,20,10,.12); padding: 20px; max-width: 380px; justify-self: end; transform: rotate(1.2deg); }
  .portrait-img { aspect-ratio: 4 / 5; background: radial-gradient(circle at 50% 38%, rgba(30,20,10,.08), transparent 50%), linear-gradient(135deg, var(--wash), var(--paper-2)); border: 1px solid var(--ink); }
  .portrait-caption { font-family: "Caveat", cursive; font-size: 20px; color: var(--ink); text-align: center; margin-top: 12px; transform: rotate(-0.8deg); }
  .portrait-caption .arrow { color: var(--red); }
  .portrait-small { display: flex; justify-content: space-between; font-family: "JetBrains Mono", monospace; font-size: 10px; color: var(--ink-faint); margin-top: 8px; border-top: 1px dashed var(--line); padding-top: 8px; }

  .grid-skills { padding: 0 var(--pad-x) 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .skill-card { border: 1.5px solid var(--ink); background: var(--paper); padding: 16px 18px; box-shadow: 3px 3px 0 rgba(30,20,10,.06); }
  .skill-name { font-family: "Fraunces", serif; font-weight: 700; font-size: 18px; }
  .skill-meta { font-family: "JetBrains Mono", monospace; font-size: 10px; color: var(--ink-soft); margin-top: 4px; }

  .exp-list { padding: 0 var(--pad-x) 40px; display: flex; flex-direction: column; gap: 16px; }
  .exp-card { display: grid; grid-template-columns: 160px 1fr; gap: 24px; padding: 20px 0; border-top: 1px dashed var(--line); }
  .exp-card:first-of-type { border-top: 1.5px solid var(--ink); padding-top: 24px; }
  .exp-period { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--blue); letter-spacing: 0.5px; }
  .exp-title { font-family: "Fraunces", serif; font-weight: 700; font-size: 22px; margin: 0 0 6px; }
  .exp-desc { color: var(--ink-soft); margin: 0 0 8px; line-height: 1.55; }
  .exp-tech { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--ink-faint); }

  .links-block { padding: 0 var(--pad-x) 60px; display: flex; flex-direction: column; gap: 8px; }
  .big-link { font-family: "Fraunces", serif; font-style: italic; font-size: 26px; color: var(--ink); text-decoration: none; padding: 8px 0; border-bottom: 1px dashed var(--line); transition: color .15s, padding .2s; }
  .big-link:hover { color: var(--red); padding-left: 8px; }

  @media (max-width: 860px) {
    .about-hero { grid-template-columns: 1fr; }
    .grid-skills { grid-template-columns: repeat(2, 1fr); }
    .exp-card { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: 動作確認**

```bash
pnpm dev
```

`/about/` を開いてヒーロー、スキルグリッド、経歴、ソーシャルリンクが表示されることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/pages/about.astro
git commit -m "✨ feat: About ページを実装"
```

---

## Task 18: Work ページ

**Files:**
- Create: `src/pages/work.astro`
- Reference: `テックブログ作成/Mt Stupid Work.html`

design HTML の filter / project (wide cards) / metrics に近づける。MVP では filter は静的なカテゴリ表示のみ(クリックインタラクションなし)、Graveyard は出さない。

- [ ] **Step 1: src/pages/work.astro を作成**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import SectionHead from "@/components/SectionHead.astro";
import { projects, skills } from "@/content/portfolio";

const total = projects.length;
const active = projects.filter((p) => p.status === "in-progress").length;
const completed = projects.filter((p) => p.status === "completed").length;
const techCount = new Set(projects.flatMap((p) => p.technologies)).size;

const categoryCounts = projects.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

const visibleProjects = [...projects].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
---

<BaseLayout
  title="Work — Mt. Stupid"
  description="作ったものたち。"
  current="work"
>
  <section class="work-hero">
    <div class="kicker-row"><span class="bar"></span>WORK</div>
    <h1>Things I've <em>built</em></h1>
    <p class="dek">完成したもの、現在進行形のもの。コードと判断の置き場所。</p>
  </section>

  <section class="work-stats">
    <div class="stat"><div class="num">{total}</div><div class="label">projects</div></div>
    <div class="stat"><div class="num">{active}</div><div class="label">active</div></div>
    <div class="stat"><div class="num">{completed}</div><div class="label">shipped</div></div>
    <div class="stat"><div class="num">{techCount}<span class="sfx">techs</span></div><div class="label">stack diversity</div></div>
  </section>

  <section class="work-filter">
    <span class="group-label">CATEGORY</span>
    {Object.entries(categoryCounts).map(([cat, n]) => (
      <span class="chip">{cat} <span class="count">({n})</span></span>
    ))}
  </section>

  <SectionHead kicker="ALL PROJECTS" meta={`${total} listed`} />
  <section class="work-list">
    {visibleProjects.map((p) => (
      <article class="project">
        <div class="proj-head">
          <h3 class="proj-title">{p.title}</h3>
          <div class="proj-period">{p.startDate}{p.endDate ? ` — ${p.endDate}` : " — present"}</div>
        </div>
        <div class="proj-desc">
          <p>{p.longDescription || p.description}</p>
          <div class="proj-tech">
            {p.technologies.map((t) => <span class="tech-pill">{t}</span>)}
          </div>
        </div>
        <div class="proj-meta">
          <div class="aside-label">STATUS</div>
          <div class={`status status-${p.status}`}>{p.status}</div>
          {p.demoUrl && <a class="proj-link" href={p.demoUrl} target="_blank" rel="noreferrer">demo →</a>}
          {p.githubUrl && <a class="proj-link" href={p.githubUrl} target="_blank" rel="noreferrer">github →</a>}
        </div>
      </article>
    ))}
  </section>
</BaseLayout>

<style>
  .work-hero { padding: 52px var(--pad-x) 24px; }
  .kicker-row { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--red); letter-spacing: 2px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .kicker-row .bar { width: 24px; height: 1.5px; background: var(--red); }
  .work-hero h1 { font-family: "Fraunces", serif; font-weight: 700; font-size: 64px; line-height: 0.98; letter-spacing: -2px; margin: 0 0 18px; }
  .work-hero h1 em { color: var(--red); font-style: italic; font-weight: 600; }
  .work-hero .dek { font-family: "Fraunces", serif; font-size: 18px; line-height: 1.55; color: var(--ink-soft); max-width: 560px; margin: 0; }

  .work-stats { display: grid; grid-template-columns: repeat(4, 1fr); padding: 0 var(--pad-x); margin-top: 36px; border-top: 1.5px solid var(--ink); border-bottom: 1.5px solid var(--ink); }
  .stat { padding: 18px 20px; border-right: 1px solid var(--line); display: flex; flex-direction: column; gap: 4px; }
  .stat:last-child { border-right: none; }
  .stat .num { font-family: "Fraunces", serif; font-weight: 700; font-size: 36px; line-height: 1; color: var(--ink); }
  .stat .num .sfx { font-family: "JetBrains Mono", monospace; font-size: 12px; color: var(--ink-faint); margin-left: 4px; font-weight: 400; }
  .stat .label { font-family: "JetBrains Mono", monospace; font-size: 10px; color: var(--ink-soft); letter-spacing: 1.5px; text-transform: uppercase; }

  .work-filter { padding: 24px var(--pad-x) 4px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .group-label { font-family: "JetBrains Mono", monospace; font-size: 10px; color: var(--ink-faint); letter-spacing: 1.5px; }
  .chip { font-family: "JetBrains Mono", monospace; font-size: 11px; padding: 5px 12px; border-radius: 16px; border: 1px solid var(--ink-soft); color: var(--ink-soft); background: transparent; }
  .chip .count { opacity: .6; margin-left: 4px; font-size: 9px; }

  .work-list { padding: 16px var(--pad-x) 40px; display: flex; flex-direction: column; gap: 24px; }
  .project { border: 1.5px solid var(--ink); background: var(--paper); box-shadow: 4px 4px 0 rgba(30,20,10,.1); display: grid; grid-template-columns: 1.5fr 2fr 1fr; gap: 24px; padding: 24px 28px; }
  .proj-head { display: flex; flex-direction: column; gap: 8px; }
  .proj-title { font-family: "Fraunces", serif; font-size: 22px; font-weight: 700; margin: 0; }
  .proj-period { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--blue); }
  .proj-desc p { margin: 0 0 12px; color: var(--ink-soft); line-height: 1.55; }
  .proj-tech { display: flex; flex-wrap: wrap; gap: 4px; }
  .tech-pill { font-family: "JetBrains Mono", monospace; font-size: 9px; padding: 3px 8px; border: 1px solid var(--line); border-radius: 12px; color: var(--ink-soft); }
  .proj-meta { display: flex; flex-direction: column; gap: 8px; }
  .aside-label { font-family: "JetBrains Mono", monospace; font-size: 10px; color: var(--ink-faint); letter-spacing: 1.5px; }
  .status { font-family: "JetBrains Mono", monospace; font-size: 11px; padding: 4px 10px; border: 1px solid var(--ink); display: inline-block; width: fit-content; text-transform: uppercase; }
  .status-in-progress { border-color: var(--red); color: var(--red); }
  .status-completed { color: var(--ink); }
  .status-planned { color: var(--ink-faint); border-style: dashed; }
  .proj-link { font-family: "Fraunces", serif; font-style: italic; font-size: 14px; color: var(--red); text-decoration: none; }
  .proj-link:hover { text-decoration: underline; }

  @media (max-width: 860px) {
    .project { grid-template-columns: 1fr; }
    .work-stats { grid-template-columns: repeat(2, 1fr); }
  }
</style>
```

- [ ] **Step 2: 動作確認**

```bash
pnpm dev
```

`/work/` で stats / filter chips / プロジェクト一覧が表示されることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/pages/work.astro
git commit -m "✨ feat: Work ページを実装"
```

---

## Task 19: 404 ページ

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: 404.astro を作成**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
---

<BaseLayout title="404 — Mt. Stupid" description="そのページは見つかりませんでした。" current="home">
  <section class="not-found">
    <div class="kicker"><span class="bar"></span>OFF-TRAIL</div>
    <h1>404 / <em>off the map</em></h1>
    <p>そのページは見つかりませんでした。地図はあるけど、目的地は無いみたいだ。</p>
    <a href="/" class="back">← back to top</a>
  </section>
</BaseLayout>

<style>
  .not-found { padding: 80px var(--pad-x) 120px; }
  .kicker { font-family: "JetBrains Mono", monospace; font-size: 11px; color: var(--red); letter-spacing: 2px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .kicker .bar { width: 24px; height: 1.5px; background: var(--red); }
  h1 { font-family: "Fraunces", serif; font-weight: 700; font-size: 64px; line-height: 1; letter-spacing: -2px; margin: 0 0 18px; }
  h1 em { color: var(--red); font-style: italic; }
  p { font-family: "Fraunces", serif; font-size: 18px; color: var(--ink-soft); max-width: 540px; margin: 0 0 24px; line-height: 1.55; }
  .back { font-family: "JetBrains Mono", monospace; font-size: 12px; color: var(--ink); text-decoration: none; padding: 8px 14px; border: 1px solid var(--ink); transition: all .15s; }
  .back:hover { background: var(--ink); color: var(--paper); }
</style>
```

- [ ] **Step 2: コミット**

```bash
git add src/pages/404.astro
git commit -m "✨ feat: 404 ページを実装"
```

---

## Task 20: RSS + sitemap + robots

**Files:**
- Create: `src/pages/rss.xml.ts`
- Create: `public/robots.txt`
- (sitemap は `@astrojs/sitemap` integration が自動生成)

- [ ] **Step 1: src/pages/rss.xml.ts を作成**

```ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { sortedByPublished, visiblePosts } from "@/lib/posts";

export async function GET(context: APIContext) {
  const posts = sortedByPublished(visiblePosts(await getCollection("blog")));
  return rss({
    title: "Mt. Stupid",
    description: "notes from the peak of my own confidence",
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.publishedAt,
      link: `/blog/${p.slug}/`,
      categories: p.data.tags,
    })),
    customData: "<language>ja</language>",
  });
}
```

- [ ] **Step 2: public/robots.txt を作成**

```bash
cat > public/robots.txt <<'EOF'
User-agent: *
Allow: /

Sitemap: https://mt-stupid.example.com/sitemap-index.xml
EOF
```

(独自ドメイン確定後に URL を差し替える)

- [ ] **Step 3: ビルドが通って `dist/rss.xml` と `dist/sitemap-*.xml` が出力されることを確認**

```bash
pnpm build
ls dist/
```

期待: `rss.xml`, `sitemap-index.xml`, `sitemap-0.xml` が見える。

- [ ] **Step 4: 内容を軽く確認**

```bash
head -30 dist/rss.xml
head -30 dist/sitemap-index.xml
```

期待:5 件分の `<item>` が RSS にある、sitemap に `/about/`, `/work/`, `/tags/`, `/blog/` などが含まれる。

- [ ] **Step 5: コミット**

```bash
git add src/pages/rss.xml.ts public/robots.txt
git commit -m "✨ feat: RSS / sitemap / robots を追加"
```

---

## Task 21: Cloudflare Workers 設定 + ローカル動作確認

**Files:**
- Create: `wrangler.toml`

公式: <https://developers.cloudflare.com/workers/static-assets/get-started/>

- [ ] **Step 1: wrangler.toml を作成**

```toml
name = "mt-stupid-blog"
compatibility_date = "2026-04-25"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

- [ ] **Step 2: wrangler のローカル開発サーバで static 配信を確認**

```bash
pnpm build
pnpm wrangler dev
```

期待: `http://localhost:8787` で本番ビルドの内容が表示される。`/blog/`, `/about/`, `/tags/`, `/blog/<slug>/`, `/rss.xml` が全部 200 を返す。存在しない URL(例: `/nope/`)は 404 ページになる。

`Ctrl+C` で停止。

- [ ] **Step 3: コミット**

```bash
git add wrangler.toml
git commit -m "🔧 chore: Cloudflare Workers Static Assets 設定を追加"
```

(`wrangler deploy` は独自ドメイン設定 + Cloudflare アカウント連携の準備が整ってから実行する。MVP の done 定義としては「ローカル wrangler dev で全ページ 200」までで十分)

---

## Task 22: ツール仕上げ(Lefthook 簡素化、astro check の自動化)

**Files:**
- Modify: `lefthook.yml`

- [ ] **Step 1: 現行の lefthook.yml を確認**

```bash
cat lefthook.yml
```

- [ ] **Step 2: 簡素化した lefthook.yml に書き換える**

```yaml
pre-commit:
  parallel: true
  commands:
    biome:
      glob: "src/**/*.{ts,tsx,js,jsx}"
      run: pnpm biome:check
    astro-check:
      glob: "src/**/*.{astro,ts,tsx}"
      run: pnpm astro check
```

- [ ] **Step 3: ローカルで lefthook を再インストール**

```bash
pnpm lefthook install
```

- [ ] **Step 4: 実際に lefthook が走ることを確認**

```bash
echo "// trivial" >> src/lib/format.ts
git add src/lib/format.ts
git commit -m "🧪 test: lefthook 動作確認(後で revert)"
git reset --hard HEAD~1
```

期待: コミット時に biome / astro check が走る。`reset --hard` で元に戻す。

- [ ] **Step 5: 最終ビルド確認**

```bash
pnpm build
pnpm test
```

期待: build エラー 0、テスト 6 件パス。

- [ ] **Step 6: コミット**

```bash
git add lefthook.yml
git commit -m "🔧 chore: lefthook を Astro 用に簡素化"
```

- [ ] **Step 7: README を最低限更新**

```bash
cat > README.md <<'EOF'
# mt-stupid-blog

技術記事を投稿するブログ兼ポートフォリオサイト。Astro 5 + Markdown + Cloudflare Workers。

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm test         # vitest
pnpm build        # → dist/
pnpm wrangler dev # → http://localhost:8787 (built site)
```

## Deploy

```bash
pnpm deploy       # = pnpm build && wrangler deploy
```

## Content

- 記事: `src/content/blog/YYYY-MM-DD-<slug>.md`
- ポートフォリオ: `src/content/portfolio/*.ts`

## Design

`テックブログ作成/Mt Stupid *.html` を正とする。実装は arsenal palette 固定 + light/dark のみ。
EOF
git add README.md
git commit -m "📝 docs: README を Astro 構成に更新"
```

---

## Spec カバレッジ確認(Self-Review 用チェックリスト)

このプランが spec の要件を満たしているか:

- [x] Astro 5.x SSG セットアップ → Task 2
- [x] arsenal palette 固定 + light/dark → Task 3, 7, 8
- [x] Content Collections + zod schema → Task 4
- [x] ポートフォリオデータ移植 → Task 5
- [x] 純関数(タグ集計 / pickup / related)+ vitest → Task 6
- [x] Nav / Footer / BrandMark + N5 · POSTS · COYG / Victory through harmony → Task 7
- [x] ThemeToggle React island + FOUC 防止 → Task 8
- [x] BaseLayout + OGP + canonical + RSS link → Task 9
- [x] 共通コンポーネント(TagPill / SectionHead / Pagination) → Task 10
- [x] BlogCard 4 種 → Task 11
- [x] Top ページ(Hero / Pickups / Archive)→ Task 12
- [x] Blog 一覧 + ページネーション(10 件)→ Task 13
- [x] Tag 一覧 / タグ別 → Task 14
- [x] TableOfContents + scripts/toc.ts(vanilla)+ ArticleCover → Task 15
- [x] 記事詳細 + Related → Task 16
- [x] About → Task 17
- [x] Work → Task 18
- [x] 404 → Task 19
- [x] RSS + sitemap + robots → Task 20
- [x] wrangler.toml + ローカル wrangler dev 確認 → Task 21
- [x] lefthook 簡素化、Markuplint / Storybook 削除 → Task 1, 22
- [x] Tailwind / shadcn / microCMS / cheerio / zenn-* / react-scrollspy 削除 → Task 1
- [x] MVP 範囲外:slides / 他パレット / 密度 UI / reads-words 統計 / Graveyard / microCMS 移行 / 旧 URL リダイレクト → どのタスクにも含めない

すべての spec 要件にタスクが対応している。プレースホルダ・矛盾は無し。
