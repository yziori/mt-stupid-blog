# Mt. Stupid ブログ Astro 移行 設計

- **作成日**: 2026-04-25
- **対象リポジトリ**: `mt-stupid-blog`
- **現状**: Next.js 15 (App Router) + microCMS + Tailwind + shadcn
- **移行先**: Astro 5.x + リポジトリ内 Markdown + vanilla CSS + Cloudflare Workers
- **方針**: デザイン刷新を伴うため、既存リポジトリ上で **作り直し**(同リポジトリの新ブランチ)

## 動機

1. ビルド/開発体験の改善(Next.js の重さ・設定の複雑さ)
2. ホスティング/コスト削減(脱 Vercel、Cloudflare Workers の無料配信)
3. 別フレームワーク体験(Next.js とは違う毛色を試す)

CMS は廃止する。記事は git 管理の Markdown に移す。

## 採用スタック

| 領域 | 採用 |
|---|---|
| フレームワーク | Astro 5.x(SSG, `output: 'static'`) |
| 言語 | TypeScript / pnpm |
| インタラクション | React 19(island のみ。`@astrojs/react`) |
| スタイル | vanilla CSS(scoped + global)。Tailwind は採用しない |
| Markdown | Astro 標準 + `rehype-slug` + `rehype-autolink-headings` + Shiki(`vitesse-dark`) |
| 公式 integration | `@astrojs/sitemap`, `@astrojs/rss`(adapter は不要、static 出力を Workers Static Assets で配信) |
| Lint/Format | Biome 継続 |
| Git Hook | Lefthook 継続(`biome check` のみ) |
| テスト | Vitest 継続(純関数の単体テストのみ) |
| デプロイ | Cloudflare Workers Static Assets(`wrangler deploy`) |

### 捨てるもの

Next.js, Tailwind, microcms-js-sdk, shadcn, Radix UI, zenn-content-css, zenn-markdown-html, react-scrollspy, cheerio, Storybook 一式, Markuplint。

### 移植するもの

- `src/app/_data/*.ts`(ポートフォリオ静的データ) → `src/content/portfolio/*.ts` に移動。型は維持
- `public/images/mt-stupid.png` 等の既存画像
- `src/app/_features/BlogPostDetail/renderToc.ts` のロジックは破棄、Astro `headings` API + 新 `scripts/toc.ts` で再実装

## デザイン

`テックブログ作成/Mt Stupid *.html` を正とする。

- ブランド: "Mt. Stupid — notes from the peak of my own confidence"(Dunning-Kruger メタファー)
- 世界観: 紙のノート / 地図 / 等高線 / 手書き
- フォント: **Fraunces**(セリフ・本文)/ **JetBrains Mono**(モノ)/ **Caveat**(手書き)/ **Inter**(UI)
- パレット: **arsenal 固定**(切替 UI なし)。light/dark のみ可変
- イースターエッグ: ナビ右の `N5 · NN POSTS · COYG`、フッター `"Victory through harmony"`、フッターに常時 COYG リンク
- 不採用(MVP):他パレット(blueprint / terminal / rice / moleskine / sunset / classic)、密度切替(compact/cozy)、フォントサイズ可変、reads/words 統計、slides ページ、Work の Graveyard セクション

## ディレクトリ構成

```
src/
  content/
    config.ts                  # Content Collections schema (zod)
    blog/                      # *.md 記事
      _assets/<slug>/*.png     # 記事に紐づく画像
    portfolio/
      experience.ts            # 既存 _data/ から移植
      skills.ts
      projects.ts
      contact.ts
      types.ts
      index.ts
  layouts/
    BaseLayout.astro
    ArticleLayout.astro
  components/
    Nav.astro
    Footer.astro
    BrandMark.astro
    ThemeToggle.tsx            # 唯一の React island
    BlogCardHero.astro
    BlogCardPickup.astro
    BlogCardArchive.astro
    BlogCardRelated.astro
    TagPill.astro
    TableOfContents.astro
    ArticleCover.astro
    Pagination.astro
    SectionHead.astro
  pages/
    index.astro                # Top
    about.astro
    work.astro
    tags/
      index.astro
      [tag].astro
    blog/
      index.astro
      page/[page].astro
      [slug].astro
    rss.xml.ts
  styles/
    theme.css                  # arsenal palette + base
    article.css                # 記事本文
  scripts/
    toc.ts                     # vanilla JS: TOC 追従 + 進捗バー
public/
  images/                      # 既存画像 + 共通画像
```

## コンテンツモデル

### blog コレクション

ファイル命名: `YYYY-MM-DD-slug.md`(URL は slug 部分のみ、frontmatter で上書き可能)。

```ts
const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    thumbnail: image().optional(),
    featured: z.boolean().default(false),
    pickupBadge: z.enum(['top', 'editor']).optional(),
    coverTitle: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
```

### 本文の規約

- 見出しは `##` から開始(`#` はタイトル扱いで本文には書かない)
- `rehype-slug` で見出しに `id` 自動付与
- コードブロックは Shiki(`vitesse-dark`)
- 記事画像は `src/content/blog/_assets/<slug>/` に配置(Astro が最適化)、サイト共通画像は `public/images/`
- MDX は MVP では採用しない(必要になったら `@astrojs/mdx` を追加)

### tags(派生)

- タグマスタは持たない。`getCollection('blog')` から動的集計
- `/tags/` は集計結果のグループ + Top 10 出現頻度
- `/tags/[tag]/` は `getStaticPaths()` で全タグ列挙
- デザインの "BY GROUP" は MVP 範囲外(タグマスタが必要なため後回し)

### portfolio

`src/content/portfolio/` 直下の TypeScript モジュール。Astro ページから `import` して描画。Content Collection ではなく素の TS。型は現行 `_data/types.ts` を踏襲。

### 派生ロジック

- **Hero(Latest)**: `draft: false` 全記事から `publishedAt` 降順で先頭 1 件
- **Pickups**: `featured: true` から `publishedAt` 降順で最大 4 件、不足分は archive 直近で埋める
- **Archive(Top の Recent)**: 直近 6 件 + `all NN posts →`
- **Related**: 同タグ最多順 → `publishedAt` 降順で 3 件、0 件なら非表示

## ルーティング

| パス | 役割 | 生成 |
|---|---|---|
| `/` | Top | static |
| `/blog/` | 一覧 1 ページ目 | `getStaticPaths` |
| `/blog/page/[page]/` | 一覧 2 ページ目以降 | `getStaticPaths` |
| `/blog/[slug]/` | 記事詳細 | `getStaticPaths` |
| `/about/` | About | static |
| `/work/` | Work(プロジェクト + 経歴 + スキル) | static |
| `/tags/` | タグ一覧 + Top 10 | static |
| `/tags/[tag]/` | タグ別記事一覧 | `getStaticPaths` |
| `/rss.xml` | RSS | endpoint |
| `/sitemap-index.xml` | sitemap | integration |
| `/404` | 404 | static |

- **ページネーション**: 1 ページ 10 件
- **draft**: `import.meta.env.PROD` のときビルドから除外
- **旧 URL リダイレクト**: MVP 範囲外。記事エクスポート(microCMS → md)と同じスプリントで `redirects.json` を生成し、Cloudflare 側で 301 設定

## コンポーネント / レイアウト

### レイアウト階層

```
BaseLayout.astro              ← html/head/body/.paper/Nav/Footer
└─ <slot />
   ├─ index.astro
   ├─ blog/index.astro
   ├─ blog/[slug].astro
   │   └─ ArticleLayout.astro ← cover, 2-col layout, related
   │       └─ <slot />        ← Markdown 本文
   ├─ about.astro / work.astro / tags/*.astro
   └─ 404.astro
```

### コンポーネント一覧

| 名前 | 種別 | 役割 |
|---|---|---|
| `BaseLayout.astro` | layout | head/OGP/nav/footer |
| `ArticleLayout.astro` | layout | 記事ヘッダ/cover/2 カラム/related |
| `Nav.astro` | static | `Astro.url.pathname` で current 判定 |
| `Footer.astro` | static | 固定文言 + COYG |
| `ThemeToggle.tsx` | **React island** (`client:load`) | light/dark トグル + localStorage |
| `BrandMark.astro` | static | 山アイコン SVG |
| `BlogCardHero.astro` | static | Top の Hero |
| `BlogCardPickup.astro` | static | Pickup 4 枚 |
| `BlogCardArchive.astro` | static | 一覧の行 |
| `BlogCardRelated.astro` | static | 記事下 related 3 枚 |
| `TagPill.astro` | static | `#tag` ピル |
| `TableOfContents.astro` | static + vanilla JS | TOC + 進捗 |
| `ArticleCover.astro` | static | 等高線 SVG cover |
| `Pagination.astro` | static | prev/next |
| `SectionHead.astro` | static | LATEST/PICKUPS 等の見出しバー |

### Props 規約

- 各 BlogCard は `CollectionEntry<'blog'>` をそのまま受ける(再パッケージしない)

### TOC

- ArticleLayout は Astro の `entry.render()` 戻り値の `headings` から TOC を生成
- `scripts/toc.ts`(vanilla)でアクティブ追従と進捗バー
- React 不使用

### ThemeToggle / FOUC 防止

- `BaseLayout.astro` の `<head>` に `is:inline` で localStorage 読み出し → `<html>` に `dark` クラスを paint 前に付与
- React island の `ThemeToggle` がクリック時に切替 + 永続化
- パレットは arsenal 固定なので `<html class="pal-arsenal">` を常時付与

### nav 内バッジ

- `ALTITUDE · NN POSTS` ではなく **arsenal 固定の `N5 · NN POSTS · COYG`**
- `NN` は `getCollection('blog')` の件数を埋め込み

## スタイリング

- `src/styles/theme.css`(~150 行想定): arsenal の light を `:root`、dark を `:root.dark` に。他パレット・compact/cozy は削除
- `src/styles/article.css`: ドロップキャップ / pullquote / コードブロック / figure
- コンポーネント固有スタイルは `.astro` の `<style>` 内(scoped)
- Google Fonts: `preconnect` + `display=swap`、必要 weight のみ
- ダーク優先順位: `localStorage > prefers-color-scheme > light`(初期 light)

## デプロイ

- 出力: `output: 'static'`(純 SSG)
- adapter は採用しない。Cloudflare Workers の Static Assets バインディングで `dist/` を直接配信
- `wrangler.toml`:

```toml
name = "mt-stupid-blog"
compatibility_date = "2026-04-25"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

- デプロイ手順: `pnpm build && wrangler deploy`
- 環境変数: 不要(microCMS 撤廃)
- カスタムドメイン: MVP 後、Cloudflare ダッシュボードで設定(spec 上は未定)
- CI: MVP は手動デプロイ。GitHub Actions 化は後続タスク

## 品質 / テスト

- **単体**: Vitest。対象は `scripts/toc.ts`、タグ集計、related 抽出 等の純関数
- **E2E**: MVP では実施しない
- **視覚回帰**: Storybook 削除に伴い無し
- **Lint**: Biome のみ。Markuplint は削除(.astro 非対応)
- **Lefthook**: pre-commit は `biome check` のみに簡素化

## 移行(microCMS → Markdown)

MVP **後** の別スプリント。

- `scripts/migrate-from-microcms.ts` を一度実行
- 全記事を `src/content/blog/<slug>.md` に出力(本文は既存のマークダウン化済みデータを使用)
- frontmatter は title / publishedAt / updatedAt / tags / thumbnail / description を埋める
- 旧 microCMS `id` → 新 slug のマップを `redirects.json` に出力
- Cloudflare Workers 側でリダイレクト設定

## MVP の Done 定義

1. Top / Article / About / Work / Tags / RSS / sitemap がローカルで `astro build` 成功
2. ダミー 5 記事程度を `src/content/blog/` に置いて全ページの見た目が arsenal palette でデザイン HTML と一致
3. ライト/ダーク切替が FOUC なしで動作
4. TOC 追従・スクロール進捗バー・Related が動作
5. Cloudflare Workers にデプロイ可能(独自ドメインは後)

## 非対応 / 後回しリスト

- 既存 microCMS 記事の移行
- 旧 URL → 新 slug のリダイレクト
- 独自ドメイン設定
- GitHub Actions による自動デプロイ
- slides ページ
- 他パレット切替 UI / 密度切替 / フォントサイズ可変
- reads / words などの統計表示
- Work の Graveyard セクション
- タグの "BY GROUP"(タグマスタ要)
- MDX 採用
- E2E テスト / Storybook 復活

## オープン項目

- カスタムドメイン名
- 独自ドメインを乗せる時期(MVP 後の任意のタイミング)
- microCMS からの記事エクスポート実施タイミング
