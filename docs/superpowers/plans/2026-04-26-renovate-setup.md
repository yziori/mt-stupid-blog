# Renovate 導入 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** mt-stupid-blog に Mend Renovate App を導入し、依存ライブラリの更新を週1（月曜朝 JST）で自動検知 + devDependencies の minor/patch を自動マージするフローを確立する。

**Architecture:** リポジトリ root に `renovate.json` を投入する PR を先にマージし、その後 Mend Renovate GitHub App をインストールして既存設定を読み込ませる（onboarding PR をスキップ）。連動依存はグループ化し、production 依存と major アップデートは手動レビューを残す。

**Tech Stack:** Renovate (Mend GitHub App) / GitHub Actions（既存 CI）/ pnpm 10.33.2 / Node 22+

**Spec:** [`docs/superpowers/specs/2026-04-26-renovate-setup-design.md`](../specs/2026-04-26-renovate-setup-design.md)

---

## ファイル構成

### 作成
- `renovate.json` — Renovate の動作設定（schedule / packageRules / commitMessage*）

### 触らない
- `package.json`、`pnpm-lock.yaml`（直接の依存変更は本プランでは行わない）
- `.github/workflows/ci.yml`（既存 CI のままで Renovate PR をテストできる）
- `astro.config.mjs`、`tsconfig.json`、`src/**`、`docs/**`（既存ドキュメント）

---

## 前提

- 作業ブランチ: `feat/setup-renovate`（develop から分岐済み、設計書 commit `53122ea` を含む）
- パッケージマネージャ: pnpm 固定
- 全タスクの作業ディレクトリ: `/Users/taktadano/ghq/github.com/yziori/mt-stupid-blog`
- 一部のタスクは GitHub UI 操作を伴う（タスク 1, 5）。エージェントが実行できないステップにはその旨を明記する。

---

## Task 1: リポジトリ設定 — Allow auto-merge を有効化

**目的:** Renovate の `platformAutomerge: true` が動作する前提条件を整える。

**Files:**
- 触る: なし（GitHub UI 操作 + API 確認のみ）

- [ ] **Step 1: 現状の auto-merge 設定を確認**

```bash
gh api repos/yziori/mt-stupid-blog --jq '.allow_auto_merge'
```

Expected: `true`（既に有効）または `false`（未有効）

`true` であれば Step 2-3 をスキップし Task 2 へ進む。

- [ ] **Step 2: GitHub UI で Allow auto-merge を有効化**（ユーザー操作）

ブラウザで https://github.com/yziori/mt-stupid-blog/settings を開き、
**Pull Requests** セクションの **Allow auto-merge** チェックボックスを ON にして保存する。

ついでに **Automatically delete head branches** も ON にしておくと、Renovate の更新ブランチが自動削除されて綺麗になる（推奨）。

- [ ] **Step 3: 有効化を再確認**

```bash
gh api repos/yziori/mt-stupid-blog --jq '.allow_auto_merge, .delete_branch_on_merge'
```

Expected:
```
true
true
```

---

## Task 2: `renovate.json` を作成

**目的:** 設計書の構成案を 1 ファイルにまとめて投入する。

**Files:**
- Create: `renovate.json`

- [ ] **Step 1: 現在のブランチを確認**

```bash
git branch --show-current
```

Expected: `feat/setup-renovate`

異なる場合: `git checkout feat/setup-renovate`

- [ ] **Step 2: `renovate.json` を作成**

ファイル: `renovate.json`（リポジトリ root）

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":semanticCommitsDisabled"
  ],
  "timezone": "Asia/Tokyo",
  "schedule": ["before 9am on monday"],
  "labels": ["dependencies"],
  "rangeStrategy": "bump",
  "prConcurrentLimit": 5,
  "prHourlyLimit": 0,
  "commitMessagePrefix": "⬆️ chore:",
  "commitMessageAction": "",
  "commitMessageTopic": "{{depName}}",
  "commitMessageExtra": "を v{{newVersion}} にアップデート",
  "vulnerabilityAlerts": {
    "enabled": true,
    "schedule": []
  },
  "lockFileMaintenance": {
    "enabled": false
  },
  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true,
      "platformAutomerge": true
    },
    {
      "groupName": "astro",
      "matchPackageNames": ["astro", "/^@astrojs\\//"]
    },
    {
      "groupName": "react",
      "matchPackageNames": ["react", "react-dom", "/^@types\\/react/"]
    },
    {
      "groupName": "rehype",
      "matchPackageNames": ["/^rehype-/"]
    },
    {
      "groupName": "github-actions",
      "matchManagers": ["github-actions"]
    }
  ]
}
```

- [ ] **Step 3: Renovate config validator で検証**

```bash
pnpm dlx --package=renovate -- renovate-config-validator renovate.json
```

Expected:
```
INFO: Validating renovate.json
INFO: Config validated successfully
```

エラーが出た場合の対処:
- `matchPackageNames` の正規表現フォーマット（`/.../`）でパースエラー → 該当行を見直し
- `extends` 内のプリセット名タイポ → `config:recommended` / `:semanticCommitsDisabled` を再確認
- `unknown option` 警告 → Renovate のバージョン差分。最新ドキュメント https://docs.renovatebot.com/configuration-options/ で該当オプションの最新名を確認

- [ ] **Step 4: 既存の lefthook フックが落ちないことを確認**

```bash
pnpm lint
pnpm format:check
pnpm astro check
```

Expected: いずれもエラーなしで完走（`renovate.json` は src 配下ではないので oxlint/oxfmt 対象外、astro check も影響なし）

- [ ] **Step 5: コミット**

```bash
git add renovate.json
git commit -m "feat: Renovate 設定ファイルを追加

- 月曜朝 JST 週1 スケジュール
- 連動依存（astro/react/rehype/github-actions）をグループ化
- devDependencies の minor/patch を自動マージ
- vulnerabilityAlerts は即時通知

Refs #58"
```

---

## Task 3: PR を作成し CI を通す

**目的:** 既存 CI のもとで `renovate.json` の追加が問題なくマージできることを確認する。

**Files:**
- 触る: なし

- [ ] **Step 1: ブランチを push**

```bash
git push -u origin feat/setup-renovate
```

Expected: push 成功（既存の develop にはまだマージされていない状態）

- [ ] **Step 2: PR を作成**

```bash
gh pr create --base develop --title "feat: Renovate 自動依存更新の設定を追加" --body "$(cat <<'EOF'
## Summary
- Issue #58 への対応として Renovate の設定ファイルを追加
- Mend Renovate App は本 PR マージ後にインストールする運用
- 設計書: `docs/superpowers/specs/2026-04-26-renovate-setup-design.md`

## 採用方針
- 動作主体: Mend Renovate GitHub App（self-hosted Action は使わない）
- 更新粒度: 1 パッケージ 1 PR + 連動依存（astro/react/rehype/github-actions）はグループ化
- 自動マージ: devDependencies の minor/patch のみ（production 依存と major は手動）
- スケジュール: 週1（月曜朝 JST）+ vulnerabilityAlerts は即時

## Test plan
- [ ] CI（lint/format/astro check/test/build）がグリーン
- [ ] マージ後、Mend Renovate App をインストール（`docs/superpowers/plans/2026-04-26-renovate-setup.md` の Task 5）
- [ ] App インストール後、onboarding PR がスキップされ Dependency Dashboard issue が作成されること
- [ ] 次回スケジュール（月曜朝 JST）で初回更新 PR が出ること
- [ ] グループ化が意図通りに効くこと（astro / react / rehype / github-actions）
- [ ] devDependencies の minor/patch PR で auto-merge が有効になること

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Closes #58
EOF
)"
```

PR URL を控えておく（次のステップで使う）。

- [ ] **Step 3: CI 通過を待つ**

```bash
gh pr checks --watch
```

Expected: `verify` ジョブが green。

失敗した場合:
- `lint` が落ちる → `renovate.json` は `oxlint` の対象外のはず。設定 (`.oxlintrc.json`) と `lefthook.yml` の glob を再確認
- `astro check` が落ちる → 既存コード由来の可能性が高い。develop が壊れていないか確認

---

## Task 4: PR をレビュー・マージ

**目的:** `renovate.json` を develop に取り込み、App インストール前に設定を有効化しておく。

**Files:**
- 触る: なし

- [ ] **Step 1: ユーザーレビュー依頼**（ユーザー操作）

PR URL を共有し、以下の観点でレビューを依頼:
- `commitMessagePrefix` / `commitMessageExtra` のテンプレが既存規約に近いか
- グループ化対象（astro / react / rehype / github-actions）に過不足ないか
- 自動マージ対象（devDependencies の minor/patch）の方針に異論ないか

- [ ] **Step 2: レビュー承認後、develop にマージ**

過去 PR は merge commit と squash が混在しているため、ユーザーの指示に従う。指示がない場合は **squash merge** を既定とする（`renovate.json` 追加 1 ファイルなので履歴を 1 コミットに収めて綺麗）。

```bash
gh pr merge --squash --delete-branch
```

Expected: `develop` に `renovate.json` が取り込まれ、`feat/setup-renovate` ブランチが削除される。

- [ ] **Step 3: ローカルの develop を更新**

```bash
git checkout develop
git pull --ff-only origin develop
git branch -d feat/setup-renovate 2>/dev/null || true
```

---

## Task 5: Mend Renovate App をインストール

**目的:** App をリポジトリにインストールし、`renovate.json` を読み込ませる。既存設定があるため onboarding PR はスキップされる。

**Files:**
- 触る: なし（GitHub UI 操作のみ）

- [ ] **Step 1: Mend Renovate App ページを開く**（ユーザー操作）

ブラウザで https://github.com/apps/renovate を開き、**Configure** をクリック。

- [ ] **Step 2: リポジトリを選択してインストール**（ユーザー操作）

1. アカウント `yziori` を選択（個人アカウント）
2. **Only select repositories** を選び、`mt-stupid-blog` のみをチェック
3. **Install** または **Save** をクリック

`All repositories` を選ぶと `yziori` 配下の他リポジトリにも作用してしまうため、必ず単一指定にする。

- [ ] **Step 3: インストールを確認**

```bash
gh api repos/yziori/mt-stupid-blog/installation --jq '.app_slug'
```

Expected: `renovate`

`Not Found` などが返る場合: App インストールが反映されていない。Step 2 を再確認。

- [ ] **Step 4: Renovate の初回スキャンを待つ（数分）**

App インストール後、Renovate がリポジトリをクローンして設定をパースする。
通常 1〜5 分以内に完了する。

進捗確認: Mend Renovate Dashboard ( https://app.mend.io/ — GitHub 認証でログイン) で `mt-stupid-blog` のジョブログを参照可能。

- [ ] **Step 5: onboarding PR が作成されないことを確認**

```bash
gh pr list --state open --search "Configure Renovate"
```

Expected: 出力が空（既存 `renovate.json` を検知したため onboarding はスキップされる）

万一 onboarding PR (`Configure Renovate`) が作成されていた場合: `renovate.json` が develop に存在することを再確認 (`gh api repos/yziori/mt-stupid-blog/contents/renovate.json --jq '.name'`)。存在するのに onboarding が出るのは Renovate のキャッシュ整合の問題なので、Mend Dashboard から手動で再ジョブ実行する。

- [ ] **Step 6: Dependency Dashboard issue が作成されたことを確認**

```bash
gh issue list --state open --search "Dependency Dashboard in:title"
```

Expected: 「Dependency Dashboard」というタイトルの Issue が 1 件存在する。

中身の確認:
```bash
gh issue view <issue番号>
```

期待される構造:
- 「Awaiting Schedule」: 次回スケジュール（月曜朝 JST）に出る予定の更新候補
- 「Detected dependencies」: 検出された依存一覧（npm / github-actions）

---

## Task 6: 動作検証

**目的:** Renovate が設計書通りに動いていることを確認する。

**Files:**
- 触る: なし

- [ ] **Step 1: Detected dependencies の網羅性を確認**

Task 5 Step 6 で作成された Dependency Dashboard issue 内の **Detected dependencies** セクションを確認。

期待される検出:
- npm (package.json):
  - dependencies: `astro`, `@astrojs/react`, `@astrojs/rss`, `@astrojs/sitemap`, `react`, `react-dom`, `rehype-autolink-headings`, `rehype-slug`
  - devDependencies: `@astrojs/check`, `@types/react`, `@types/react-dom`, `astro-eslint-parser`, `eslint-plugin-astro`, `lefthook`, `oxfmt`, `oxlint`, `typescript`, `vitest`, `wrangler`
- github-actions (.github/workflows/ci.yml):
  - `actions/checkout`, `pnpm/action-setup`, `actions/setup-node`

不足している場合:
- Node バージョン（`engines.node` や workflow の `node-version: 24.15.0`）が出ない場合 → これは npm manager の `engines.node` は監視対象だが、workflow 内 `node-version` 文字列は **custom regex manager** が必要。本プランのスコープ外（後続 Issue で対応）

- [ ] **Step 2: 次回スケジュール（月曜朝 JST）まで待つ、または手動でジョブを起動**

通常運用ではスケジュール (`before 9am on monday`) で動くが、検証のためにすぐ動かしたい場合:

Mend Renovate Dashboard から `mt-stupid-blog` の **Run now** ボタンをクリック（要 GitHub 認証）。

または Dependency Dashboard issue の最下部にある **「Check this box to trigger a request for Renovate to run again on this repository」** チェックボックスを ON にする → 数分で Renovate が再実行される。

- [ ] **Step 3: 初回更新 PR の存在を確認**

```bash
gh pr list --label dependencies
```

Expected: 1 件以上の Renovate PR（更新がある依存に応じて 0〜N 件）。

すべての依存が最新の場合は PR が出ない（正常）。その場合は Step 4-5 をスキップして Step 6 へ。

- [ ] **Step 4: グループ化が効いているか確認**

各 PR を確認し、以下のグループがそれぞれ単一 PR にまとまっているか確認:

```bash
gh pr list --label dependencies --json number,title
```

期待されるグループ化（更新があった場合）:
- `astro` グループ → `astro`, `@astrojs/react`, `@astrojs/rss`, `@astrojs/sitemap` が同一 PR
- `react` グループ → `react`, `react-dom`, `@types/react`, `@types/react-dom` が同一 PR
- `rehype` グループ → `rehype-slug`, `rehype-autolink-headings` が同一 PR
- `github-actions` グループ → `actions/checkout`, `pnpm/action-setup`, `actions/setup-node` が同一 PR

意図通りでない場合: `renovate.json` の `packageRules` の `matchPackageNames` 正規表現を見直す。具体的にパッケージ名がマッチしていない場合は、Renovate のジョブログ（Mend Dashboard）で `matchPackageNames` の評価結果を確認。

- [ ] **Step 5: auto-merge が想定通りに付いているか確認**

devDependencies の minor/patch 更新がある PR を 1 件選び:

```bash
gh pr view <PR番号> --json autoMergeRequest,labels,title
```

Expected: `autoMergeRequest` が `null` でない（auto-merge 有効）。

production 依存（astro / react / rehype-* など）の PR を 1 件選び同じコマンドを実行:

Expected: `autoMergeRequest` が `null`（auto-merge 無効）。

意図通りでない場合: `renovate.json` の最初の `packageRules`（`matchDepTypes: ["devDependencies"]`）の条件と PR 対象パッケージの depType が合っているか、Renovate ジョブログで確認。

- [ ] **Step 6: PR タイトル・コミットメッセージの規約確認**

```bash
gh pr list --label dependencies --json title
```

Expected の例:
- `⬆️ chore: typescript を v6.0.4 にアップデート`（単一）
- `⬆️ chore: astro を v6.2.0 にアップデート`（グループ化された場合は `commitMessageTopic` がグループ名 `astro` に置き換わる）

完全一致しない場合（例: `commitMessageAction` が空でも空白がダブる、`{{newVersion}}` が major のみで `v6` になる等）:
- 軽微な見た目調整は別 PR で `commitMessage*` テンプレを微調整して対応
- `{{newVersion}}` の代わりに `{{newValue}}` や `{{newMajor}}` を試す選択肢を検討
- 完全一致が困難な場合、設計書 `docs/superpowers/specs/2026-04-26-renovate-setup-design.md` の「未確定事項」に記載の通り、`⬆️ chore:` prefix と日本語動詞の出現を最低条件として妥協する

- [ ] **Step 7: vulnerabilityAlerts の動作（実イベント発生時）**

OSS の security advisory が発火したタイミングでのみ検証可能。Renovate がスケジュール外でも即時 PR を作成すること、PR タイトルに `[SECURITY]` プレフィックスが付くことを確認する。

本プランでは検証ステップとして実施せず、運用で観測する。

- [ ] **Step 8: Issue #58 のクローズ確認**

Task 4 Step 2 で `Closes #58` を含めて PR をマージした場合、Issue は自動でクローズされている想定。

```bash
gh issue view 58 --json state
```

Expected: `{"state": "CLOSED"}`

クローズされていない場合:
```bash
gh issue close 58 --comment "Renovate 導入完了。Dependency Dashboard で運用開始。"
```

---

## ロールバック手順

何か致命的な問題が発生した場合の戻し方。

### 自動マージだけ止めたい
`renovate.json` の最初の `packageRules` から `automerge: true` と `platformAutomerge: true` を削除して push。

```bash
git checkout develop
git pull --ff-only origin develop
# renovate.json を編集（automerge 関連を削除）
git add renovate.json
git commit -m "chore: Renovate の auto-merge を一時停止"
git push origin develop
```

### Renovate を一時停止したい
`renovate.json` のトップレベルに `"enabled": false` を入れて push。Renovate は次回ジョブで no-op になる。

### 完全撤去したい
1. App をアンインストール: https://github.com/settings/installations → Renovate → Configure → Uninstall
2. `renovate.json` を削除して push
3. Dependency Dashboard issue を手動でクローズ

---

## 関連 Issue / 検討事項

- 本プランのスコープ外として後続検討:
  - workflow 内 `node-version: 24.15.0` を Renovate で追跡したい場合は、`customManagers`（旧 regexManagers）の設定が必要。別 Issue で対応可
  - Renovate のブランチ命名規則を `chore/upgrade-*` 互換にしたい場合は `branchPrefix` の調整が必要（既定は `renovate/`）。本プランでは触らない
  - `:dependencyDashboardApproval` を入れて、すべての PR を Dashboard 承認後に出すフローにする選択肢（運用が重くなるので現状は採用せず）
