"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
}: {
  seedDraft: string;
}) {
  const [text, setText] = useState<string>("");
  const [style] = useState<Style>("前向き");
  const [converted, setConverted] = useState<string>("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [used, setUsed] = useState<"openai" | "fallback" | "">("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

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
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "変換に失敗しました");
    }
  }

  // バイラルコピー機能 - ハッシュタグとURLを自動追加
  async function copy(s: string) {
    const viralText = `${s}

#ことばスワップ で私もポジティブになれた✨
あなたも試してみて👉 ${typeof window !== 'undefined' ? window.location.origin : 'https://kotoba-swap.com'}`;

    await navigator.clipboard.writeText(viralText);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }

  // 画像生成機能
  async function generateShareImage() {
    if (!text || !converted) return;

    setGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          beforeText: text,
          afterText: converted,
        }),
      });

      if (!res.ok) {
        throw new Error('画像生成に失敗しました');
      }

      const data = await res.json();

      if (data.success && data.image) {
        // Base64画像をStateにセットして表示
        setGeneratedImageUrl(`data:${data.image.mimeType};base64,${data.image.data}`);
      }
    } catch (e) {
      console.error('Image generation error:', e);
      alert('画像生成に失敗しました。しばらくしてからもう一度お試しください。');
    } finally {
      setGeneratingImage(false);
    }
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
          <motion.button
            type="button"
            onClick={onSubmit}
            disabled={status === "loading"}
            className="showa-heisei-button px-6 py-3 font-medium relative"
            whileHover={{ scale: status === "loading" ? 1 : 1.05 }}
            whileTap={{ scale: status === "loading" ? 1 : 0.95 }}
          >
            {status === "loading" ? (
              <motion.span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block"
                >
                  ✨
                </motion.span>
                変換中...
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block"
                >
                  ✨
                </motion.span>
              </motion.span>
            ) : (
              "🔄 ポジ変換"
            )}
          </motion.button>
        </div>

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {converted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1],
                opacity: { duration: 0.3 }
              }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 shadow-lg"
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-green-700 mb-2 font-semibold flex items-center gap-2"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: 3, duration: 0.5, delay: 0.3 }}
                >
                  ✨
                </motion.span>
                変換結果
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg leading-relaxed mb-4 text-gray-800"
              >
                {converted}
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-2 justify-center"
              >
                <button
                  type="button"
                  onClick={() => copy(converted)}
                  className="showa-heisei-button py-2 px-6 text-sm font-medium relative overflow-hidden"
                >
                  {showCopied ? (
                    <motion.span
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex items-center gap-1"
                    >
                      ✓ コピーしました！
                    </motion.span>
                  ) : (
                    '📋 コピー'
                  )}
                </button>

                <button
                  type="button"
                  onClick={generateShareImage}
                  disabled={generatingImage}
                  className="showa-heisei-button py-2 px-6 text-sm font-medium bg-gradient-to-r from-pink-50 to-orange-50 border-orange-300 hover:border-orange-400 disabled:opacity-50"
                >
                  {generatingImage ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block"
                    >
                      🎨
                    </motion.span>
                  ) : (
                    '🎨 画像生成'
                  )}
                </button>
              </motion.div>

              {generatedImageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 flex flex-col items-center gap-4"
                >
                  <div className="relative w-full max-w-[300px] shadow-xl rounded-lg overflow-hidden border-4 border-white">
                    <img 
                      src={generatedImageUrl} 
                      alt="生成されたシェア画像" 
                      className="w-full h-auto"
                    />
                  </div>
                  <a
                    href={generatedImageUrl}
                    download={`kotoba-swap-${Date.now()}.png`}
                    className="showa-heisei-button py-2 px-6 text-sm font-medium flex items-center gap-2"
                  >
                    💾 画像を保存する
                  </a>
                </motion.div>
              )}

              {alternatives.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 pt-4 border-t border-green-200"
                >
                  <div className="text-xs text-green-600 mb-2">他の変換案</div>
                  <div className="space-y-2">
                    {alternatives.map((alt, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                        className="text-sm text-gray-700 bg-white/50 p-2 rounded cursor-pointer hover:bg-white/80 transition-colors"
                        onClick={() => copy(alt)}
                      >
                        {alt}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


