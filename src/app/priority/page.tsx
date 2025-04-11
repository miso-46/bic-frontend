// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./priority.module.css";

// 環境変数の読み取り
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type Priority = {
  metricsId: number;
  name: string;
  score: number;
};

export default function Home() {
  const router = useRouter();
  const [priorities, setPriorities] = useState<Priority[]>([]);

  useEffect(() => {
    const payload = {
      receptionId: 1111,
      answers: [
        { questionId: 1, value: 0 },
        { questionId: 2, value: 1 },
        { questionId: 3, value: 2 },
        { questionId: 4, value: 0 },
        { questionId: 5, value: 2 },
        { questionId: 6, value: 0 },
        { questionId: 7, value: 1 },
        { questionId: 8, value: 0 },
        { questionId: 9, value: 0 },
        { questionId: 10, value: 0 },
        { questionId: 11, value: 0 },
      ]
    };

    const sendData = async () => {
      try {
        const res = await fetch(`${apiUrl}/recommend/score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('APIエラー');
        const data = await res.json();
        console.log('API Response:', data);
        // prioritiesを更新
        if (data.priorities && Array.isArray(data.priorities)) {
          setPriorities(data.priorities); // ←そのまま渡してOK
        }        
      } catch (err) {
        console.error('送信失敗:', err);
      }
    };

    const timer = setTimeout(() => {
      sendData();
    }, 2000);

    return () => clearTimeout(timer); // クリーンアップ
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>あなたの優先順位</header>

      <main className={styles.main}>
        <section className={styles.characterSection}>
          <Image
            src="/images/girl.png"
            alt="キャラ画像"
            width={200}
            height={300}
            className={styles.characterImage}
          />
          <div className={styles.speechBubble}>
            回答ありがとう！<br />
            あなたの優先順位について確認するねー。<br />
            OKなら診断ボタン押して！
          </div>
        </section>

        <section className={styles.rankingSection}>
          <h2>優先順位</h2>
          <ul className={styles.rankList}>
            {priorities.length === 0 ? (
              <li>読み込み中...</li>
            ) : (
              priorities.map((item, idx) => (
                <li key={idx}>
                  第{idx + 1}位：{item.name}（スコア：{item.score.toFixed(2)}）
                </li>
              ))
            )}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <button className={styles.btnBack}>トップに戻る</button>
        <button className={styles.btnWhite} onClick={() => location.reload()}>
          再入力
        </button>
        <button className={styles.btnRed}>診断</button>
      </footer>
    </div>
  );
}


