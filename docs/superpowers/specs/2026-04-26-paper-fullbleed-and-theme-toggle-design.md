# Paper full-bleed レイアウト化 + ThemeToggle のヘッダー移設

- 日付: 2026-04-26
- ブランチ: `feature/astro-migration`
- 関連 Issue / PR: なし

## 背景

現状の `BaseLayout` は **「外側のステージ色 (`--stage`) + その上に乗った max-width 1120px の紙シート (`.paper`)」** という二層構造になっている。`.paper` は `box-shadow`, `border`, `::before` のジグザグ縁、独自の背景グラデ + 罫線パターンを持ち、ビューポート中央に「便箋が浮いている」見た目を作っている。

ユーザーから次の要望:

1. 外側のステージ色は不要 (画面の左右にはみ出ている色帯を消したい)
2. Mt. Stupid ヘッダーが「画面全体に広がる」印象にしたい
3. ThemeToggle が現状 `position: fixed` で画面右下に貼り付けられているが、レイアウト変更後に違和感が出るので **Nav (ヘッダー) に移設** する

## ゴール

- `body` 全体が「紙の地」となるフルブリードレイアウトにする
- 中身 (Nav / 本文 / Footer) の論理的な読み幅 1120px は維持する
- ヘッダーの罫線・フッターの背景帯が画面端まで伸び、「ヘッダー / フッターが画面全体に広がる」見た目を作る
- ThemeToggle を Nav 内に配置し、`position: fixed` を撤去する
- ライト / ダーク両モードで違和感なく表示される

## 非ゴール

- パレット (`--paper`, `--ink`, `--red` …) の値変更
- `.paper` の装飾 (グラデ・罫線) の意匠変更 — 移植のみ
- 記事本文 (`ArticleLayout`, `article.css`) の改修 — `BaseLayout` の slot に乗っているので自動的に追従する
- レスポンシブ (モバイル) 用ブレークポイントの新規追加 — 既存挙動を壊さない範囲のみ
- `BlogCardHero` 等のカード装飾グラデーションは対象外

## 現状の構造

```
<body bg=--stage>
  └ <div class="paper" max-width:1120px; margin:40px auto; bg=--paper + 装飾; box-shadow; border; ::before(zigzag)>
       ├ <Nav> ... border-bottom が paper 内で完結
       ├ <slot /> (各ページ本文)
       └ <Footer> ... bg=--paper-2 が paper 内で完結
  └ <div class="theme-toggle-wrap" position:fixed bottom-right>
       └ <ThemeToggle client:load />
```

## 変更後の構造

```
<body bg=--paper + 装飾 (グラデ × 2 + 28px 罫線)>
  └ <Nav>                       ← 全幅、border-bottom は画面端まで
       └ <div class="inner" max-width:1120px; margin:0 auto>
            └ brand / nav-links / ThemeToggle / altitude
  └ <div class="paper">         ← max-width:1120px の中央寄せ wrapper のみ
       └ <slot />
  └ <Footer>                    ← 全幅、bg=--paper-2 は画面端まで
       └ <div class="inner" max-width:1120px; margin:0 auto>
            └ ...
```

注意点:

- Nav と Footer は `<div class="paper">` の **外** に出す。これにより Nav の `border-bottom` と Footer の `background: var(--paper-2)` が画面端まで伸びる。
- `.paper` 自体は `<slot />` (各ページ本文) を 1120px に絞るためだけの軽量 wrapper となる。

## 実装方針

### A. `src/styles/theme.css`

1. `:root` の `--stage` 変数を **削除** (`:root.dark` 側も同様)。使い箇所がなくなるため。
2. `html, body` の `background` を `var(--stage)` から **`.paper` が持っていた装飾レイヤー (現在 50–55, 60 行目) を移植**:
   - `background: var(--paper);`
   - `background-image: radial-gradient(ellipse at top left, ...), radial-gradient(ellipse at bottom right, ...), repeating-linear-gradient(0deg, transparent 0 28px, rgba(90,123,153,0.05) 28px 29px);`
3. `body` の `transition: background .3s, color .3s;` は維持。
4. `.paper` を以下に書き換える:
   ```css
   .paper {
     max-width: 1120px;
     margin: 0 auto;
   }
   ```
   削除するもの:
   - `background`, `background-image`
   - `box-shadow`
   - `border`
   - `transition: background .3s`
   - `position: relative; overflow: hidden;`
5. `.paper::before` (上端ジグザグ) のルール全体を削除。

### B. `src/layouts/BaseLayout.astro`

- `<body>` 直下の構造を変更:
  - `<div class="paper">` の **外側** に `<Nav />` と `<Footer />` を出す
  - `<div class="paper">` の中身は `<slot />` のみ
- `<div class="theme-toggle-wrap">` ブロックと、それに対応する `<style>` 内の `.theme-toggle-wrap` ルールを削除
- `import ThemeToggle from "@/components/ThemeToggle.tsx"` を削除 (Nav 側に移動するため、BaseLayout からは不要)
- `Nav` に props 経由で渡す必要はない (Nav 側で直接 import する)

### C. `src/components/Nav.astro`

1. `import ThemeToggle from "./ThemeToggle.tsx"` を追加
2. `<nav class="top">` 直下に `<div class="inner">` を入れ、子要素 (brand / nav-links / altitude) をその中に移動
3. `nav-links` の **すぐ右** に `<ThemeToggle client:load />` を配置 (新たに `theme-toggle-slot` のような小さな div でラップせず、flex の兄弟要素として直接置く)
4. CSS:
   - 既存の `nav.top` の `padding: 28px var(--pad-x) 24px` と flex 設定を `.inner` に移す
   - `nav.top` 自体は `border-bottom: 1.5px solid var(--ink); position: relative;` のみ持つ (全幅の帯としての責務)
   - `.inner` は `max-width: 1120px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 28px var(--pad-x) 24px; position: relative;`
   - `.altitude` は `top` / `right` 指定が `nav.top` から `.inner` の相対座標に変わるので、配置がずれないか目視確認 (`right: var(--pad-x)` のままで OK のはず)
   - ThemeToggle は flex 子としてサイズそのまま、追加スタイルなし

### D. `src/components/Footer.astro`

1. `<footer class="site">` 直下に `<div class="inner">` を入れ、既存の3ブロック (`<div>`, `.quote`, `.links`) をその中に移動
2. CSS:
   - `footer.site` は `border-top: 1.5px solid var(--ink); background: var(--paper-2);` のみ持つ (全幅帯)
   - `.inner` は `max-width: 1120px; margin: 0 auto; padding: 32px var(--pad-x); display: flex; justify-content: space-between; align-items: baseline; font-family / font-size / color` を担当
   - `:global(:root.dark) footer.site` の `border-top-color` は維持

### E. `src/components/ThemeToggle.tsx`

- 変更なし。既存スタイル (透明背景・mono フォント・border ink-soft) が Nav の他要素と整合する。
- `client:load` directive は Nav 側の使用箇所で必須 (付け忘れ注意)。

## 検証項目

ライト / ダーク両モードで以下を目視確認:

1. ステージ色の帯が画面左右に出ていない
2. 罫線パターン (28px 周期) が body 全幅に違和感なく描画されている
3. Nav の `border-bottom` が画面端まで伸びている
4. Nav の中身 (brand / nav-links / ThemeToggle / altitude) が 1120px 内で従来どおり配置されている
5. ワイドディスプレイ (1920px+) で brand と altitude が散漫にならない
6. ThemeToggle がクリックでき、ダーク/ライト切替が機能する
7. Footer の `--paper-2` 背景が画面端まで伸びている
8. Footer の中身も 1120px 中央寄せになっている
9. `altitude` block (右上、絶対配置) の位置が変更前と一致している
10. 記事ページ (`/blog/[slug]/`) も BaseLayout 経由で同じレイアウトになっている

## 影響範囲

- 全ページ (BaseLayout を使っている全ルート: `/`, `/about/`, `/work/`, `/blog/`, `/blog/[slug]/`, `/tags/`, `/tags/[tag]/`, `/404`)
- 記事ページの `ArticleLayout` は内部で BaseLayout を呼んでいるので追従

## ロールバック方針

`theme.css` / `BaseLayout.astro` / `Nav.astro` / `Footer.astro` の 4 ファイルへの変更を `git revert` で巻き戻せば原状復帰可能。`--stage` 変数削除も同コミットに含めるため整合性は保たれる。

## オープンクエスチョン

- なし (実装方針で全要望をカバー)
