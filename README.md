# コトバスワップ (Kotoba Swap)

年末年始の挨拶をカジュアルな表現に変換するWebアプリケーションです。

## 🎯 概要

「コトバスワップ」は、堅苦しい年末年始の挨拶を、親しみやすくカジュアルな表現に変換するサービスです。
スワイプ操作で楽しく変換結果を選べるインタラクティブなUIが特徴です。

## ✨ 主な機能

- 年末年始の挨拶文をカジュアルな表現に変換
- スワイプ操作で複数の変換候補から選択
- 変換履歴の保存と再利用
- レスポンシブデザイン対応

## 🚀 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Claude API (Anthropic)
- **デプロイ**: Vercel

## 📦 セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn

### インストール

```bash
cd web
npm install
```

### 環境変数の設定

`web/.env.local` ファイルを作成し、以下の環境変数を設定してください：

```
# Claude API Key (必須)
ANTHROPIC_API_KEY=your_api_key_here

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=コトバスワップ
NEXT_PUBLIC_APP_DESCRIPTION=年末年始の挨拶をカジュアルに変換
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📁 プロジェクト構成

```
yearend2025/
├── ideas/              # 企画・仕様書
│   ├── brainstorm_2025-12-29.txt
│   ├── mvp_spec_kotoba_swap_2025-12-29.txt
│   └── score_sheet.csv
└── web/                # Webアプリケーション
    ├── app/            # Next.js App Router
    ├── components/     # Reactコンポーネント
    └── lib/            # ユーティリティ関数
```

## 🎨 主要コンポーネント

- `ConvertForm`: 変換フォーム
- `SwipeDeck`: スワイプ可能なカード表示
- `HistoryPanel`: 変換履歴パネル
- `Mascot`: マスコットキャラクター

## 📝 ライセンス

MIT License

## 👤 作成者

yasuyasu

