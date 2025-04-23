"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const analysisUrl = process.env.NEXT_PUBLIC_ANALYSIS_URL;
console.log('apiUrl:', apiUrl);

export default function AdminPage() {
  const router = useRouter();
  const [floor, setFloor] = useState("");
  const [area, setArea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("store_name");
    if (name) setStoreName(name);
  }, []);

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

        <div className="bg-white p-4 mb-4 w-full text-center">
          <h2 className="text-lg font-semibold">店舗：{storeName}</h2>
          <div className="mt-2 flex items-center justify-center">
            <input
              type="text"
              placeholder="階数（例：1F）"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="border p-2 mr-2 text-sm"
            />
            <input
              type="text"
              placeholder="エリア（例：TV売り場）"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="border p-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <button
            onClick={async () => {
              try {
                setIsSubmitting(true);
                const storeId = localStorage.getItem("store_id");
                if (!storeId) throw new Error("store_idが見つかりません");

                const tabletUuid = uuidv4();
                const res = await axios.post(`${apiUrl}/tablet/register`, {
                  uuid: tabletUuid,
                  store_id: Number(storeId),
                  floor,
                  area,
                });

                if (res.data.message) {
                  localStorage.setItem("tablet_uuid", tabletUuid);
                  sessionStorage.removeItem("isLoggedIn");
                  router.push("/");
                }
              } catch {
                alert("タブレット登録に失敗しました");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className={`w-full py-3 border border-gray-300 transition-colors ${
              floor && area ? "hover:bg-gray-50" : "bg-gray-200 cursor-not-allowed"
            }`}
            disabled={!floor || !area || isSubmitting}
          >
            店頭画面
          </button>

          <div className="h-3"></div>

          <Link href={analysisUrl ?? "#"}>
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
