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
      {/* Hydration mismatch を防ぐため、bodyに直接Tailwindクラスを指定 */}
      <body className="antialiased">
        {/* Tailwindの.containerと競合しないようにクラス名を変更 */}
        <div className="login-container">{children}</div>
      </body>
    </html>
  );
}
