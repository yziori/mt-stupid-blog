# Renovate 導入 設計書

- 作成日: 2026-04-26
- 対象: `mt-stupid-blog`（Astro 6 SSG + React islands + Cloudflare Workers）
- 関連 Issue: [#58 renovote設定](https://github.com/yziori/mt-stupid-blog/issues/58)
- 採用ツール: [Renovate](https://docs.renovatebot.com/)（Mend Renovate GitHub App）

## 背景

現状、依存ライブラリの更新はすべて手動で実施している。直近の履歴を見ても以下のように 1 ライブラリ 1 ブランチで地道にアップデートしている。

- `chore/upgrade-typescript-v6` (typescript 5 → 6)
- `chore/upgrade-astro-v6` (astro 5 → 6, @astrojs/react 4 → 5)
- `chore/upgrade-vitest-v4` (vitest 3 → 4)

この運用は安全性が高い反面、

- 新しいリリースの検知が手動 (`npm outdated` を都度実行)
- 連動依存（例: `react` + `react-dom` + `@types/react`）を別 PR にしてしまい、整合性レビューが余分に走る
- security 修正の見落としリスク

を抱えている。Renovate を導入して **検知の自動化と連動依存のグループ化** を行いつつ、**重要度の低い devDependencies は自動マージで運用負荷を下げる**。一方で、production 依存（`astro`, `react`, `@astrojs/*`）の更新はこれまで通り人間レビューを残す。

## 採用構成（決定事項）

| 項目 | 採用 | 補足 |
|---|---|---|
| ツール | Renovate | Dependabot より柔軟性が高い |
| 動作主体 | Mend Renovate GitHub App | self-hosted Action は採用しない（運用シンプル優先） |
| 更新粒度 | 1 パッケージ 1 PR を基本とし、**連動依存はグループ化** | 後述 |
| 自動マージ | **devDependencies の minor/patch のみ自動** | production 依存と major は手動 |
| 監視対象 | npm + GitHub Actions + Node バージョン | `lockFileMaintenance` は無効 |
| スケジュール | 週1（月曜朝 JST） | `vulnerabilityAlerts` は即時通知 |
| コミット/PR規約 | 既存踏襲（`⬆️ chore: <pkg> を v<ver> にアップデート` 風 / 日本語） | テンプレは onboarding PR で実出力を見て調整 |

## スコープ

### やる
- リポジトリへの Mend Renovate App インストール
- ルートに `renovate.json` を追加（onboarding PR 経由で導入）
- `package.json` の依存（dependencies / devDependencies）の更新監視
- `.github/workflows/*.yml` 内の GitHub Actions バージョン更新監視
- CI の `node-version` および `package.json#engines.node` の更新監視
- 連動依存のグループ化定義
- devDependencies の minor/patch 自動マージ設定（GitHub の auto-merge 機能を利用）
- `vulnerabilityAlerts` 即時 PR の有効化

### やらない（スコープ外）
- self-hosted Renovate Action での運用
- `lockFileMaintenance`（推移依存だけを毎週まとめて更新する PR）— ノイズ増加に対する利得が薄いため
- prerelease（`-beta` / `-rc` 等）バージョンの追跡
- 記事 Markdown のフロントマター `tags` 等のスキーマ更新
- production 依存（`astro`, `react`, `@astrojs/*`, `rehype-*` 等）の自動マージ
- major アップデートの自動マージ（devDependencies であっても手動）
- `テックブログ作成/` 配下（デザイン正本・編集禁止）への対応

## 連動依存グループの定義

`renovate.json` の `packageRules` で以下のグループを定義する。狙いは「同時にバージョンを揃えないと壊れる依存」と「単独 PR にしてもレビューに付加情報が乗らない群」をまとめること。

| グループ名 | マッチ対象 | 理由 |
|---|---|---|
| `astro` | `astro`, `@astrojs/*` | astro 本体と公式 integration はバージョン整合が前提（v5→v6 移行時に痛感した） |
| `react` | `react`, `react-dom`, `@types/react`, `@types/react-dom` | 本体と型定義はバージョン乖離を避ける |
| `rehype` | `rehype-*`（`rehype-slug`, `rehype-autolink-headings` 等） | Markdown レンダリングパイプラインの整合 |
| `github-actions` | `manager: github-actions` 配下すべて | Actions のバージョン更新は CI 設定だけ動くので 1 PR にまとめてよい |

`@types/*` 系全般のグループ化は astro/react ほど整合性要件が強くないため、上記以外は **既定の 1 パッケージ 1 PR** とする。

## 自動マージの方針

- 対象: **devDependencies の minor/patch のみ**
- 実装: `automerge: true` + `platformAutomerge: true`
  - `platformAutomerge` は GitHub の auto-merge 機能を利用する。Renovate が PR 作成時に auto-merge を有効化し、CI 通過後に GitHub 側がマージする。Renovate 自身が rebase ループする方式より、CI キャッシュ・ログが GitHub 側に残る点で扱いやすい
- 前提条件:
  - リポジトリ設定で **Allow auto-merge** が有効化されていること（Settings → General → Pull Requests）
  - `develop` ブランチに branch protection を設定する場合、必要なステータスチェック（CI の `verify` ジョブ）を通過要件にしておく
- production 依存（`dependencies`）の minor/patch は自動マージ**しない**。意図せずビルドが壊れた場合の影響範囲が広いため、人間レビューを残す
- major アップデートはすべて手動マージ（devDependencies 含む）

## `renovate.json` 構成案

実装フェーズで onboarding PR を経由して以下の方針で投入する。値は最終的に Renovate のテンプレ展開結果を見て微調整する余地がある。

```jsonc
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

  "lockFileMaintenance": { "enabled": false },

  "packageRules": [
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true,
      "platformAutomerge": true
    },
    {
      "groupName": "astro",
      "matchPackageNames": ["astro"],
      "matchPackagePatterns": ["^@astrojs/"]
    },
    {
      "groupName": "react",
      "matchPackageNames": ["react", "react-dom"],
      "matchPackagePatterns": ["^@types/react"]
    },
    {
      "groupName": "rehype",
      "matchPackagePatterns": ["^rehype-"]
    },
    {
      "groupName": "github-actions",
      "matchManagers": ["github-actions"]
    }
  ]
}
```

### 設計判断メモ

- `:semanticCommitsDisabled` を入れて Renovate のセマンティックコミット (`chore(deps): ...`) を抑止し、こちらの `commitMessagePrefix` を効かせる
- `commitMessage*` テンプレでは `commitMessageAction` を空にし、`commitMessageTopic = "{{depName}}"` + `commitMessageExtra = "を v{{newVersion}} にアップデート"` で、最終形が `⬆️ chore: typescript を v6.0.4 にアップデート` 程度になることを狙う
  - グループ化された PR は Renovate が `commitMessageTopic` を自動的に `<groupName>` に差し替えるので `⬆️ chore: astro を v... にアップデート` 形式になる
  - 完全な見た目調整は onboarding PR で実出力を見て微調整する（後述「未確定事項」）
- `prConcurrentLimit: 5` で並行 PR を抑える（個人ブログ規模で十分）。`prHourlyLimit: 0` は時間単位制限なし
- Renovate v34+ は pnpm をネイティブサポートしているため、`pnpm-lock.yaml` の更新は追加設定なしで動く

## GitHub App セットアップ手順

1. https://github.com/apps/renovate にアクセスし **Configure** をクリック
2. インストール対象として **`yziori/mt-stupid-blog`** のみを選択（個人アカウント全体に広げない）
3. インストール後、Renovate が自動的に `Configure Renovate` という onboarding PR を `renovate/configure` ブランチで作成する
4. その PR にチェックインされる `renovate.json` を、本設計書の構成案で書き換える
5. `pnpm astro check` / `pnpm lint` / `pnpm format:check` / `pnpm test` / `pnpm build` が CI で通ることを確認しマージ
6. マージ後、Renovate がリポジトリを再スキャンし、対象アップデートがあれば次回スケジュール（月曜朝 JST）に PR を出す

## CI 連携の確認

既存 `.github/workflows/ci.yml` のトリガーは `pull_request:` および `push:` (develop/main) であり、Renovate が作る `renovate/*` ブランチの PR でも問題なく走る。

注意点:

- `pnpm install --frozen-lockfile` を使っているが、Renovate 側で `pnpm-lock.yaml` を自動更新するため問題ない（lock の整合は Renovate 側で取る）
- onboarding PR には `pnpm-lock.yaml` の変更が含まれない場合がある（純粋な `renovate.json` 追加のみのため）。これは想定動作

`branch protection` を develop に新規設定する場合は、必須ステータスチェックとして `verify` ジョブを指定すること（auto-merge の前提）。本設計書の対象範囲外として、必要なら別 Issue で実施。

## リポジトリ側の前提設定

| 設定 | 場所 | 値 |
|---|---|---|
| Allow auto-merge | Settings → General → Pull Requests | ✅ 有効 |
| Automatically delete head branches | Settings → General → Pull Requests | ✅ 有効（推奨） |
| Mend Renovate App | Settings → Integrations | インストール済み |

## 検証チェックリスト

実装完了とみなすために必要な検証項目。

- [ ] Mend Renovate App が `yziori/mt-stupid-blog` にインストールされている
- [ ] onboarding PR (`Configure Renovate`) が作成され、本設計書の構成で `renovate.json` を反映してマージ済み
- [ ] `renovate.json` がリポジトリ root に存在し、`config:recommended` を継承している
- [ ] Renovate Dependency Dashboard Issue が作成されていること（`config:recommended` の効果）
- [ ] 月曜朝の最初の実行で、グループ化が意図通り効いていること
  - 期待: `react` + `react-dom` + `@types/react*` が 1 PR にまとまる
  - 期待: `astro` + `@astrojs/*` が 1 PR にまとまる
- [ ] devDependencies の minor/patch PR で auto-merge が有効になっていること（GitHub の PR 画面で `Auto-merge enabled` バッジが付く）
- [ ] production 依存（例: `astro`）の PR では auto-merge が **付いていない** こと
- [ ] PR タイトルが `⬆️ chore: ...` の prefix で始まり日本語化されていること
- [ ] vulnerability alert が来たケースで、スケジュール外でも即時 PR が作られること（実イベント発生時に確認）
- [ ] CI（lint/format/astro check/test/build）が Renovate PR でグリーンになること

## ロールバック計画

- 影響面を `renovate.json` 1 ファイル + GitHub App インストール状態 に閉じ込めているので戻しやすい
- 完全停止: GitHub App をリポジトリからアンインストール（既存 PR は残る）
- 設定だけ無効化: `renovate.json` に `"enabled": false` を入れて push、もしくはファイル削除
- 部分的な調整（自動マージだけ止めたい等）は `packageRules` 内の `automerge: true` を外すだけで足りる

## 未確定事項（実装時に確認）

- `packageRules` のマッチ記法
  - 本設計書では `matchPackagePatterns` を使った例を載せているが、Renovate の新しい版では `matchPackageNames` の glob/regex 記法（例: `"matchPackageNames": ["astro", "/^@astrojs//"]`）に統一されつつある
  - 実装フェーズで Renovate 最新ドキュメント（[`packageRules`](https://docs.renovatebot.com/configuration-options/#packagerules)）を確認し、deprecation warning が出ない記法に揃える
- `commitMessage*` テンプレートの最終形
  - 単一パッケージ PR / グループ化 PR / lockfile 更新 PR で展開結果が異なるため、onboarding PR がマージされて最初の本物の更新 PR が出たタイミングで実出力を確認し、必要なら微調整する
  - 既存履歴への完全一致が困難な場合は、`⬆️ chore:` prefix と日本語動詞の出現を最低条件として妥協する
- Dependency Dashboard Issue のラベル運用（`config:recommended` のデフォルトに従うか、独自ラベルを足すか）
- 将来 production 依存の major（例: astro v6 → v7）が出た場合の取り扱い
  - 現状の方針では default の 1 PR + 手動レビューで足りる想定。専用の `dependencyDashboardApproval: true` を入れるかは、最初の major PR が来た時に判断
