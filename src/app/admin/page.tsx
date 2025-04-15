"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  // 不正アクセス防止（未ログイン状態で/adminにアクセスしたら/loginにリダイレクト）
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("store_id");
    localStorage.removeItem("store_name");
    localStorage.removeItem("store_prefecture");
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 max-w-md mx-auto">
      <div className="w-full">
        <header className="flex items-center mb-2">
          <div className="mr-2">
            <Image
              src="/images/biccamera-logo.jpg"
              alt="ビックカメラロゴ"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <h1 className="text-xl font-bold">ビックカメラAI販売支援システム</h1>
        </header>

        <div className="text-sm mb-4">管理者メニュー＞メニュー一覧</div>

        <div className="bg-white  p-4 mb-4 w-full text-center">
          <h2 className="text-lg font-semibold">店舗：{typeof window !== "undefined" ? localStorage.getItem("store_name") : ""}</h2>
        </div>

        <div className="flex flex-col">
          <button
            onClick={() => {
              sessionStorage.removeItem("isLoggedIn");
              router.push("/");
            }}
            className="w-full py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            店頭画面
          </button>

          <div className="h-3"></div>

          <Link href="/data-analysis">
            <button className="w-full py-3 border border-gray-300 hover:bg-gray-50 transition-colors">
              接客データ分析
            </button>
          </Link>

          <div className="h-5"></div>

          <button
            onClick={handleLogout}
            className="w-full py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}
