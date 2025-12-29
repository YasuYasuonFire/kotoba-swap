"use client";

import { useMemo, useState } from "react";
import { dataUrlToFile } from "@/lib/share/dataUrl";

type Platform = "instagram" | "tiktok";

function getSiteUrl() {
  if (typeof window === "undefined") return "https://kotoba-swap.com";
  return window.location.origin;
}

function platformLabel(p: Platform) {
  return p === "instagram" ? "Instagram" : "TikTok";
}

export function InstagramTikTokShareButtons({
  convertedText,
  imageDataUrl,
}: {
  convertedText: string;
  imageDataUrl: string;
}) {
  const [hashtags, setHashtags] = useState("#ことばスワップ #ポジティブ変換");
  const [isSharing, setIsSharing] = useState<Platform | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const baseCaption = useMemo(() => {
    const siteUrl = getSiteUrl();
    return `${convertedText}\n\n${hashtags}\n\n${siteUrl}`;
  }, [convertedText, hashtags]);

  async function share(p: Platform) {
    setNotice(null);

    const extraTag = p === "instagram" ? "#instagram" : "#tiktok";
    const caption = `${baseCaption}\n${extraTag}`;

    // 画像+テキスト同時共有（対応端末のみ）
    try {
      const file = dataUrlToFile(imageDataUrl, `kotoba-swap-${Date.now()}.png`);
      const shareData: ShareData = { text: caption, files: [file] };

      if (!navigator.share) {
        setNotice("このブラウザは画像付きシェアに未対応です。下の「キャプションコピー」と「画像保存」を使ってください。");
        return;
      }
      if (navigator.canShare && !navigator.canShare(shareData)) {
        setNotice("この端末では「画像+テキスト同時シェア」ができません。下のフォールバックを使ってください。");
        return;
      }

      setIsSharing(p);
      await navigator.share(shareData);
      setNotice("共有シートを開きました。シェア先でInstagram/TikTokを選んでください（アプリ側の仕様でテキストが消える場合があります）。");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return; // user cancelled
      setNotice("共有に失敗しました。下の「キャプションコピー」と「画像保存」を使ってください。");
    } finally {
      setIsSharing(null);
    }
  }

  async function copyCaption() {
    const caption = `${baseCaption}\n#instagram #tiktok`;
    await navigator.clipboard.writeText(caption);
    setNotice("キャプション（ハッシュタグ入り）をコピーしました。");
    setTimeout(() => setNotice(null), 2500);
  }

  return (
    <div className="mt-4 rounded-lg border border-green-200 bg-white/70 p-3">
      <div className="text-sm font-semibold text-green-700 mb-2">Instagram / TikTok にシェア</div>

      <label className="block text-xs text-gray-600 mb-1" htmlFor="hashtags">
        ハッシュタグ（自由に編集OK）
      </label>
      <input
        id="hashtags"
        className="showa-heisei-input w-full p-2 text-sm"
        value={hashtags}
        onChange={(e) => setHashtags(e.target.value)}
        placeholder="#ことばスワップ #ポジティブ変換"
      />

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => share("instagram")}
          disabled={isSharing !== null}
          className="showa-heisei-button py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSharing === "instagram" ? "共有中..." : "Instagramにシェア"}
        </button>
        <button
          type="button"
          onClick={() => share("tiktok")}
          disabled={isSharing !== null}
          className="showa-heisei-button py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSharing === "tiktok" ? "共有中..." : "TikTokにシェア"}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
        <button type="button" onClick={copyCaption} className="text-gray-600 hover:text-gray-800 underline">
          📝 キャプションをコピー
        </button>
        <a
          href={imageDataUrl}
          download={`kotoba-swap-${Date.now()}.png`}
          className="text-gray-600 hover:text-gray-800 underline"
        >
          💾 画像を保存
        </a>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 underline"
          aria-label={`${platformLabel("instagram")} を開く`}
        >
          ↗ Instagramを開く
        </a>
        <a
          href="https://www.tiktok.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 underline"
          aria-label={`${platformLabel("tiktok")} を開く`}
        >
          ↗ TikTokを開く
        </a>
      </div>

      {notice && (
        <div className="mt-3 text-center text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
          {notice}
        </div>
      )}
    </div>
  );
}

