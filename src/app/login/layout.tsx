import type React from "react";
import type { Metadata } from "next";
import "./login.css"; // login.css をそのまま使う

export const metadata: Metadata = {
  title: "ビックカメラAI販売支援システム",
  description: "ビックカメラAI販売支援システム認証画面",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* Tailwindのクラスは body 側に適用して CSS Modules の影響を避ける */}
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
