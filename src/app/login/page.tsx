"use client";

import type React from "react";
import axios from "axios";
import { openDB } from "idb";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
console.log('apiUrl:', apiUrl);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    if (!name.trim() || !password.trim()) {
      alert("店舗名とパスワードを入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/login`, {
        name: name,
        password: password,
      });

      const data = response.data;
      const character = data.character;

      // ログイン情報は認証成功時にsessionStorageに保存
      sessionStorage.setItem("isLoggedIn", "true");

      // 店舗情報はlocalStorageに保存
      localStorage.setItem("store_id", data.store_id.toString());
      localStorage.setItem("store_name", data.store_name);
      localStorage.setItem("store_prefecture", data.prefecture);

      // 初回ログイン時、BlobをIndexedDBに保存
      const db = await openDB("bicAppDB", 1, {
        upgrade(db) {
          if (db.objectStoreNames.contains("media")) {
            db.deleteObjectStore("media");
          }
          db.createObjectStore("media");
        },
      });

      const fetchAndStoreBlob = async (key: string, url: string) => {
        if (!url) return;
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          await db.put("media", blob, key);
        } catch (err) {
          console.error(`${key} の取得に失敗しました`, err);
        }
      };

      await fetchAndStoreBlob("girl_name", data.character.image);
      await fetchAndStoreBlob("image", character.image);
      await fetchAndStoreBlob("video", character.video);
      await fetchAndStoreBlob("voice_1", character.voice_1);
      await fetchAndStoreBlob("voice_2", character.voice_2);
      await db.put("media", character.message_1 || "", "voice_1_message");
      await db.put("media", character.message_2 || "", "voice_2_message");

      // 認証成功後、admin画面に遷移
      router.push("/admin");
      setIsLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("店舗名またはパスワードが間違っています。");
        } else {
          alert("ログイン中にエラーが発生しました。");
        }
      } else {
        alert("予期しないエラーが発生しました。");
      }
      setIsLoading(false);
    }
  };

  const handleReturnToStore = () => {
    // 店頭画面に戻る処理をここに実装
    router.push("/");
  };

  return (
    <div className="login-card">
      <div className="header">
        <div className="logo">
          <Image
            src="/images/biccamera-logo.jpg"
            alt="ビックカメラロゴ"
            width={150}
            height={50}
            className="logo-image"
            priority
          />
        </div>
        <div>
          <h1 className="title">ビックカメラAI販売支援システム</h1>
          <p className="subtitle">認証</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="form">
        <div className="input-group">
          <label>
            店舗名:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            パスワード:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin(e);
                }
              }}
            />
          </label>
        </div>

        <button type="submit" className="button">
          ログイン
        </button>

        <button type="button" onClick={handleReturnToStore} className="button">
          店頭画面に戻る
        </button>
      </form>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <FaSpinner className="animate-spin text-white text-4xl" />
        </div>
      )}
    </div>
  );
}
