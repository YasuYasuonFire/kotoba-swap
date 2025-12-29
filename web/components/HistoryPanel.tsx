"use client";

import { useEffect } from "react";

export type HistoryItem = {
  id: string;
  from: string;
  to: string;
  createdAt: number;
};

const STORAGE_KEY = "kotoba-swap:history:v1";

function formatTime(ts: number) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

export function HistoryPanel({
  history,
  setHistory,
}: {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}) {
  useEffect(() => {
    // 初回ロード：localStorage から復元
    if (history.length) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (Array.isArray(parsed)) setHistory(parsed.slice(0, 50));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 保存
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore
    }
  }, [history]);

  async function copy(s: string) {
    await navigator.clipboard.writeText(s);
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">履歴（端末内）</h2>
        <button
          type="button"
          onClick={() => setHistory([])}
          className="text-xs text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          クリア
        </button>
      </div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        変換結果は端末の localStorage に保存します（サーバー保存しません）。
      </p>

      {history.length === 0 ? (
        <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-3 text-sm text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800">
          まだ履歴がありません。上で変換するとここに残ります。
        </div>
      ) : (
        <ul className="mt-3 grid gap-2">
          {history.slice(0, 20).map((h) => (
            <li
              key={h.id}
              className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-zinc-500">{formatTime(h.createdAt)}</div>
                {h.to ? (
                  <button
                    type="button"
                    className="text-xs text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    onClick={() => copy(h.to)}
                  >
                    コピー
                  </button>
                ) : null}
              </div>

              <div className="mt-2 grid gap-2 text-sm leading-7">
                <div>
                  <div className="text-xs font-semibold text-zinc-500">元</div>
                  <div className="whitespace-pre-wrap">{h.from}</div>
                </div>
                {h.to ? (
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">変換</div>
                    <div className="whitespace-pre-wrap">{h.to}</div>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


