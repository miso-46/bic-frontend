import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIビッカメ娘 - おススメ家電診断",
  description: "家電選びをサポートするAI診断アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="max-w-[1180px] mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
