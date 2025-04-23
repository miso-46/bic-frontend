// app/layout.tsx
import type React from "react";

export const metadata = {
  title: "AIビッカメ娘 - おススメ家電診断",
  description: "家電選びをサポートするAI診断アプリ",
};

export default function RecommendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
      {children}
    </div>
  );
}