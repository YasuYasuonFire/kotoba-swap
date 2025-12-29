「ことばスワップ（言い換え辞典）」：会社員向けの“角が立たない言い換え”ミニアプリです。

- スワイプ（左右）で定型を見て、ワンクリックでコピー
- 入力文を LLM API でポジティブ変換（キー未設定なら簡易フォールバックで動作）
- 変換履歴は端末内 localStorage に保存（サーバー保存しません）

## Getting Started

### セットアップ（ローカル）

1) 依存関係のインストール

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

2) LLM API を使う場合（任意）

- `web/env.example` を参考に、`web/.env.local` を作って `OPENAI_API_KEY` を設定してください。

3) ブラウザで開く

- `http://localhost:3000`

### デプロイ（Vercel想定）

- Vercel に `web/` をプロジェクトとして接続してデプロイ
- 環境変数に `OPENAI_API_KEY`（任意）を設定

### 主なコード

- UI: `app/page.tsx` / `components/*`
- スワイプ辞書データ: `lib/seedPhrases.ts`
- 変換API: `app/api/convert/route.ts`
- プライバシー: `app/privacy/page.tsx`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
