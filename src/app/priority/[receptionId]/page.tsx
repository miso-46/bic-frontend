// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import styles from "./priority.module.css";
import axios from 'axios';

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
  // const [answers, setAnswers] = useState<Answer[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);

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
        <button className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition-colors" onClick={() => router.push('/')}>トップに戻る</button>
        <button className="px-4 py-2 rounded-full border border-black text-black hover:bg-gray-100 transition-colors">再入力</button>
        <button
            className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            onClick={async () => {
              await savePriorities();
              router.push(`/recommend/${receptionId}`); // 例：診断結果ページへ遷移など
            }}
            >
            診断
            </button>
      </footer>
    </div>
  );
}