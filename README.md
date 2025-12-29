# コトバスワップ (Kotoba Swap)

年末年始の自虐的な日常をポジティブな表現に変換するWebアプリケーションです。

## 🎯 概要

「コトバスワップ」は、ネガティブな日常の独白を、前向きで共感を呼ぶ表現に変換するサービスです。
スワイプ操作で楽しく変換結果を選べるインタラクティブなUIと、SNSでシェアしたくなる機能が特徴です。

## ✨ 主な機能

### 🔄 変換機能
- ネガティブな日常をポジティブな表現に自動変換
- スワイプ操作で24個の定型フレーズを閲覧
- AI（Claude API）による自由入力変換
- 複数の変換候補を提示

### 🎨 バズる要素（NEW!）
- **ドラマチックなアニメーション**: Framer Motionによる美しい変換演出
- **バイラルコピー機能**: コピー時に自動的にハッシュタグとURLを追加
- **AI画像生成**: Gemini Nano Bananaで変換結果をInstagram/TikTok最適サイズの画像に変換
- **シェア最適化**: SNSに投稿しやすいデザイン

### 📱 その他
- 変換履歴の保存と再利用（ローカルストレージ）
- レスポンシブデザイン対応
- プライバシー重視（サーバーにデータ保存なし）

## 🚀 技術スタック

- **フレームワーク**: Next.js 16.1.1 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **AI**:
  - Claude API (Anthropic) - テキスト変換
  - Gemini API (Google) - Nano Banana画像生成
- **アニメーション**: Framer Motion
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

```bash
# Claude API Key (テキスト変換用 - 必須)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Gemini API Key (画像生成用 - 必須)
GEMINI_API_KEY=your_gemini_api_key_here

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=コトバスワップ
NEXT_PUBLIC_APP_DESCRIPTION=年末年始の日常をポジティブに変換
```

#### API Keyの取得方法

**Claude API Key:**
1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. API Keysページで新しいキーを作成

**Gemini API Key:**
1. [Google AI Studio](https://ai.google.dev/) にアクセス
2. Get API Keyをクリックして新しいキーを作成

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

