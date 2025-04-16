// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import styles from "../priority/[receptionId]/priority.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type ScoreItem = {
  metricsId: number;
  name: string;
  score: number;
};

export const PriorityCard = () => {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const params = useParams();
  const receptionId = params?.receptionId as string | undefined;

  useEffect(() => {
    if (!receptionId || !apiUrl) return;

    const fetchScores = async () => {
      try {
        const res = await fetch(`${apiUrl}/priority/${receptionId}`);
        if (!res.ok) {
          throw new Error("サーバーエラー");
        }
        const data = await res.json();
        setScores(data);
      } catch (err) {
        console.error("データ取得エラー:", err);
      }
    };

    fetchScores();
  }, [receptionId]);

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
            あなたの優先順位はこれだよ！
            <br />
          </div>
        </section>

        <section className={styles.rankingSection}>
          <h2>優先順位</h2>
          <ul className={styles.rankList}>
            {scores.length === 0 ? (
              <li>読み込み中...</li>
            ) : (
              scores.map((item, idx) => (
                <li key={item.metricsId}>
                  第{idx + 1}位：{item.name}（スコア：{item.score.toFixed(2)}）
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
};
