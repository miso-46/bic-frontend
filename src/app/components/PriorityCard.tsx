// app/page.tsx
"use client";

import { useEffect, useState, Fragment } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import styles from "../priority/[receptionId]/priority.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type ScoreItem = {
  metricsId: number;
  name: string;
  score: number;
};

export const PriorityCard = ({ speechText = "あなたの優先順位はこれだよ！" }: { speechText?: string }) => {
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
          {speechText.split("\n").map((line, idx, arr) => (
            <Fragment key={idx}>
              {line}
              {idx !== arr.length - 1 && <br />}
            </Fragment>
          ))}
        </div>
      </section>

      <section className={styles.rankingSection}>
        <h2>優先順位</h2>
        {scores.length === 0 ? (
          <p className={styles.loading}>読み込み中...</p>
        ) : (
          <div className={styles.rankGrid}>
            {[
              scores.slice(0, 3),
              scores.slice(3, 6),
              scores.slice(6, 9),
            ].map((group, groupIndex) => (
              <ul key={groupIndex} className={styles.rankList}>
                {group.map((item, idx) => (
                  <li key={item.metricsId} className={styles.rankItem}>
                    第{groupIndex * 3 + idx + 1}位：{item.name}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
