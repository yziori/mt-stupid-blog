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
