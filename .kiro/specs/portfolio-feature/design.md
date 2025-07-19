# Design Document

## Overview

技術ブログをメインとしたサイトに、補助的なポートフォリオ機能を追加します。TOPページは簡潔なAboutセクションと新着記事の表示を中心とし、ヘッダーナビゲーションから詳細なポートフォリオページにアクセスできる構成にします。技術記事の発信が主目的で、ポートフォリオは開発者の背景を補完する役割を担います。

## Architecture

### 全体アーキテクチャ

```
src/app/
├── (defaultRoot)/
│   ├── portfolio/           # 新規: ポートフォリオページ
│   │   └── page.tsx
│   └── page.tsx            # 修正: TOPページ（技術ブログメイン）
├── _features/
│   ├── Home/
│   │   ├── About/          # 修正: 簡潔なAboutセクション
│   │   ├── BlogPostList/   # 既存: 新着記事表示
│   │   └── ...
│   ├── Header/             # 修正: ナビゲーション追加
│   └── Portfolio/          # 新規: 補助的ポートフォリオ機能
│       ├── SkillsSection/
│       ├── ProjectsSection/
│       └── ExperienceSection/
├── _data/                  # 新規: 静的データ管理
│   ├── portfolio.ts
│   ├── projects.ts
│   ├── skills.ts
│   └── experience.ts
└── _libs/
    └── microcms/          # 既存: 技術記事管理（メイン機能）
```

### データ管理戦略

- **ポートフォリオデータ**: TypeScriptファイルで静的管理
- **技術記事**: 既存のmicroCMS管理を継続
- **関連性マッピング**: 静的データ内でプロジェクトと記事のIDを関連付け

## Components and Interfaces

### 1. データ型定義

```typescript
// src/app/_data/types.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  images: string[];
  demoUrl?: string;
  githubUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'completed' | 'in-progress' | 'planned';
  relatedArticleIds: string[]; // microCMS記事IDとの関連付け
  challenges: string[];
  learnings: string[];
  category: 'web' | 'mobile' | 'backend' | 'tool' | 'other';
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'tool' | 'other';
  level: 1 | 2 | 3 | 4 | 5; // 1: 初心者, 5: エキスパート
  yearsOfExperience: number;
  certifications?: string[];
  relatedProjectIds: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface ContactInfo {
  email?: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    qiita?: string;
    linkedin?: string;
  };
}
```

### 2. ポートフォリオページコンポーネント

```typescript
// src/app/_features/Portfolio/PortfolioUI.tsx
interface PortfolioUIProps {
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  contact: ContactInfo;
}
```

### 3. プロジェクト関連コンポーネント

```typescript
// src/app/_features/Portfolio/ProjectList/ProjectListUI.tsx
interface ProjectListUIProps {
  projects: Project[];
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

// src/app/_features/Portfolio/ProjectDetail/ProjectDetailUI.tsx
interface ProjectDetailUIProps {
  project: Project;
  relatedArticles: BlogPost[];
}
```

### 4. スキルセクションコンポーネント

```typescript
// src/app/_features/Portfolio/SkillsSection/SkillsSectionUI.tsx
interface SkillsSectionUIProps {
  skills: Skill[];
  groupByCategory: boolean;
  onSkillClick: (skillId: string) => void;
}
```

## Data Models

### 静的データファイル構造

```typescript
// src/app/_data/projects.ts
export const projects: Project[] = [
  {
    id: 'project-1',
    title: 'Mt.STUPID Tech Blog',
    description: 'Next.js + microCMSで構築した技術ブログ',
    longDescription: '...',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'microCMS'],
    images: ['/images/projects/blog-1.png'],
    githubUrl: 'https://github.com/...',
    demoUrl: 'https://...',
    startDate: '2024-01-01',
    status: 'completed',
    relatedArticleIds: ['blog-post-1', 'blog-post-2'],
    challenges: ['SEO最適化', 'レスポンシブデザイン'],
    learnings: ['Next.js 15の新機能', 'microCMS連携'],
    category: 'web'
  }
  // ... 他のプロジェクト
];

// src/app/_data/skills.ts
export const skills: Skill[] = [
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    level: 4,
    yearsOfExperience: 3,
    relatedProjectIds: ['project-1', 'project-2']
  }
  // ... 他のスキル
];
```

### 関連記事取得ロジック

```typescript
// src/app/_utils/portfolioUtils.ts
export async function getRelatedArticles(projectId: string): Promise<BlogPost[]> {
  const project = projects.find(p => p.id === projectId);
  if (!project || !project.relatedArticleIds.length) return [];
  
  // microCMSから関連記事を取得
  const articles = await Promise.all(
    project.relatedArticleIds.map(id => 
      client.get({ endpoint: 'blogs', contentId: id })
    )
  );
  
  return articles.filter(Boolean);
}
```

## Error Handling

### エラー処理戦略

1. **データ取得エラー**
   - 静的データの読み込み失敗時のフォールバック
   - microCMS API呼び出し失敗時の適切なエラー表示

2. **画像読み込みエラー**
   - プロジェクト画像の読み込み失敗時のプレースホルダー表示
   - img要素のonErrorハンドリング

3. **ナビゲーションエラー**
   - 存在しないプロジェクトIDへのアクセス時の404処理
   - 不正なルートパラメータの処理

```typescript
// src/app/_utils/errorHandling.ts
export function handleDataError(error: Error, fallbackData: any) {
  console.error('Data loading error:', error);
  return fallbackData;
}

export function validateProjectId(id: string): boolean {
  return projects.some(project => project.id === id);
}
```

## Testing Strategy

### テスト方針

1. **ユニットテスト**
   - データ変換ユーティリティ関数のテスト
   - コンポーネントの個別機能テスト
   - 関連記事取得ロジックのテスト

2. **統合テスト**
   - ポートフォリオページの全体的な動作テスト
   - プロジェクト詳細ページの表示テスト
   - 技術記事との関連性表示テスト

3. **E2Eテスト**
   - ユーザーフローの完全なテスト
   - レスポンシブデザインの動作確認
   - パフォーマンステスト

```typescript
// src/app/_features/Portfolio/__tests__/Portfolio.test.tsx
describe('Portfolio Feature', () => {
  test('displays all projects correctly', () => {
    // プロジェクト一覧の表示テスト
  });
  
  test('filters projects by category', () => {
    // カテゴリフィルタリングのテスト
  });
  
  test('shows related articles for project', () => {
    // 関連記事表示のテスト
  });
});
```

### パフォーマンス考慮事項

1. **画像最適化**
   - 通常のimg要素を使用（SSG環境のため）
   - 適切なサイズとalt属性の設定
   - 遅延読み込みの実装

2. **データ読み込み最適化**
   - 静的データの効率的な読み込み
   - 必要に応じた遅延読み込み

3. **SEO最適化**
   - メタデータの適切な設定
   - 構造化データの実装

## UI/UX Design Considerations

### デザインシステム

1. **既存デザインとの統合**
   - 現在のブルーグラデーション（#022B92 to #00AEFE）を継承
   - 既存のタイポグラフィとスペーシングを維持

2. **レスポンシブデザイン**
   - モバイルファーストアプローチ
   - Tailwind CSSのブレークポイント活用

3. **アクセシビリティ**
   - 適切なARIAラベルの設定
   - キーボードナビゲーション対応
   - カラーコントラストの確保

### ページレイアウト

#### TOPページ（技術ブログメイン）

```
Home Page Layout:
┌─────────────────────────────────────┐
│ Header                              │
│ - ロゴ/サイト名                      │
│ - ナビゲーション（Blog, Portfolio,   │
│   About, Contact）                  │
├─────────────────────────────────────┤
│ Hero Section (既存)                 │
│ - Mt.STUPID ブランディング           │
│ - TECH BLOG サブタイトル             │
├─────────────────────────────────────┤
│ About Section (簡潔版)              │
│ - プロフィール画像                   │
│ - 簡単な自己紹介（2-3行）            │
│ - SNSリンク（Twitter, GitHub, Qiita）│
├─────────────────────────────────────┤
│ Latest Articles Section             │
│ - 新着記事6件                        │
│ - カードレイアウト                   │
│ - 「もっと見る」リンク               │
├─────────────────────────────────────┤
│ Footer (既存)                       │
└─────────────────────────────────────┘
```

#### ポートフォリオページ（補助的）

```
Portfolio Page Layout:
┌─────────────────────────────────────┐
│ Header (共通)                       │
├─────────────────────────────────────┤
│ Page Title                          │
│ - "Portfolio" タイトル              │
├─────────────────────────────────────┤
│ Skills Section                      │
│ - 技術スキル一覧                     │
│ - シンプルなタグ表示                 │
├─────────────────────────────────────┤
│ Projects Section                    │
│ - 主要プロジェクト3-5件              │
│ - カードレイアウト                   │
│ - 関連記事リンク                     │
├─────────────────────────────────────┤
│ Experience Section                  │
│ - 簡潔な職歴                        │
├─────────────────────────────────────┤
│ Footer (共通)                       │
└─────────────────────────────────────┘
```