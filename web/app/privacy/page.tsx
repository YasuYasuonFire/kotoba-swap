export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">プライバシー</h1>

        <div className="mt-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
          <section className="grid gap-2">
            <h2 className="text-base font-semibold">保存について</h2>
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              本アプリは、変換履歴を <b>端末内の localStorage</b> に保存します。
              サーバー側のデータベースには保存しません。
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold">LLM API について</h2>
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              環境変数 <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-900">
                OPENAI_API_KEY
              </code>{" "}
              を設定した場合、入力文は変換のため外部API（OpenAI）に送信されます。
              キー未設定の場合は、簡易的なローカル変換（フォールバック）で動作します。
            </p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-base font-semibold">入力する内容の注意</h2>
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              個人情報・機密情報（顧客名、社内秘の数値、認証情報など）は入力しないでください。
            </p>
          </section>

          <div className="pt-2">
            <a
              className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              href="/"
            >
              ← 戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


