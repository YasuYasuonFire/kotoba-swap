"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ShareTestPage() {
  const [converted] = useState<string>("今日はたくさんの美味しいものに出会えて、とても幸せな一日でした✨");
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // モック画像データ（小さな透明PNG）
  const mockImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

  // Twitter intent URL
  const twitterShareUrl = useMemo(() => {
    if (!converted) return "";
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kotoba-swap.com';
    const viralText = `${converted}

#ことばスワップ でポジティブ変換しました✨
あなたも試してみて👉 ${siteUrl}`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(viralText)}`;
  }, [converted]);

  // Base64データURLをBlobに変換
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

  // バイラル用の完全な投稿テキスト
  const getViralShareText = () => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kotoba-swap.com';
    return `${converted}

#ことばスワップ でポジティブ変換しました✨
あなたも試してみて👉 ${siteUrl}`;
  };

  // Web Share APIを使った画像付き共有
  const shareWithImage = async () => {
    if (!converted || !mockImageUrl) return;

    setIsSharing(true);
    setShareError(null);

    const viralText = getViralShareText();

    try {
      // Web Share API Level 2 (ファイル共有) に対応しているかチェック
      if (navigator.share && navigator.canShare) {
        const blob = dataURLtoBlob(mockImageUrl);
        const file = new File([blob], `kotoba-swap-test-${Date.now()}.png`, { type: 'image/png' });

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

      // 少し遅延してからTwitterを開く
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
    if (!mockImageUrl) return;

    try {
      const blob = dataURLtoBlob(mockImageUrl);
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

  // バイラルテキストをクリップボードにコピー
  const copyViralText = async () => {
    const viralText = getViralShareText();
    await navigator.clipboard.writeText(viralText);
    setShareError('📝 投稿テキストをコピーしました！');
    setTimeout(() => setShareError(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
        📱 SNSシェア機能テスト
      </h1>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-lg">
        <div className="text-sm text-green-700 mb-3 font-semibold flex items-center gap-2">
          ✨ 変換結果（テスト用）
        </div>

        <div className="text-lg leading-relaxed mb-4 text-gray-800 font-bold">
          {converted}
        </div>

        <div className="flex flex-col gap-4">
          {/* メインの共有ボタン */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => copyViralText()}
              className="showa-heisei-button py-2 px-6 text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
            >
              📋 コピー
            </button>

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
                "SNSでシェア"
              )}
            </button>

            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="showa-heisei-button py-2 px-6 text-sm font-medium bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center gap-2"
            >
              🐦 Twitter直接
            </a>
          </div>

          {/* 補助ボタン */}
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

          {/* モック画像表示 */}
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="text-sm text-gray-500">📷 モック画像（実際は生成画像）</div>
            <div className="relative w-full max-w-[300px] h-40 shadow-xl rounded-lg overflow-hidden border-4 border-white bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-sm text-center">
                🖼️<br/>
                テスト用画像<br/>
                (透明1px PNG)
              </div>
            </div>
          </div>

          {/* デバッグ情報 */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
            <div className="font-semibold mb-2">🔍 デバッグ情報</div>
            <div>Web Share API対応: {typeof navigator !== 'undefined' && !!(navigator as any).share ? "✅" : "❌"}</div>
            <div>ファイル共有対応: {typeof navigator !== 'undefined' && !!(navigator as any).canShare ? "✅" : "❌"}</div>
            <div>クリップボード対応: {typeof navigator !== 'undefined' && navigator.clipboard ? "✅" : "❌"}</div>
            <div className="mt-2">
              <div className="font-medium">生成されるTwitter URL:</div>
              <div className="break-all text-blue-600">{twitterShareUrl}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}