# Threads 金融教育 SNS 運用ボット

Threads向け金融教育コンテンツの**半自動運用ツール**です。
テーマを登録するだけで、Claude AIが3パターンの投稿案を自動生成します。

---

## ディレクトリ構成

```
threads-finance-bot/
├── src/
│   ├── app/
│   │   ├── api/              # APIルート（バックエンド）
│   │   │   ├── generate/     # AI投稿生成
│   │   │   ├── history/      # 投稿履歴
│   │   │   ├── posts/        # 投稿候補のCRUD
│   │   │   ├── seed/         # サンプルデータ投入
│   │   │   ├── stats/        # ダッシュボード統計
│   │   │   └── themes/       # テーマのCRUD
│   │   ├── drafts/           # 投稿候補ページ
│   │   ├── history/          # 投稿履歴ページ
│   │   ├── themes/           # テーマ管理ページ
│   │   └── page.tsx          # ダッシュボード
│   ├── components/
│   │   ├── dashboard/        # 統計カード
│   │   ├── layout/           # サイドバー・ヘッダー
│   │   ├── posts/            # 投稿カード・エディタ
│   │   ├── themes/           # テーマカード・フォーム
│   │   └── ui/               # 汎用UIコンポーネント
│   └── lib/
│       ├── ai.ts             # AI投稿生成ロジック
│       └── db.ts             # SQLiteデータベース操作
├── data/                     # DBファイル（自動生成）
└── .env.local                # 環境変数
```

---

## セットアップ手順

### 0. Node.jsのインストール（未インストールの場合）

```bash
# Homebrewでインストール（推奨）
brew install node

# または公式サイトからインストーラーを入手
# https://nodejs.org/ja/download
```

インストール確認：
```bash
node -v   # v18以上を推奨
npm -v
```

### 1. 依存関係のインストール

```bash
cd threads-finance-bot
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて、Anthropic APIキーを設定します：

```
ANTHROPIC_API_KEY=sk-ant-あなたのAPIキー
```

> **APIキーの取得方法：** https://console.anthropic.com/ でアカウントを作成し、API Keysページから取得できます。
>
> ⚠️ **APIキーなしでも動作します。** 未設定の場合はテンプレートベースの投稿生成にフォールバックします。

### 3. 開発サーバーの起動

```bash
npm run dev
```

### 4. ブラウザで開く

http://localhost:3000 にアクセスします。

### 5. サンプルデータの投入（任意）

ダッシュボードの「**サンプルデータ投入**」ボタンをクリックすると、テーマ5件・サンプル投稿・履歴が追加されます。

---

## 使い方

### 基本的な流れ

```
テーマを追加 → 投稿を生成（3パターン）→ 確認・編集 → 承認 → Threadsに投稿 → 「投稿済み」に変更 → 反応を記録
```

### 1. テーマ管理（/themes）

- 「+ テーマを追加」でテーマを登録
- カテゴリ・優先度を設定
- 「投稿を生成」ボタンでAIが3パターン作成

### 2. 投稿候補（/drafts）

- 生成された投稿を確認・編集
- `下書き → 承認済み → 投稿済み` の順でステータスを進める
- 「コピー」ボタンでThreadsに貼り付け可能

### 3. 投稿履歴（/history）

- 投稿済みコンテンツの一覧
- 「反応を記録」でいいね数・返信数・メモ・改善案を保存

---

## データベース

SQLiteファイルは `data/database.sqlite` に自動生成されます。

テーブル構成：
- `themes` - テーマ（名前・カテゴリ・優先度・使用回数）
- `posts` - 投稿候補（本文・CTA・ハッシュタグ・ステータス）
- `post_history` - 投稿履歴（いいね数・返信数・メモ）

---

## カスタマイズ

### AI生成のプロンプトを変更する

`src/lib/ai.ts` の `prompt` 変数を編集してください。
トーンや文章スタイルを自分好みに調整できます。

### カテゴリを追加する

`src/components/themes/ThemeForm.tsx` の `CATEGORIES` 配列に追加します。

### ポート番号を変更する

```bash
npm run dev -- -p 3001
```

---

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 14 | フレームワーク（App Router） |
| Tailwind CSS | スタイリング |
| better-sqlite3 | ローカルDBファイル |
| @anthropic-ai/sdk | Claude AI APIクライアント |
| TypeScript | 型安全性 |
