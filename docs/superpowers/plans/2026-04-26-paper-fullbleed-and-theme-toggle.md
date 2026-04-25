# Paper Full-Bleed Layout + ThemeToggle Header Move — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ステージ色を撤去して `body` 全体を「紙の地」にし、Nav/Footer を `.paper` の外に出して全幅表示にする。同時に `position: fixed` の `ThemeToggle` を Nav 内に移設する。

**Architecture:** 二層構造 (`body[bg=stage]` > `.paper[bg=paper, max-width 1120px]` > 中身) を、`body` に紙の装飾を一段引き上げて `.paper` を「中身の幅を 1120px に絞るだけの軽量 wrapper」に縮退させる。Nav と Footer は `.paper` の外に出して全幅化し、それぞれ内部に `.inner` (`max-width: 1120px; margin: 0 auto`) を持たせて中身の中央寄せだけは維持する。`ThemeToggle` は `BaseLayout` の fixed 配置から外して `Nav` の flex 子要素として組み込む。

**Tech Stack:** Astro 5 (SSG, scoped CSS), React 19 island (`@astrojs/react`), Vanilla CSS variables. パッケージマネージャは pnpm。Biome (lint/format), `astro check` (型 + frontmatter 検証)。

**参照スペック:** `docs/superpowers/specs/2026-04-26-paper-fullbleed-and-theme-toggle-design.md`

**注意:** 純粋に視覚レイアウトの変更で、ロジックテスト対象が無い (`src/lib/*.test.ts` は純粋関数のみ)。検証は `pnpm astro check` + `pnpm biome:check` + `pnpm dev` でのブラウザ目視。テスト追加はしない (YAGNI)。

---

## File Structure

| ファイル | 役割 | 変更タイプ |
|---|---|---|
| `src/styles/theme.css` | グローバルテーマ。`body` 背景・`.paper` 構造・パレット変数を定義 | 修正 |
| `src/layouts/BaseLayout.astro` | 全ページの外枠。Nav/slot/Footer を組み立て | 修正 |
| `src/components/Nav.astro` | サイトヘッダー。brand / nav-links / altitude を表示 | 修正 (ThemeToggle 受け入れ + inner wrapper) |
| `src/components/Footer.astro` | サイトフッター。著者名 / quote / links | 修正 (inner wrapper) |

`src/components/ThemeToggle.tsx` は変更しない。`src/layouts/ArticleLayout.astro` は内部で BaseLayout を呼んでいるだけなので追従するため変更不要。

---

## Task 1: `theme.css` を改修して body をフルブリードの紙にする

**Files:**
- Modify: `src/styles/theme.css:1-73`

このタスクで `body` に紙の装飾を移し、`.paper` を中央寄せ wrapper に縮退させる。`--stage` 変数は使用箇所が消えるので削除する。

- [ ] **Step 1: 現状の `theme.css` を確認**

Run: `cat src/styles/theme.css | head -80`

確認事項:
- `:root` に `--stage: #d8c78e;` がある (13 行目付近)
- `:root.dark` に `--stage: #050912;` がある (30 行目付近)
- `html, body` の `background: var(--stage);` (36 行目付近)
- `.paper` が `max-width / margin / background / background-image / box-shadow / border / position / overflow / transition` を持つ (47–63 行目付近)
- `.paper::before` が上端ジグザグの装飾を持つ (64–73 行目付近)

- [ ] **Step 2: `:root` から `--stage` 変数を削除**

`src/styles/theme.css` の `:root { ... }` ブロック内の以下の行を削除:

```css
  --stage: #d8c78e;
```

- [ ] **Step 3: `:root.dark` から `--stage` 変数を削除**

`src/styles/theme.css` の `:root.dark { ... }` ブロック内の以下の行を削除:

```css
  --stage: #050912;
```

- [ ] **Step 4: `html, body` の背景を変更**

旧 (`src/styles/theme.css:34-41` 付近):

```css
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: var(--stage);
  color: var(--ink);
  font-family: "Inter", -apple-system, sans-serif;
  font-size: var(--base-size);
  transition: background .3s, color .3s;
}
```

新:

```css
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: var(--paper);
  background-image:
    radial-gradient(ellipse at top left, rgba(180,150,90,0.08), transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(120,90,50,0.06), transparent 50%),
    repeating-linear-gradient(0deg, transparent 0 28px, rgba(90,123,153,0.05) 28px 29px);
  color: var(--ink);
  font-family: "Inter", -apple-system, sans-serif;
  font-size: var(--base-size);
  transition: background .3s, color .3s;
}
```

- [ ] **Step 5: `.paper` を中央寄せ wrapper に縮退**

旧 (`src/styles/theme.css:47-63` 付近):

```css
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
```

新:

```css
.paper {
  max-width: 1120px;
  margin: 0 auto;
}
```

- [ ] **Step 6: `.paper::before` ルールを完全削除**

旧 (`src/styles/theme.css:64-73` 付近):

```css
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
```

新: (このルールごと削除)

- [ ] **Step 7: 検証**

Run: `pnpm astro check`
Expected: `0 errors, 0 warnings` (型・スキーマ違反なし)

Run: `pnpm biome:check`
Expected: lint パス (CSS は対象外だが他ファイルに影響していないことを確認)

Run: `grep -n "stage" src/styles/theme.css`
Expected: 出力なし (`--stage` が完全に消えていること)

- [ ] **Step 8: コミット**

```bash
git add src/styles/theme.css
git commit -m "$(cat <<'EOF'
✨ feat: body をフルブリードの紙に変更し .paper を中央寄せ wrapper に縮退

- body に紙の装飾 (グラデ × 2 + 28px 罫線) を移植して画面全体を「紙の地」にする
- .paper から bg / box-shadow / border / margin-top / ::before ジグザグを削除
- 使われなくなる --stage 変数を light/dark の両方から削除

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `BaseLayout.astro` から ThemeToggle と paper 内ヘッダー/フッターを外す

**Files:**
- Modify: `src/layouts/BaseLayout.astro:1-63`

`Nav` と `Footer` を `.paper` の **外** に出すことで、Nav の `border-bottom` と Footer の `--paper-2` 背景が画面端まで伸びるようにする。`ThemeToggle` は Nav 側で扱うため BaseLayout からは完全に取り除く。

- [ ] **Step 1: `ThemeToggle` の import を削除**

旧 (`src/layouts/BaseLayout.astro:1-6`):

```astro
---
import "@/styles/theme.css";
import Nav from "@/components/Nav.astro";
import Footer from "@/components/Footer.astro";
import ThemeInit from "@/components/ThemeInit.astro";
import ThemeToggle from "@/components/ThemeToggle.tsx";
```

新:

```astro
---
import "@/styles/theme.css";
import Nav from "@/components/Nav.astro";
import Footer from "@/components/Footer.astro";
import ThemeInit from "@/components/ThemeInit.astro";
```

- [ ] **Step 2: `<body>` 内の構造を組み換え**

旧 (`src/layouts/BaseLayout.astro:46-62`):

```astro
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
```

新:

```astro
  <body>
    <Nav current={current} />
    <div class="paper">
      <slot />
    </div>
    <Footer />
  </body>
```

(`<style>` ブロックごと削除して空にする。BaseLayout に他に scoped CSS が無いため `<style>` タグ自体不要。)

- [ ] **Step 3: 検証**

Run: `pnpm astro check`
Expected: `0 errors, 0 warnings`

Run: `grep -n "ThemeToggle\|theme-toggle" src/layouts/BaseLayout.astro`
Expected: 出力なし (BaseLayout から ThemeToggle が完全に切り離されたこと)

- [ ] **Step 4: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "$(cat <<'EOF'
✨ feat: BaseLayout から Nav/Footer を .paper の外に出し ThemeToggle 配置を撤去

Nav と Footer を .paper の外に出すことで、border-bottom (Nav) と
paper-2 背景 (Footer) が画面端まで伸びる全幅帯になる。
ThemeToggle は Nav 側で扱うため BaseLayout からは import / 配置 / fixed style を撤去。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `Nav.astro` に inner wrapper と ThemeToggle を組み込む

**Files:**
- Modify: `src/components/Nav.astro:1-89`

Nav 自体は全幅の帯 (`border-bottom` のみ) として残し、中身は `.inner` でラップして `max-width: 1120px; margin: 0 auto` で中央寄せする。`nav-links` の右隣に `<ThemeToggle client:load />` を flex 子要素として配置する。

- [ ] **Step 1: `ThemeToggle` の import を追加**

旧 (`src/components/Nav.astro:1-5`):

```astro
---
import BrandMark from "./BrandMark.astro";
import { getCollection } from "astro:content";
import { visiblePosts } from "@/lib/posts";
```

新:

```astro
---
import BrandMark from "./BrandMark.astro";
import ThemeToggle from "./ThemeToggle.tsx";
import { getCollection } from "astro:content";
import { visiblePosts } from "@/lib/posts";
```

- [ ] **Step 2: テンプレートに inner wrapper と ThemeToggle を追加**

旧 (`src/components/Nav.astro:12-32`):

```astro
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
```

新:

```astro
<nav class="top">
  <div class="inner">
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
      <ThemeToggle client:load />
    </div>

    <div class="altitude">
      <span class="dot-live"></span>
      <span>N5 · {totalPosts} POSTS · COYG</span>
    </div>
  </div>
</nav>
```

ポイント:
- 既存の `brand` / `nav-links` / `altitude` を `<div class="inner">` でラップ
- `ThemeToggle` は `nav-links` の **最後の子要素** として配置 (gap: 26px が継承される)
- `client:load` directive 必須 (これがないと React island がハイドレートされない)

- [ ] **Step 3: CSS を inner ベースに書き換え**

旧 (`src/components/Nav.astro:34-41` 付近):

```css
nav.top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28px var(--pad-x) 24px;
  border-bottom: 1.5px solid var(--ink);
  position: relative;
}
:global(:root.dark) nav.top { border-bottom-color: #1f2d4a; }
```

新:

```css
nav.top {
  border-bottom: 1.5px solid var(--ink);
}
:global(:root.dark) nav.top { border-bottom-color: #1f2d4a; }
.inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px var(--pad-x) 24px;
  display: flex; align-items: center; justify-content: space-between;
  position: relative;
}
```

ポイント:
- `nav.top` は **全幅の帯** としての責務のみ (border-bottom)
- `.inner` が **中身の中央寄せと flex 配置** を持つ
- `.altitude` は内部で `position: absolute; top: 28px; right: var(--pad-x); transform: translateY(46px);` のままなので、`.inner` の `position: relative` を起点に同じ位置に来る (旧 `nav.top` も `position: relative` だったので相対距離は不変)

- [ ] **Step 4: 検証**

Run: `pnpm astro check`
Expected: `0 errors, 0 warnings`

Run: `pnpm biome:check`
Expected: パス

- [ ] **Step 5: コミット**

```bash
git add src/components/Nav.astro
git commit -m "$(cat <<'EOF'
✨ feat: Nav を全幅帯化し ThemeToggle を nav-links 右端に組み込み

- nav.top は border-bottom だけを持つ全幅帯に
- 中身は .inner (max-width: 1120px; margin: 0 auto) で中央寄せ
- ThemeToggle を nav-links の最後の flex 子として配置 (client:load 維持)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `Footer.astro` に inner wrapper を追加

**Files:**
- Modify: `src/components/Footer.astro:1-32`

Footer 自体は `border-top` と `background: var(--paper-2)` の **全幅帯** として残し、中身は `.inner` で max-width 1120px に絞る。

- [ ] **Step 1: テンプレートに inner wrapper を追加**

旧 (`src/components/Footer.astro:1-14`):

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
```

新:

```astro
---
---
<footer class="site">
  <div class="inner">
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
  </div>
</footer>
```

- [ ] **Step 2: CSS を inner ベースに書き換え**

旧 (`src/components/Footer.astro:16-32` 付近):

```css
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
```

新:

```css
footer.site {
  border-top: 1.5px solid var(--ink);
  background: var(--paper-2);
}
:global(:root.dark) footer.site { border-top-color: #1f2d4a; }
.inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px var(--pad-x);
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: "JetBrains Mono", monospace; font-size: 11px;
  color: var(--ink-soft);
}
.built { margin-top: 4px; color: var(--ink-faint); }
.quote { font-family: "Caveat", cursive; font-size: 18px; color: var(--ink); max-width: 40%; }
.links { display: flex; gap: 16px; }
.links a { color: var(--ink-soft); text-decoration: none; }
.links a:hover { color: var(--red); }
.links a.coyg { color: var(--red); font-weight: 600; }
```

- [ ] **Step 3: 検証**

Run: `pnpm astro check`
Expected: `0 errors, 0 warnings`

Run: `pnpm biome:check`
Expected: パス

- [ ] **Step 4: コミット**

```bash
git add src/components/Footer.astro
git commit -m "$(cat <<'EOF'
✨ feat: Footer を全幅帯化し中身を inner で 1120px 中央寄せ

footer.site は border-top と paper-2 背景だけを持つ全幅帯に。
中身 (著者名 / quote / links) は .inner (max-width: 1120px) でラップして
従来の中央寄せ + flex 配置を維持。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: ブラウザ目視検証

**Files:** なし (確認のみ)

ライト / ダーク両モードで仕様書の検証項目をチェック。問題があれば該当タスクのコミットに戻って修正、なければ完了。

- [ ] **Step 1: dev サーバーを起動**

Run: `pnpm dev`
Expected: `http://localhost:4321` で起動。ターミナルに `Local: http://localhost:4321/` が出ること。

(別シェルで動かしてもよい。background 実行可。)

- [ ] **Step 2: ライトモードでホーム (`/`) を確認**

ブラウザで `http://localhost:4321/` を開き、以下を目視確認:

1. ✅ 画面左右に `--stage` 色 (黄土色 `#d8c78e`) の帯が **出ていない** こと
2. ✅ 画面全体が紙の地色 + 薄い罫線パターンで埋まっていること
3. ✅ Nav の `border-bottom` (細い ink 色の線) が画面の左端から右端まで伸びていること
4. ✅ Nav の中身 (Mt. Stupid ロゴ / nav-links / altitude) が中央寄せで散漫になっていないこと
5. ✅ ThemeToggle (`☀ light` ボタン) が nav-links の右隣に出ていること
6. ✅ 画面右下に固定 ThemeToggle が **出ていない** こと
7. ✅ Footer の `--paper-2` 背景 (やや濃い paper 色) が画面端まで伸びていること

- [ ] **Step 3: ThemeToggle をクリックしてダークモードに切替**

ボタンをクリック → ラベルが `☾ dark` に変わり、画面全体がダーク `--paper` (`#0c1524`) になることを確認。
LocalStorage `theme` キーが `dark` になっていること (DevTools Application タブで確認可)。

- [ ] **Step 4: ダークモードで同じ項目を確認**

Step 2 の 1〜7 をダークモードで再チェック。`--paper-2` の dark 値 (`#07101d`) が Footer に出ていること。

- [ ] **Step 5: ワイドディスプレイ相当 (1920px+) を確認**

DevTools のレスポンシブモードで横幅 1920px に設定:

1. ✅ Nav の brand と altitude が画面端まで飛んで散漫になっていないこと (1120px 内に収まる)
2. ✅ Footer の中身も 1120px 内で中央寄せされていること
3. ✅ 罫線パターンが横幅全体に等間隔で描画されていること

- [ ] **Step 6: 記事ページで同じレイアウトになっていることを確認**

`http://localhost:4321/blog/` を開き、いずれかの記事を開く。

1. ✅ Nav が全幅帯になっている
2. ✅ 記事本文 (`ArticleLayout` の中身) が `.paper` の中で 1120px 表示されている
3. ✅ Footer が全幅帯になっている

- [ ] **Step 7: 全部 OK ならタスク完了。問題があればドリルダウン**

問題が見つかった場合の対応指針:

| 症状 | 推定原因 | 修正先タスク |
|---|---|---|
| ステージ色が残ったまま | `body { background }` の上書き漏れ | Task 1 Step 4 |
| Nav の border-bottom が paper の中で完結 | Nav が `.paper` の中にある | Task 2 Step 2 |
| ThemeToggle が表示されない | `client:load` 漏れ または import 漏れ | Task 3 Step 1, 2 |
| ThemeToggle 押しても切替しない | `ThemeInit.astro` が未配置 (BaseLayout で `<ThemeInit />` が `<head>` に居ること) | Task 2 (head 内未触のはず) |
| altitude block の位置がずれた | `.inner` 側 `position: relative` の付け忘れ | Task 3 Step 3 |
| ワイド画面で中身が画面端に飛ぶ | `.inner` の max-width 設定漏れ | Task 3 Step 3 / Task 4 Step 2 |

---

## 完了条件

- [ ] Task 1〜4 の各 commit が積まれている
- [ ] `pnpm astro check` が 0 errors / 0 warnings
- [ ] `pnpm biome:check` がパス
- [ ] Task 5 のブラウザ目視チェック項目がライト/ダーク両方で全て OK
- [ ] `grep -rn "\\-\\-stage\|theme-toggle-wrap" src/` で `--stage` / `theme-toggle-wrap` が完全消滅していること

すべて満たしたら、Lefthook の pre-commit (biome + astro check) を通過した 4 commits が `feature/astro-migration` に積まれた状態で実装完了。
