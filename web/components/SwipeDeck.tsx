"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SeedPhrase } from "@/lib/seedPhrases";

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SwipeDeck({
  phrases,
  onUseAsDraft,
}: {
  phrases: SeedPhrase[];
  onUseAsDraft: (text: string) => void;
}) {
  const [deck, setDeck] = useState<SeedPhrase[]>(phrases);

  const [idx, setIdx] = useState(0);
  const current = deck[idx] ?? deck[0];

  const startX = useRef<number | null>(null);
  const dragX = useRef(0);
  const [dragStyle, setDragStyle] = useState<{ x: number; rot: number }>({
    x: 0,
    rot: 0,
  });

  function next() {
    setIdx((v) => (deck.length ? (v + 1) % deck.length : 0));
  }
  function prev() {
    setIdx((v) => (deck.length ? (v - 1 + deck.length) % deck.length : 0));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.length]);

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    dragX.current = 0;
    setDragStyle({ x: 0, rot: 0 });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    dragX.current = dx;
    setDragStyle({ x: dx, rot: Math.max(-12, Math.min(12, dx / 12)) });
  }

  function onPointerUp() {
    if (startX.current == null) return;
    const dx = dragX.current;
    startX.current = null;
    dragX.current = 0;

    if (Math.abs(dx) > 80) {
      if (dx < 0) next();
      else prev();
    }
    setDragStyle({ x: 0, rot: 0 });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          あなたの日常
        </h3>
        <button
          type="button"
          className="showa-heisei-button px-3 py-2 text-sm"
          onClick={() => {
            setDeck(shuffle(phrases));
            setIdx(0);
            setDragStyle({ x: 0, rot: 0 });
          }}
        >
          シャッフル
        </button>
      </div>

      {!current ? (
        <div className="text-center py-8 text-gray-500">
          データがありません
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className="bg-white rounded-lg border border-gray-200 p-6 touch-pan-y select-none"
            style={{
              transform: `translateX(${dragStyle.x}px) rotate(${dragStyle.rot}deg)`,
              transition: startX.current == null ? "transform 160ms ease" : "none",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="text-center mb-4">
              <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {idx + 1} / {deck.length}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">日常の言葉</div>
                <div className="text-lg leading-relaxed">
                  {current.from}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600 mb-2">ポジティブ変換</div>
                <div className="text-lg leading-relaxed font-medium">
                  {current.to}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={prev}
              className="flex-1 showa-heisei-button py-3 text-sm font-medium"
            >
              ← 前へ
            </button>
            <button
              type="button"
              onClick={next}
              className="flex-1 showa-heisei-button py-3 text-sm font-medium"
            >
              次へ →
            </button>
          </div>

          <div className="text-center text-xs text-gray-500">
            スワイプでも移動できます
          </div>
        </div>
      )}
    </div>
  );
}


