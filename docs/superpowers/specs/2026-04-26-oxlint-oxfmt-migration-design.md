# Oxlint + Oxfmt への移行 設計書

- 作成日: 2026-04-26
- 対象: `mt-stupid-blog`（Astro 5 SSG + React islands + Cloudflare Workers）
- 移行元: Biome 1.9.4
- 移行先: Oxlint + Oxfmt（VoidZero 製、Rust 実装）

## 背景

現状、リンター/フォーマッターとして Biome 1.9.4 を採用しているが、エコシステムの将来性および ESLint 互換ルール資産の活用余地を踏まえ、Vite+ ツールチェインの中核である **Oxlint + Oxfmt** に置き換える。

Vite+ パッケージ全部入り（`vite-plus`）ではなく **Oxlint / Oxfmt を直接 devDependencies に追加する構成** を採る。理由は以下:

- Astro 5 SSG プロジェクトのビルドは `astro build`（Astro が内部で Vite を抱える）で完結しており、`vp dev` / `vp build` を併用する必然性がない
- `vp lint` / `vp fmt` を経由する場合と中身は同じ Oxlint/Oxfmt が動くだけで、ラッパー CLI を増やす利得がない
- 依存関係を最小化することで Astro ビルドフローとの干渉リスクを避ける

## 移行の範囲

### 置き換える
- リンター: Biome → Oxlint
- フォーマッター: Biome → Oxfmt
- Lefthook (`lefthook.yml`) の pre-commit フック
- VS Code の推奨拡張・既定フォーマッター設定（任意）

### 触らない
- Astro 本体・Astro 設定（`astro.config.mjs`）
- `astro check`（型・スキーマ検証は引き続きこれが本命）
- Vitest（テストランナー）
- `tsconfig.json`
- Wrangler / デプロイフロー
- `src/styles/theme.css` ベースの CSS スタイリング方針

## 構成変更（Before / After）

### 削除

- `package.json`
  - `devDependencies`: `@biomejs/biome`
  - `scripts`: `biome:check`, `biome:format`
- `biome.json`
- `.biomeignore`

### 追加

- `package.json`
  - `devDependencies`: `oxlint`, `oxfmt`, `eslint-plugin-astro`, `astro-eslint-parser`
  - `scripts`:
    - `lint`: `oxlint`
    - `lint:fix`: `oxlint --fix`
    - `format`: `oxfmt`
    - `format:check`: `oxfmt --check`
- `.oxlintrc.json`（Oxlint 設定）
- Oxfmt 設定（`.oxfmtrc.json` もしくは `package.json` 内 `oxfmt` フィールド。実装フェーズで Oxfmt の推奨形式に合わせる）

### 更新

- `lefthook.yml`: Biome 用フック → Oxlint + Oxfmt 用フックに差し替え（`astro check` フックは継続）
- `.vscode/settings.json`（任意）: 既定フォーマッターを Biome 拡張から Oxc 拡張へ
- `CLAUDE.md`: 「Pre-commit」節および「Stack」節の記述を Oxlint/Oxfmt ベースに更新

## フォーマット規約の引き継ぎ

差分の発生を最小化するため、現状の Biome 設定値を完全に踏襲する。

| 項目 | 現状（Biome） | 移行後（Oxfmt / Oxlint） |
|---|---|---|
| インデントスタイル | tab | tab |
| インデント幅 | 2 | 2 |
| 行幅 | 100 | 100 |
| クォートスタイル | double | double |
| セミコロン | always | always |
| import 並び替え | `organizeImports: enabled` | Oxlint の `sort-imports` 系ルールで代替 |
| 対象ディレクトリ | `src` 配下 | `src` 配下 |
| 除外パス | `dist`, `.astro`, `node_modules`, `テックブログ作成`, `*.html` | 同等の ignore パターンを `.oxlintrc.json` / Oxfmt 設定に移植 |

## `.astro` ファイル対応の方針

Oxlint は ESLint v9+ プラグインを `jsPlugins` 経由で動かせるため、`eslint-plugin-astro` + `astro-eslint-parser` の組み合わせで `.astro` ファイルの lint が動作する **可能性がある**（公式ドキュメント上で `.astro` パースの完全動作は明示保証されていない）。

そのため、以下の試行プロトコルで段階的に判定する。

### 試行プロトコル

1. `eslint-plugin-astro` および `astro-eslint-parser` を devDependencies に追加
2. `.oxlintrc.json` の `jsPlugins` に astro プラグインを設定し、`overrides` で `*.astro` 向けルールを定義
3. リポジトリ内の代表的な `.astro` ファイル（例: `src/layouts/BaseLayout.astro`、`src/pages/index.astro`）に対して `pnpm oxlint <path>` を実行
4. 正常にパース・lint される → 本対応として `.astro` を lint 対象に組み込む（lefthook の glob にも `astro` を含める）
5. パースエラーや誤検知が解決不能な場合 → astro 関連の依存と設定を **削除し**、`.ts/.tsx/.js/.jsx` 限定運用に切替（Biome 時代と同等の範囲）

このフォールバックを取ることで、Astro ファイルの lint がうまく動かなくても移行自体は完了できる。

## Pre-commit (lefthook) 差し替え案

`.astro` 対応が動作した場合の構成:

```yaml
pre-commit:
  parallel: true
  commands:
    oxlint:
      glob: "src/**/*.{ts,tsx,js,jsx,astro}"
      run: pnpm oxlint {staged_files}
    oxfmt:
      glob: "src/**/*.{ts,tsx,js,jsx}"
      run: pnpm oxfmt --check {staged_files}
    astro-check:
      glob: "src/**/*.{astro,ts,tsx}"
      run: pnpm astro check
```

`.astro` 対応をフォールバックする場合は `oxlint` の glob から `,astro` を外す。`oxfmt` は元から `.astro` を対象外。

## 移行検証チェックリスト

実装完了とみなすために必要な検証項目。

- [ ] `pnpm install` 後、新依存（`oxlint`, `oxfmt`, 必要なら `eslint-plugin-astro` / `astro-eslint-parser`）が解決されること
- [ ] `pnpm lint` がエラーなしで完走すること
- [ ] `pnpm format:check` が差分ゼロで完走すること（差分が発生した場合は「フォーマット一括適用」を独立した1コミットとして切る）
- [ ] `pnpm astro check` が通ること
- [ ] `pnpm test` が通ること
- [ ] `pnpm build` が成功すること
- [ ] 意図的にフォーマット崩した変更で `git commit` を試み、lefthook が阻止すること
- [ ] CLAUDE.md の記述が新構成と一致していること

## ロールバック計画

- 移行作業は専用ブランチ（命名例: `chore/migrate-to-oxlint`）で実施し、`develop` には PR 経由で取り込む
- 致命的な問題が後から判明した場合は、PR をマージ後でも該当マージコミットを `git revert` することで全体を元に戻せる構成にする（単一 PR にまとめる）

## スコープ外（やらないこと）

- Vite+ 統合 CLI (`vp`) の導入
- ESLint への移行（Astro 公式推奨ではあるが、本移行のスコープ外）
- Prettier の導入
- 既存記事 Markdown のフォーマット変更
- `テックブログ作成/` 配下（デザイン正本・編集禁止）への対応

## 未確定事項（実装時に確認）

- Oxfmt の設定ファイル形式（`.oxfmtrc.json` か `package.json` 内フィールドか）— 実装フェーズで Oxfmt の最新ドキュメントに合わせて確定
- `eslint-plugin-astro` の jsPlugins 経由動作可否 — 試行プロトコルの 3〜4 ステップで判定
- VS Code 推奨拡張の更新可否 — 既存 `.vscode/extensions.json` の有無を確認のうえ判断
