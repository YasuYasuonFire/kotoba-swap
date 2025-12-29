"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INPUT_EXAMPLES } from "@/lib/seedPhrases";

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

  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Twitter intent URL（バイラルテキスト込み）
  const twitterShareUrl = useMemo(() => {
    if (!converted) return "";
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kotoba-swap.com';
    // バイラル効果最大化：ハッシュタグ・CTA・URLを全て含む
    const viralText = `${converted}

#ことばスワップ でポジティブ変換しました✨
あなたも試してみて👉 ${siteUrl}`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(viralText)}`;
  }, [converted]);

  // Base64データURLをBlobに変換する関数
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // バイラル用の完全な投稿テキスト（ハッシュタグ・URL込み）
  const getViralShareText = () => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kotoba-swap.com';
    return `${converted}

#ことばスワップ でポジティブ変換しました✨
あなたも試してみて👉 ${siteUrl}`;
  };

  // Web Share APIを使った画像付き共有
  const shareWithImage = async () => {
    if (!converted || !generatedImageUrl) return;

    setIsSharing(true);
    setShareError(null);

    // バイラル効果最大化：テキストにURL・ハッシュタグを全て含める
    const viralText = getViralShareText();

    try {
      // Web Share API Level 2 (ファイル共有) に対応しているかチェック
      if (navigator.share && navigator.canShare) {
        const blob = dataURLtoBlob(generatedImageUrl);
        const file = new File([blob], `kotoba-swap-${Date.now()}.png`, { type: 'image/png' });

        // URLは別パラメータではなくテキストに含める（Xアプリの互換性向上）
        const shareData = {
          text: viralText,
          files: [file],
        };

        // ファイル共有がサポートされているかチェック
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setIsSharing(false);
          return;
        }
      }

      // ファイル共有非対応の場合: 画像をクリップボードにコピーしてTwitterリンクへ
      await copyImageToClipboard();
      
      // 少し遅延してからTwitterを開く（ユーザーに通知を見せるため）
      setTimeout(() => {
        window.open(twitterShareUrl, '_blank');
      }, 1500);

    } catch (err) {
      // ユーザーがシェアをキャンセルした場合
      if (err instanceof Error && err.name === 'AbortError') {
        setIsSharing(false);
        return;
      }
      
      // その他のエラー: フォールバック
      console.error('Share error:', err);
      await copyImageToClipboard();
      setTimeout(() => {
        window.open(twitterShareUrl, '_blank');
      }, 1500);
    } finally {
      setIsSharing(false);
    }
  };

  // 画像をクリップボードにコピー
  const copyImageToClipboard = async () => {
    if (!generatedImageUrl) return;

    try {
      const blob = dataURLtoBlob(generatedImageUrl);
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setShareError('📋 画像をコピーしました！Xの投稿画面で Ctrl+V で貼り付けてね🖼️');
      setTimeout(() => setShareError(null), 4000);
    } catch (err) {
      console.error('Clipboard error:', err);
      setShareError('💡 画像を保存してからXに添付してね！');
      setTimeout(() => setShareError(null), 4000);
    }
  };

  // バイラルテキストをクリップボードにコピー（画像とは別途）
  const copyViralText = async () => {
    const viralText = getViralShareText();
    await navigator.clipboard.writeText(viralText);
    setShareError('📝 投稿テキストをコピーしました！');
    setTimeout(() => setShareError(null), 2000);
  };

  useEffect(() => {
    // 初期入力だけ自動セット（ユーザーが入力し始めた後は上書きしない）
    if (!seeded) return;
    setText((prev) => (prev ? prev : seeded));
  }, [seeded]);

  // 画像生成機能
  async function generateShareImage(sourceText: string, convertedText: string) {
    if (!sourceText || !convertedText) return;

    setGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          beforeText: sourceText,
          afterText: convertedText,
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
      // 自動実行なのでアラートは出さず、コンソールのみ
    } finally {
      setGeneratingImage(false);
    }
  }

  async function onSubmit() {
    const payload = clampText(text);
    if (!payload) {
      setStatus("error");
      setError("変換したい文を入力してください。");
      return;
    }

    setStatus("loading");
    setError("");
    setConverted("");
    setGeneratedImageUrl(null);

    try {
      const result = await postConvert({ text: payload, style });
      setConverted(result.converted);
      setAlternatives(result.alternatives);
      setUsed(result.used);
      setStatus("idle");
      
      // 変換成功時に自動で画像生成を実行
      generateShareImage(payload, result.converted);
      
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

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        あなたの日常を入力
      </h3>

      <div className="space-y-4">
        {/* プリセット選択プルダウン */}
        <select
          className="showa-heisei-input w-full p-2 mb-2 text-sm text-gray-600 bg-white"
          onChange={(e) => {
            if (e.target.value) {
              setText(e.target.value);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>
            例から選択して入力（選択すると上書きされます）
          </option>
          {INPUT_EXAMPLES.map((ex, i) => (
            <option key={i} value={ex}>
              {ex}
            </option>
          ))}
        </select>

        <textarea
          className="showa-heisei-input w-full min-h-[120px] p-4 resize-none"
          placeholder="例: 食べて飲んでばっかりだわ...（自由に入力もできます）"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
        />

        <div className="flex justify-center">
          <motion.button
            type="button"
            onClick={onSubmit}
            disabled={status === "loading" || generatingImage}
            className="showa-heisei-button px-6 py-3 font-medium relative w-full sm:w-auto"
            whileHover={{ scale: (status === "loading" || generatingImage) ? 1 : 1.05 }}
            whileTap={{ scale: (status === "loading" || generatingImage) ? 1 : 0.95 }}
          >
            {(status === "loading" || generatingImage) ? (
              <motion.span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block"
                >
                  ✨
                </motion.span>
                {status === "loading" ? "変換中..." : "画像生成中..."}
              </motion.span>
            ) : (
              "✨ ポジ変換 ＆ 画像生成 🖼️"
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
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 shadow-lg mt-6"
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
                className="text-lg leading-relaxed mb-4 text-gray-800 font-bold"
              >
                {converted}
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                {/* メインの共有ボタン */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => copy(converted)}
                    className="showa-heisei-button py-2 px-6 text-sm font-medium relative overflow-hidden bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
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

                  {twitterShareUrl && (
                    generatedImageUrl ? (
                      <button
                        type="button"
                        onClick={shareWithImage}
                        disabled={isSharing}
                        className="showa-heisei-button py-2 px-6 text-sm font-medium bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSharing ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              ⏳
                            </motion.span>
                            共有中...
                          </>
                        ) : (
                          <>
                            <span>𝕏</span> 画像付きで投稿 🔥
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href={twitterShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="showa-heisei-button py-2 px-6 text-sm font-medium bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 flex items-center justify-center gap-2"
                      >
                        <span>𝕏</span> 投稿する
                      </a>
                    )
                  )}
                </div>

                {/* 画像がある場合の補助ボタン（PCブラウザ向け） */}
                {generatedImageUrl && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center text-xs">
                    <button
                      type="button"
                      onClick={copyViralText}
                      className="text-gray-500 hover:text-gray-700 underline"
                    >
                      📝 投稿テキストだけコピー
                    </button>
                    <button
                      type="button"
                      onClick={copyImageToClipboard}
                      className="text-gray-500 hover:text-gray-700 underline"
                    >
                      🖼️ 画像だけコピー
                    </button>
                  </div>
                )}

                {/* 共有時のフィードバックメッセージ */}
                <AnimatePresence>
                  {shareError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg"
                    >
                      {shareError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {generatingImage && !generatedImageUrl && (
                <div className="mt-6 text-center text-sm text-gray-500 animate-pulse">
                   🎨 シェア用画像を生成中...
                </div>
              )}

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
