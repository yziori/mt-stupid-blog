# Oxlint + Oxfmt 移行 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biome 1.9.4 をリンター/フォーマッターから外し、Oxlint + Oxfmt（VoidZero製・Rust実装）に置き換える。フォーマット規約は現状を踏襲し、`.astro` 対応は jsPlugins 経由で試行。

**Architecture:** Vite+ 統合 CLI は使わず、`oxlint` と `oxfmt` を直接 devDependencies として導入する。Astro ビルドフローや vitest、`astro check` には触らない。Oxfmt の `--migrate biome` で設定を自動移行する。

**Tech Stack:** Astro 5 SSG / React 19 islands / Cloudflare Workers / pnpm / lefthook / Biome（移行元）/ oxlint + oxfmt（移行先）

**Spec:** [`docs/superpowers/specs/2026-04-26-oxlint-oxfmt-migration-design.md`](../specs/2026-04-26-oxlint-oxfmt-migration-design.md)

---

## ファイル構成

### 作成
- `.oxlintrc.json` — Oxlint 設定（biome.json の linter 設定相当 + ignore 設定）
- `.oxfmtrc.json` — Oxfmt 設定（biome.json の formatter 設定相当）

### 修正
- `package.json` — devDependencies と scripts の差し替え
- `lefthook.yml` — pre-commit フックの差し替え
- `CLAUDE.md` — Pre-commit / Stack 節の表記更新

### 削除
- `biome.json`
- `.biomeignore`

### 触らない
- `astro.config.mjs`、`tsconfig.json`、`vitest.config.ts`、`wrangler.toml`、`src/**`（コード本体）、`docs/**`（既存ドキュメント）

---

## 前提

- 作業ブランチ: `chore/migrate-to-oxlint`（develop から分岐）
- パッケージマネージャ: pnpm 固定
- Node.js: `package.json` 既定（pnpm が解決）
- 全タスクの作業ディレクトリ: `/Users/taktadano/ghq/github.com/yziori/mt-stupid-blog`

---

## Task 1: 作業ブランチ作成とベースライン取得

**目的:** 移行前の正常状態を記録し、ロールバックの起点を作る。

**Files:**
- 触る: なし（コマンドのみ）

- [ ] **Step 1: 現在の develop が clean であることを確認**

```bash
git status
git rev-parse --abbrev-ref HEAD
```

Expected: `On branch develop` / `clean working tree`

- [ ] **Step 2: 作業ブランチを切る**

```bash
git checkout -b chore/migrate-to-oxlint
```

Expected: `Switched to a new branch 'chore/migrate-to-oxlint'`

- [ ] **Step 3: ベースライン検証コマンドを全部走らせる**

```bash
pnpm install
pnpm biome:check
pnpm astro check
pnpm test
pnpm build
```

Expected: 全コマンドが exit 0。失敗があれば移行作業を中止して原因を特定すること（移行作業中の失敗との切り分けが不可能になる）。

- [ ] **Step 4: ベースライン確認のメモ（コミット不要）**

特に新規ファイルは作らない。Step 3 が全部通ったことだけ確認できれば次へ。

---

## Task 2: 新ツール（oxlint, oxfmt）の追加

**目的:** Oxlint と Oxfmt を devDependencies に追加し、CLI が起動することを確認する。

**Files:**
- Modify: `package.json`（pnpm 経由で自動更新）
- Modify: `pnpm-lock.yaml`（pnpm 経由で自動更新）

- [ ] **Step 1: Oxlint と Oxfmt を追加**

```bash
pnpm add -D oxlint oxfmt
```

Expected: `package.json` の devDependencies に `oxlint` と `oxfmt` が追加され、`pnpm-lock.yaml` が更新される。

- [ ] **Step 2: CLI が起動することを確認**

```bash
pnpm oxlint --version
pnpm oxfmt --version
```

Expected: いずれもバージョン番号が表示される（exit 0）。

- [ ] **Step 3: コミット**

```bash
git add package.json pnpm-lock.yaml
git commit -m "📦 deps: add oxlint and oxfmt"
```

---

## Task 3: Oxfmt 設定を Biome から自動移行

**目的:** `oxfmt --migrate biome` で `biome.json` のフォーマット設定を `.oxfmtrc.json` に変換する。

**Files:**
- Create: `.oxfmtrc.json`

- [ ] **Step 1: 自動移行コマンドを実行**

```bash
pnpm oxfmt --migrate biome
```

Expected: カレントディレクトリに `.oxfmtrc.json` が生成される。失敗した場合は Step 3 のフォールバック手順へ。

- [ ] **Step 2: 生成された `.oxfmtrc.json` を確認**

ファイルを開いて、以下の項目が現状の Biome 設定と整合しているか目視確認する。

| 期待値 | Oxfmt キー |
|---|---|
| インデント=tab | `useTabs: true` |
| インデント幅=2 | `tabWidth: 2` |
| 行幅=100 | `printWidth: 100` |
| クォート=double | `singleQuote: false`（または未指定でデフォルト） |
| セミコロン=always | `semi: true`（または未指定でデフォルト） |

不足や差異があれば手で補正する。

- [ ] **Step 3: 自動移行が失敗した場合のフォールバック**

`pnpm oxfmt --migrate biome` がエラーで止まった、またはファイルが生成されなかった場合は手で作成する。

`.oxfmtrc.json`:
```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "useTabs": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": false,
  "semi": true,
  "endOfLine": "lf",
  "ignorePatterns": [
    "dist/**",
    ".astro/**",
    "node_modules/**",
    "テックブログ作成/**",
    "**/*.html",
    "__snapshots__/**"
  ]
}
```

- [ ] **Step 4: `oxfmt --check` を実行して挙動を見る**

```bash
pnpm oxfmt --check src
```

Expected: 「設定が読み込まれた上で、何ファイルが整形対象として認識されたか」のレポートが出る。差分があってもこの段階ではOK（次タスクで解消する）。エラー（設定が読めない等）が出たら Step 3 を見直す。

- [ ] **Step 5: コミット**

```bash
git add .oxfmtrc.json
git commit -m "🔧 chore: add Oxfmt config migrated from biome.json"
```

---

## Task 4: フォーマット差分の一括適用

**目的:** Oxfmt と Biome の整形ルールが完全一致しない場合、整形差分を**1つの独立したコミット**にまとめる。

**Files:**
- Modify: `src/**`（フォーマットのみ）

- [ ] **Step 1: 差分の有無を確認**

```bash
pnpm oxfmt --check src
```

差分なし（`All files are formatted` 等）なら **本タスクは完了。Step 5 へジャンプし、空コミットせず次タスクへ**。

差分あり（`N file(s) would be different` 等）なら次のステップへ。

- [ ] **Step 2: 差分内容を確認**

```bash
pnpm oxfmt --list-different src
```

Expected: 整形対象になるファイル一覧が出る。意図しないファイル（例: `dist/**`、`テックブログ作成/**`）が含まれていたら Task 3 の `ignorePatterns` を見直す。

- [ ] **Step 3: 一括整形を適用**

```bash
pnpm oxfmt src
```

Expected: 該当ファイルが上書きされる。

- [ ] **Step 4: ビルドとテストが壊れていないことを確認**

```bash
pnpm astro check
pnpm test
pnpm build
```

Expected: 全部 exit 0。失敗した場合は `git diff` で整形差分を精査し、`.oxfmtrc.json` の補正が必要か判断する。

- [ ] **Step 5: 整形コミットを単独で切る**

差分があった場合のみ実施:
```bash
git add -A src
git commit -m "🎨 style: reformat with Oxfmt"
```

---

## Task 5: package.json scripts の差し替え

**目的:** `biome:check` / `biome:format` を `lint` 系スクリプトに置き換える。

**Files:**
- Modify: `package.json`（scripts セクション）

- [ ] **Step 1: 現状の scripts を確認**

```bash
grep -A 20 '"scripts"' package.json
```

確認内容: `biome:check` と `biome:format` が存在し、`lint` / `format` 系がないこと。

- [ ] **Step 2: scripts を差し替える**

`package.json` の `scripts` セクションを以下のように編集する。

変更前:
```json
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
}
```

変更後:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "oxlint",
  "lint:fix": "oxlint --fix",
  "format": "oxfmt src",
  "format:check": "oxfmt --check src",
  "deploy": "pnpm build && wrangler deploy"
}
```

- [ ] **Step 3: 新スクリプトが起動することを確認**

```bash
pnpm format:check
```

Expected: exit 0。Task 4 を経ているので差分はないはず。

`pnpm lint` はまだ Task 6 で `.oxlintrc.json` を作る前なのでこの段階では実行しなくてよい（実行すると未設定状態のデフォルトで動く可能性があるが、確認の必要なし）。

- [ ] **Step 4: コミット**

```bash
git add package.json
git commit -m "🔧 chore: replace biome scripts with oxlint/oxfmt scripts"
```

---

## Task 6: Oxlint 設定ファイルの作成

**目的:** `.oxlintrc.json` を作成し、`pnpm lint` が現状のソースコードに対してエラーを出さないことを確認する。

**Files:**
- Create: `.oxlintrc.json`

- [ ] **Step 1: `.oxlintrc.json` を作成する**

`.oxlintrc.json`:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "categories": {
    "correctness": "error",
    "suspicious": "warn"
  },
  "plugins": [
    "typescript",
    "react",
    "import",
    "unicorn",
    "jsx-a11y"
  ],
  "settings": {
    "react": {
      "version": "19"
    }
  },
  "ignorePatterns": [
    "dist",
    ".astro",
    "node_modules",
    "テックブログ作成",
    "**/*.html",
    "__snapshots__"
  ]
}
```

ポイント:
- `categories.correctness: error` で「明確に誤り」のルールをエラー扱い（Biome の `recommended: true` 相当）
- React 19 を明示
- ignore は `.biomeignore` の内容を踏襲

- [ ] **Step 2: `pnpm lint` を実行**

```bash
pnpm lint
```

Expected: 既存コードに対しエラーなしで完走（exit 0）。警告は出てよいが、エラーが出たら以下のいずれかで対処する:
- 既存コードが本当に誤りである → 別コミットで修正
- ルールが厳しすぎる → `.oxlintrc.json` の `rules` セクションで個別に `"off"` に

致命的なルール衝突が解消できない場合は、`categories.correctness` を `"warn"` に下げて移行優先で進める判断もあり（後でチケット化）。

- [ ] **Step 3: コミット**

```bash
git add .oxlintrc.json
git commit -m "🔧 chore: add Oxlint config"
```

---

## Task 7: Lefthook (pre-commit) の差し替え

**目的:** `pnpm biome:check` を `pnpm lint` + `pnpm format:check` に置き換える。`astro check` フックは維持。

**Files:**
- Modify: `lefthook.yml`

- [ ] **Step 1: 現状の lefthook.yml を確認**

```bash
cat lefthook.yml
```

期待内容（変更前）:
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

- [ ] **Step 2: lefthook.yml を書き換える**

変更後:
```yaml
pre-commit:
  parallel: true
  commands:
    oxlint:
      glob: "src/**/*.{ts,tsx,js,jsx}"
      run: pnpm oxlint {staged_files}
    oxfmt:
      glob: "src/**/*.{ts,tsx,js,jsx}"
      run: pnpm oxfmt --check {staged_files}
    astro-check:
      glob: "src/**/*.{astro,ts,tsx}"
      run: pnpm astro check
```

注: この時点では `oxlint` の glob に `astro` を含めない（Task 8 で `.astro` 対応に成功した場合のみ追加する）。

- [ ] **Step 3: 動作確認 — 意図的にフォーマット崩しでコミット試行**

```bash
node -e "const fs=require('fs'); const p='src/lib/posts.ts'; const s=fs.readFileSync(p,'utf8'); fs.writeFileSync(p, 'const   broken   =   1;\n'+s);"
git add src/lib/posts.ts
git commit -m "test: should be blocked"
```

Expected: lefthook が止めること（`oxfmt --check` が差分を検知して非0で終了）。止まったら以下で取り消し:
```bash
git checkout -- src/lib/posts.ts
```

- [ ] **Step 4: 動作確認 — クリーンな変更ならコミットが通ること**

```bash
# 何か小さな整形済みの変更を入れる、または lefthook.yml だけのコミットで検証
git add lefthook.yml
git commit -m "🔧 chore: switch lefthook from biome to oxlint+oxfmt"
```

Expected: lefthook が `oxlint` / `oxfmt` / `astro-check` を実行し、すべて pass してコミット成功。

---

## Task 8: `.astro` 対応の試行（jsPlugins 経由）

**目的:** Oxlint の `jsPlugins` で `eslint-plugin-astro` を動かせるか実機検証し、動けば lint 対象に組み込む。動かなければ素直に外す。

**Files (試行成功時):**
- Modify: `package.json`（devDependencies）
- Modify: `.oxlintrc.json`
- Modify: `lefthook.yml`

**Files (試行失敗時):**
- 何も追加しない / すでに追加していたら revert

- [ ] **Step 1: astro 用 ESLint プラグインとパーサを追加**

```bash
pnpm add -D eslint-plugin-astro astro-eslint-parser
```

- [ ] **Step 2: `.oxlintrc.json` に jsPlugins と overrides を追加**

`.oxlintrc.json` を以下のように更新:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "categories": {
    "correctness": "error",
    "suspicious": "warn"
  },
  "plugins": [
    "typescript",
    "react",
    "import",
    "unicorn",
    "jsx-a11y"
  ],
  "jsPlugins": ["eslint-plugin-astro"],
  "settings": {
    "react": {
      "version": "19"
    }
  },
  "overrides": [
    {
      "files": ["*.astro"],
      "rules": {
        "astro/no-conflict-set-directives": "error",
        "astro/no-unused-define-vars-in-style": "error"
      }
    }
  ],
  "ignorePatterns": [
    "dist",
    ".astro",
    "node_modules",
    "テックブログ作成",
    "**/*.html",
    "__snapshots__"
  ]
}
```

- [ ] **Step 3: 代表的な `.astro` ファイルで実動作テスト**

```bash
pnpm oxlint src/layouts/BaseLayout.astro src/pages/index.astro
```

評価基準:
- **成功:** exit 0 か、出るエラー/警告が「実コード由来の正当な指摘」である（パーサが正しく動いている証拠）
- **失敗:** "parse error" / "unknown extension" / "plugin not loaded" 等、`.astro` を扱えていないことを示すメッセージ

- [ ] **Step 4a: 成功時 — `.astro` を本格対象化**

`lefthook.yml` の `oxlint` glob を更新:
```yaml
    oxlint:
      glob: "src/**/*.{ts,tsx,js,jsx,astro}"
      run: pnpm oxlint {staged_files}
```

`pnpm lint` 全体実行で確認:
```bash
pnpm oxlint src
```

Expected: `.astro` を含めて lint が完走。

コミット:
```bash
git add package.json pnpm-lock.yaml .oxlintrc.json lefthook.yml
git commit -m "✨ feat: enable .astro lint via Oxlint jsPlugins"
```

- [ ] **Step 4b: 失敗時 — `.astro` 試行を撤回**

`.oxlintrc.json` から `jsPlugins` と `overrides`（astro 関連）を削除し、Step 2 直前の状態に戻す。

依存も外す:
```bash
pnpm remove eslint-plugin-astro astro-eslint-parser
```

`lefthook.yml` の `oxlint` glob は `astro` を含めないまま（Task 7 の状態を維持）。

ワーキングツリーが Task 7 終了時点の状態と一致していることを確認:
```bash
git status
```

Expected: 変更なし（Step 1〜2 で入った変更がすべて取り消された状態）。

このタスクで生まれるコミットは無し（fallback の場合）。

---

## Task 9: 旧 Biome 関連の削除

**目的:** `@biomejs/biome` 依存と Biome 設定ファイルを削除し、ツールチェインの二重化を解消する。

**Files:**
- Modify: `package.json`、`pnpm-lock.yaml`
- Delete: `biome.json`、`.biomeignore`

- [ ] **Step 1: Biome 依存を削除**

```bash
pnpm remove @biomejs/biome
```

Expected: `package.json` の devDependencies から `@biomejs/biome` が消え、`pnpm-lock.yaml` が更新される。

- [ ] **Step 2: Biome 設定ファイルを削除**

```bash
rm biome.json .biomeignore
```

- [ ] **Step 3: 残骸がないことを確認**

```bash
grep -r "biome" package.json lefthook.yml CLAUDE.md 2>/dev/null
grep -rn "biomejs" .vscode 2>/dev/null
```

Expected: スクリプト名 / フック / ドキュメントに `biome` が残っていない（CLAUDE.md は次タスクで更新）。

`.vscode/settings.json` や `.vscode/extensions.json` で Biome 拡張を指定している場合は手で消すか、`biomejs.biome` の参照を確認して必要なら更新する（任意）。

- [ ] **Step 4: 全検証コマンド再走**

```bash
pnpm install
pnpm lint
pnpm format:check
pnpm astro check
pnpm test
pnpm build
```

Expected: 全部 exit 0。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "🔥 chore: remove Biome (replaced by Oxlint + Oxfmt)"
```

---

## Task 10: CLAUDE.md の更新

**目的:** プロジェクトルールに Oxlint/Oxfmt の運用を反映する。

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md の現状を確認**

```bash
cat CLAUDE.md
```

確認すべき節:
- "Pre-commit" 節に `pnpm biome:check` への言及がある
- "Stack" / "Commands" / "規約" 節に Biome の言及がある可能性

- [ ] **Step 2: "Pre-commit" 節を書き換える**

変更前:
```
## Pre-commit
Lefthookで `pnpm biome:check` と `pnpm astro check` が走る。`--no-verify` でスキップしないでください。
```

変更後:
```
## Pre-commit
Lefthookで `pnpm lint`（Oxlint）と `pnpm format:check`（Oxfmt）と `pnpm astro check` が走る。`--no-verify` でスキップしないでください。
```

- [ ] **Step 3: 他の節に Biome 言及があれば置換**

`grep -n biome CLAUDE.md` で残存箇所を確認し、Oxlint/Oxfmt に置換する。

- [ ] **Step 4: コミット**

```bash
git add CLAUDE.md
git commit -m "📝 docs: update CLAUDE.md for Oxlint/Oxfmt migration"
```

---

## Task 11: 移行検証チェックリスト全項目の実行

**目的:** スペック §6 の検証項目をすべて実行し、移行完了を確認する。

**Files:**
- 触らない（検証のみ）

- [ ] **Step 1: 依存解決**

```bash
rm -rf node_modules
pnpm install
```

Expected: クリーンインストールが成功。`oxlint` と `oxfmt` が `node_modules/.bin` に入っている。

- [ ] **Step 2: lint 完走**

```bash
pnpm lint
```

Expected: exit 0。

- [ ] **Step 3: format:check 差分ゼロ**

```bash
pnpm format:check
```

Expected: exit 0、`All files are formatted` 相当のメッセージ。

- [ ] **Step 4: 型チェック**

```bash
pnpm astro check
```

Expected: exit 0。

- [ ] **Step 5: テスト**

```bash
pnpm test
```

Expected: exit 0。

- [ ] **Step 6: ビルド**

```bash
pnpm build
```

Expected: exit 0、`dist/` が生成される。

- [ ] **Step 7: lefthook がフォーマット崩しを検知すること**

```bash
node -e "const fs=require('fs'); const p='src/lib/posts.ts'; const s=fs.readFileSync(p,'utf8'); fs.writeFileSync(p, 'const   x   =   1;\n'+s);"
git add src/lib/posts.ts
git commit -m "test: should be blocked"
```

Expected: lefthook が止めること（exit 非0）。

クリーンアップ:
```bash
git checkout -- src/lib/posts.ts
```

- [ ] **Step 8: lefthook がクリーンな変更を通すこと**

これは Task 7 や Task 9 で実コミットを作っているため、改めて実施は不要。Task 11 はここで完了。

---

## Task 12: PR 作成

**目的:** 移行作業を develop に統合する。

**Files:**
- 触らない（PR 作成のみ）

- [ ] **Step 1: コミット履歴を確認**

```bash
git log develop..HEAD --oneline
```

Expected: Task 2〜10 で積まれたコミットが順に並ぶ。

- [ ] **Step 2: リモートに push**

```bash
git push -u origin chore/migrate-to-oxlint
```

- [ ] **Step 3: PR 作成**

```bash
gh pr create --base develop --title "🔧 chore: migrate from Biome to Oxlint + Oxfmt" --body "$(cat <<'EOF'
## Summary
- リンター: Biome → Oxlint
- フォーマッター: Biome → Oxfmt
- Lefthook の pre-commit を差し替え
- フォーマット規約は現状踏襲（タブ/2幅・行幅100・double quote・semi）

## Spec / Plan
- Spec: docs/superpowers/specs/2026-04-26-oxlint-oxfmt-migration-design.md
- Plan: docs/superpowers/plans/2026-04-26-oxlint-oxfmt-migration.md

## .astro 対応
- Task 8 で jsPlugins 経由の試行 → 結果を本欄に追記（成功 or フォールバック）

## Test plan
- [ ] pnpm lint
- [ ] pnpm format:check
- [ ] pnpm astro check
- [ ] pnpm test
- [ ] pnpm build
- [ ] lefthook がフォーマット崩しを止めることを確認
EOF
)"
```

- [ ] **Step 4: PR URL を確認・共有**

PR の URL を控える。マージ後に問題が発覚した場合は、マージコミットを `git revert` することで全戻し可能。

---

## 完了条件

以下すべてが満たされた時点で本プランは完了:

1. `chore/migrate-to-oxlint` ブランチ上で Task 1〜12 が完走している
2. PR が作成され、`develop` への取り込み準備ができている
3. `pnpm lint` / `pnpm format:check` / `pnpm astro check` / `pnpm test` / `pnpm build` がすべて通る
4. CLAUDE.md と lefthook.yml の表記が新構成と整合している
5. `biome.json`、`.biomeignore`、`@biomejs/biome` 依存がリポジトリから消えている
