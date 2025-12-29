"use client";

import { useMemo, useState } from "react";
import { ConvertForm } from "@/components/ConvertForm";
import { SwipeDeck } from "@/components/SwipeDeck";
import { SEED_PHRASES } from "@/lib/seedPhrases";

import { Mascot } from "@/components/Mascot";

export default function Home() {
  const [draft, setDraft] = useState<string>("");

  const phrases = useMemo(() => SEED_PHRASES, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-sm">
        <header className="relative text-center mb-8 pt-10">
          <Mascot className="absolute -top-2 left-1/2 -translate-x-1/2 mb-2 animate-bounce" />
          <h1 className="showa-heisei-title text-center mb-2">
            ことばスワップ
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            年末年始の生活を、<br/>
            ポジティブ変換しよう
          </p>
          <div className="text-center mt-4">
            <a
              className="inline-block text-xs text-gray-500 underline hover:text-gray-700"
              href="/privacy"
            >
              プライバシー
            </a>
          </div>
        </header>

        <main className="space-y-6 relative">
          <Mascot className="absolute -right-6 top-1/2 opacity-20 pointer-events-none hidden sm:block" />
          <div className="showa-heisei-card p-4">
            <SwipeDeck phrases={phrases} onUseAsDraft={(text) => setDraft(text)} />
          </div>

          <div className="showa-heisei-card p-4">
            <ConvertForm
              seedDraft={draft}
            />
          </div>

        </main>
      </div>
    </div>
  );
}
