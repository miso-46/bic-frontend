"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 実際のアプリケーションでは、ここで認証処理を行います
    // 例: APIを呼び出して認証する
    console.log("ログイン処理:", id, password);

    // 認証成功後、admin画面に遷移
    router.push("/admin");
  };

  const handleReturnToStore = () => {
    // 店頭画面に戻る処理をここに実装
    console.log("店頭画面に戻る");
  };

  return (
    <div className="login-card">
      <div className="header">
        <div className="logo">
          <Image
            src="/images/biccamera-logo.jpg"
            alt="ビックカメラロゴ"
            width={48}
            height={48}
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
            ID:
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="#####"
            />
          </label>
        </div>

        <div className="input-group">
          <label>
            PASSWORD:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="#####"
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
    </div>
  );
}
