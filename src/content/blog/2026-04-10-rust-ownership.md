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
