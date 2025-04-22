"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import styles from "./priority.module.css";
import axios from 'axios';
import { openDB } from 'idb';
import { M_PLUS_Rounded_1c } from 'next/font/google';

const mplusRounded = M_PLUS_Rounded_1c({
  weight: '700',
  subsets: ['latin'],
});

// 環境変数の読み取り
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type Answer = {
  questionId: number;
  answer: number;
};

type AnswerResponse = {
  answers: Answer[];
};

type Priority = {
  metricsId: number;
  name: string;
  score: number;
};

export default function PriorityPage() {
  const router = useRouter();
  const { receptionId } = useParams();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCharacterImage = async () => {
        try {
            const db = await openDB('bicAppDB', 1);
            const blob = await db.get('media', 'image');
            if (blob) {
                const url = URL.createObjectURL(blob);
                setCharacterImage(url);
            }
        } catch (e) {
            console.error('Failed to load character image from IndexedDB:', e);
        }
    };
    loadCharacterImage();
  }, []);

  // 動画の取得
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadCharacterVideo = async () => {
      try {
        const db = await openDB("bicAppDB", 1);
        const blob = await db.get("media", "video");
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setVideoSrc(url);
        }
      } catch (e) {
        console.error("動画の取得に失敗しました", e);
      }
    };
    loadCharacterVideo();
  }, []);

  useEffect(() => {
    const fetchAndSend = async () => {
      try {
        // ① 回答の取得
        const res = await axios.get<AnswerResponse>(`${apiUrl}/answers/${receptionId}`);
        const answers = res.data.answers;

        // ② payload の作成
        const payload = {
          receptionId: Number(receptionId),
          answers: answers.map(a => ({
            questionId: a.questionId,
            value: a.answer,
          })),
        };

        // ③ 送信処理
        const scoreRes = await fetch(`${apiUrl}/recommend/score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!scoreRes.ok) throw new Error('APIエラー');

        const data = await scoreRes.json();
        console.log('API Response:', data);

        if (data.priorities && Array.isArray(data.priorities)) {
          setPriorities(data.priorities);
        }
      } catch (err) {
        console.error('送信失敗:', err);
      }
    };

    // 実行（2秒ディレイ付き）
    const timer = setTimeout(() => {
      if (receptionId) {
        fetchAndSend();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [receptionId]);

  const savePriorities = async () => {
    if (!priorities.length) return;
  
    const payload = priorities.map((p) => ({
      reception_id: Number(receptionId), // use dynamic ID from URL
      metrics_id: p.metricsId,
      level: p.score,
    }));
  
    try {
      const res = await fetch(`${apiUrl}/priority`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priorities: payload }),
      });
  
      if (!res.ok) throw new Error("保存に失敗しました");
      console.log("保存完了");
    } catch (err) {
      console.error("保存エラー:", err);
    }
  };
  

  return (
    <div className={styles.container}>
      <header className={`${styles.header} ${mplusRounded.className}`}>
        あなたの優先順位
      </header>

      <main className={styles.main}>
        <section className={styles.characterSection}>
          <Image
            src={characterImage || "/images/girl.png"}
            alt="キャラ画像"
            width={200}
            height={300}
            className={styles.characterImage}
          />
          <div className={styles.speechBubble}>
            回答ありがとう！<br />
            あなたの優先順位について確認するね。<br />
            OKなら診断ボタン押して！
          </div>
        </section>

        <section className={styles.rankingSection}>
          <h2>優先順位</h2>
          {priorities.length === 0 ? (
            <p className={styles.loading}>読み込み中...</p>
          ) : (
            <div className={styles.rankGrid}>
              {[
                priorities.slice(0, 3),
                priorities.slice(3, 6),
                priorities.slice(6, 9),
              ].map((group, groupIndex) => (
                <ul key={groupIndex} className={styles.rankList}>
                  {group.map((item, idx) => (
                    <li key={idx} className={styles.rankItem}>
                      第{groupIndex * 3 + idx + 1}位：{item.name}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <button className={`${styles.btnCommon} ${styles.btnReturn}`} onClick={() => router.push('/')}>トップに戻る</button>
        <button className={`${styles.btnCommon} ${styles.btnReset}`} onClick={() => {
            const categoryId = localStorage.getItem("category_id");
            if (categoryId) {
              router.push(`/chat/${categoryId}`);
            } else {
              alert("カテゴリ取得に失敗したのでトップに戻ってください");
            }
          }}>再入力</button>
        <button
            className={`${styles.btnCommon} ${styles.btnDiagnose}`}
            onClick={async () => {
              setIsLoading(true);
              await savePriorities();
              router.push(`/recommend/${receptionId}`);
            }}
            >
            診断
            </button>
      </footer>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-white rounded-full flex flex-col items-center justify-center shadow-xl">
            <video
              src={videoSrc || "/images/bic-girl.mp4"}
              autoPlay
              loop
              muted
              playsInline
              className="w-[160px] h-auto mb-2"
            />
            <p className={`${mplusRounded.className} text-black text-xl`}>調べてるよー</p>
          </div>
        </div>
      )}
    </div>
  );
}