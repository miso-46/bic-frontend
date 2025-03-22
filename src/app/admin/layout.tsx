import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./admin.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ビックカメラAI販売支援システム",
  description: "販売支援システム管理画面",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

