"use client";

import { useEffect, useMemo, useState } from "react";
import type { HistoryItem } from "@/components/HistoryPanel";

type Style = "前向き";

function clampText(input: string) {
  return input.trim().slice(0, 800);
}

async function postConvert(params: { text: string; style: Style }) {
  const res = await fetch("/api/convert", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });
  const json = (await res.json()) as
    | { ok: true; converted: string; alternatives: string[]; used: "openai" | "fallback" }
    | { ok: false; error: string };

  if (!res.ok || !json.ok) {
    throw new Error("error" in json ? json.error : "変換に失敗しました");
  }
  return json;
}

export function ConvertForm({
  seedDraft,
  onConverted,
}: {
  seedDraft: string;
  onConverted: (item: HistoryItem) => void;
}) {
  const [text, setText] = useState<string>("");
  const [style] = useState<Style>("前向き");
  const [converted, setConverted] = useState<string>("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [used, setUsed] = useState<"openai" | "fallback" | "">("");

  const seeded = useMemo(() => clampText(seedDraft || ""), [seedDraft]);

  useEffect(() => {
    // 初期入力だけ自動セット（ユーザーが入力し始めた後は上書きしない）
    if (!seeded) return;
    setText((prev) => (prev ? prev : seeded));
  }, [seeded]);

  async function onSubmit() {
    const payload = clampText(text);
    if (!payload) {
      setStatus("error");
      setError("変換したい文を入力してください。");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const result = await postConvert({ text: payload, style });
      setConverted(result.converted);
      setAlternatives(result.alternatives);
      setUsed(result.used);
      setStatus("idle");

      onConverted({
        id: crypto.randomUUID(),
        from: payload,
        to: result.converted,
        createdAt: Date.now(),
      });
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "変換に失敗しました");
    }
  }

  async function copy(s: string) {
    await navigator.clipboard.writeText(s);
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        あなたの日常を入力
      </h3>

      <div className="space-y-4">
        <textarea
          className="showa-heisei-input w-full min-h-[120px] p-4 resize-none"
          placeholder="例: 食べて飲んでばっかりだわ..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSubmit}
            disabled={status === "loading"}
            className="showa-heisei-button px-6 py-3 font-medium"
          >
            {status === "loading" ? "変換中..." : "ポジ変換"}
          </button>
        </div>

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {converted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-2">変換結果</div>
            <div className="text-lg leading-relaxed mb-3">
              {converted}
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => copy(converted)}
                className="showa-heisei-button py-2 px-4 text-sm font-medium"
              >
                コピー
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


