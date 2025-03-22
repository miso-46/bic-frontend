import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビックカメラAI販売支援システム",
  description: "ビックカメラAI販売支援システム認証画面",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
