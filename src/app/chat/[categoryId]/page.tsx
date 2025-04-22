'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import styles from '@/app/components/ButtonGroup.module.css';
import Image from 'next/image';
import { openDB } from 'idb';
import layoutStyles from './ChatLayout.module.css';

const mplusRounded = M_PLUS_Rounded_1c({ weight: '700', subsets: ['latin'] });

// 環境変数の読み取り（
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
console.log('apiUrl:', apiUrl);

type Question = {
    question_text: string;
    options: { label: string; value: number }[];
};

export default function ChatPage() {
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState<string>('');
    const [questions, setQuestions] = useState<{ [id: string]: Question }>({});
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [age, setAge] = useState<number | null>(null);
    const [gender, setGender] = useState('');
    const [household, setHousehold] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [characterImage, setCharacterImage] = useState<string | null>(null);

    const allAnswered =
    gender &&
    age !== null &&
    household &&
    Object.keys(questions).length > 0 &&
    Object.keys(questions).every(id => answers[id] !== undefined);

    useEffect(() => {
        const storedCategoryId = localStorage.getItem("category_id");
        const storedCategoryName = localStorage.getItem("category_name");
        if (storedCategoryId) setCategoryId(storedCategoryId);
        if (storedCategoryName) setCategoryName(storedCategoryName);
    }, []);

    useEffect(() => {
        if (!categoryId) return;
        const fetchQuestions = async () => {
            const res = await axios.get(`${apiUrl}/question/${categoryId}`);
            setQuestions(res.data);
        };
        fetchQuestions();
    }, [categoryId]);

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

    useEffect(() => {
        setTimeout(() => {
        setCurrentStep(1);
        }, 500);
    }, []);

    useEffect(() => {
        if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [currentStep]);

    const handleChoice = (questionId: string, value: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        const stepIndex = Object.keys(questions).indexOf(String(questionId)) + 4;
        if (currentStep === stepIndex) {
            setTimeout(() => {
                setCurrentStep(stepIndex + 1);
            }, 800);
        }
    };
    

    const handleSubmit = async () => {
        setErrorMessage('');
        setIsSubmitting(true);
        try {
        const userInfo = {
            age: age!,
            gender,
            household: Number(household),
            store_id: 5,
            category_id: Number(categoryId),
        };

        const userRes = await axios.post(`${apiUrl}/user_info`, userInfo);
        const receptionId = userRes.data.reception_id;

        const answerPayload = {
            receptionId: receptionId,
            answers: Object.entries(answers).map(([questionId, value]) => ({
                questionId: Number(questionId),
                answer: Number(value), // value を数値に変換
            })),
        };

        await axios.post(`${apiUrl}/answers`, answerPayload);
        router.push(`/priority/${receptionId}`);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                const detail = error.response.data.detail;
        
                // 安全に文字列を抽出
                let message = '送信中にエラーが発生しました。';
        
                if (Array.isArray(detail)) {
                    // Pydanticのバリデーションエラー配列
                    if (detail.length > 0 && typeof detail[0] === 'object' && 'msg' in detail[0]) {
                        message = detail[0].msg;
                    } else {
                        message = JSON.stringify(detail); // fallback表示
                    }
                } else if (typeof detail === 'object' && detail !== null) {
                    if ('msg' in detail) {
                        message = detail.msg;
                    } else {
                        message = JSON.stringify(detail); // fallback表示
                    }
                } else if (typeof detail === 'string') {
                    message = detail;
                }
        
                setErrorMessage(message);
            } else {
                setErrorMessage('送信中に予期しないエラーが発生しました。');
            }
        }
    };

    return (
        <main>
          <h1 className={`text-3xl font-bold ${mplusRounded.className} text-center w-full`}>QUESTION</h1>
          <div className={layoutStyles.container}>
            <div className={layoutStyles.left}>
              <Image
                src={characterImage || "/images/girl.png"}
                alt="案内キャラクター"
                width={200}
                height={200}
                priority
                className={layoutStyles.character}
              />
              <div className={layoutStyles.speech}>
                あなたにおススメの<br />
                {categoryName ? `【${categoryName}】` : '【カテゴリー】'}<br />
                を診断するよー！<br />
                いくつか質問するから、<br />
                当てはまる答えを選んでね！
              </div>
            </div>
            <div className={layoutStyles.right}>
              <div ref={chatRef} className={layoutStyles.chatBox}>
                <div className={layoutStyles.chatHeader}>最初に、あなたのことを教えてね！</div>

                {currentStep >= 1 && (
                  <div>
                    <div className={layoutStyles.questionLabel}>年齢は？</div>
                    <div className={layoutStyles.options}>
                      {[10, 20, 30, 40, 50, 60, 70].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setAge(opt); if (currentStep === 1) setTimeout(() => setCurrentStep(2), 800); }}
                          className={`${layoutStyles.optionButton} ${age === opt ? layoutStyles.selectedOption : ''}`}
                        >
                          {opt}代
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep >= 2 && (
                  <div>
                    <div className={layoutStyles.questionLabel}>性別は？</div>
                    <div className={layoutStyles.options}>
                      {[
                        { label: '男性', value: 'male' },
                        { label: '女性', value: 'female' },
                        { label: 'その他', value: 'other' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setGender(opt.value); if (currentStep === 2) setTimeout(() => setCurrentStep(3), 800); }}
                          className={`${layoutStyles.optionButton} ${gender === opt.value ? layoutStyles.selectedOption : ''}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep >= 3 && (
                  <div>
                    <div className={layoutStyles.questionLabel}>世帯人数は？</div>
                    <div className={layoutStyles.options}>
                      {[1, 2, 3, 4, 5].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setHousehold(String(opt)); if (currentStep === 3) setTimeout(() => setCurrentStep(4), 800); }}
                          className={`${layoutStyles.optionButton} ${household === String(opt) ? layoutStyles.selectedOption : ''}`}
                        >
                          {opt}人
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {Object.entries(questions).map(([id, q], idx) => (
                  currentStep >= idx + 4 && (
                    <div key={id}>
                      <div className={layoutStyles.questionLabel}>{q.question_text}</div>
                      <div className={layoutStyles.options}>
                        {q.options.map((option: { label: string; value: number }) => {
                          const isSelected = answers[id] === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleChoice(id, option.value)}
                              className={`${layoutStyles.optionButton} ${isSelected ? layoutStyles.selectedOption : ''}`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
          <div className={layoutStyles.footer}>
            <Link href="/" className={`${styles.btnCommon} ${styles.btnReturn}`}>トップに戻る</Link>
            <button
              disabled={!allAnswered}
              onClick={handleSubmit}
              className={`${styles.btnCommon} ${styles.btnDiagnose} ${!allAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
            >CHECK！</button>
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            {isSubmitting && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <FaSpinner className="animate-spin text-white text-4xl" />
              </div>
            )}
          </div>
        </main>
    );
}
