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
