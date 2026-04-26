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
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
	site: "https://mt-stupid.dev",
	integrations: [react()],
});
```

## デプロイ

Cloudflare Workers Static Assets。リポジトリを繋いで `pnpm build && wrangler deploy` を指定するだけ。
