import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ことばスワップ（言い換え辞典）",
  description:
    "角が立たない言い換えをスワイプで探せる＆入力文をLLMでポジティブ変換するミニアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
