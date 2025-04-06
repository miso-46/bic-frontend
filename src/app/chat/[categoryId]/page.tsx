'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FaSpinner } from 'react-icons/fa';
import { Luckiest_Guy } from 'next/font/google';

const luckiestGuy = Luckiest_Guy({ weight: '400', subsets: ['latin'] });

// 環境変数の読み取り（
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type Choice = {
    label: string;
    value: string;
};

type Question = {
    id: number;
    question_text: string;
    answer_type: string;
    choices: Choice[];
};

export default function ChatPage() {
    const { categoryId } = useParams();
    console.log('categoryId:', categoryId);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string | number | boolean }>({});
    const [age, setAge] = useState<number | null>(null);
    const [gender, setGender] = useState('');
    const [household, setHousehold] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allAnswered = gender && age !== null && household && questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

    useEffect(() => {
        const fetchQuestions = async () => {
            const res = await axios.get(`${apiUrl}/question/${categoryId}`);
            setQuestions(res.data);
        };
        fetchQuestions();
    }, [categoryId]);

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

    const handleChoice = (questionId: number, value: string | number | boolean) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        const stepIndex = questions.findIndex(q => q.id === questionId) + 4;
        if (currentStep === stepIndex) {
        setTimeout(() => {
            setCurrentStep(stepIndex + 1);
        }, 800); // add delay before next question
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
            receptionId,
            answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId: Number(questionId),
            value,
            })),
        };

        await axios.post(`${apiUrl}/answers`, answerPayload);
        router.push('/priority');
        } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.detail) {
            setErrorMessage(error.response.data.detail);
        } else {
            setErrorMessage('送信中に予期しないエラーが発生しました。');
        }
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center p-4">
        <h1 className={`text-2xl font-bold ${luckiestGuy.className}`}>QUESTION</h1>
        <div className="flex gap-8 mt-6">
            {/* 左側キャラクター */}
            <div>
            <img src="/images/girl.png" alt="案内キャラクター" width={200} />
            <div className="bg-[#FFBEBE] p-4 mt-2 rounded-md font-bold text-black">
                あなたにおススメの<br />
                【ロボット掃除機】<br />
                を診断するよー！<br />
                いくつか質問するから、<br />
                当てはまる答えを選んでね！
            </div>
            <Link
                href="/"
                className="mt-4 border border-[#FF0000] text-[#FF0000] px-4 py-2 rounded-full hover:bg-pink-50 inline-block text-center"
            >
                トップに戻る
            </Link>
            </div>

            {/* 右側質問エリア */}
            <div
            ref={chatRef}
            className="bg-[#FFE8E8] p-6 rounded-md w-[500px] overflow-y-auto max-h-[600px] transition-all"
            >
            <div className="mb-4 bg-[#FFBEBE] p-2 rounded font-bold text-black">最初に、あなたのことを教えてね！</div>

            {currentStep >= 1 && (
                <div className="mb-2">
                <div className="bg-[#FFBEBE] px-2 py-1 inline-block rounded font-bold text-black">年齢は？</div>
                <div className="mt-2 flex gap-4 flex-wrap">
                    {[10, 20, 30, 40, 50, 60, 70].map(opt => (
                    <button
                        key={opt}
                        onClick={() => {
                        setAge(opt);
                        if (currentStep === 1) setTimeout(() => setCurrentStep(2), 800);
                        }}
                        className={`px-4 py-2 border rounded shadow bg-white text-black ${age == opt ? 'bg-gray-200' : ''} hover:bg-gray-100`}
                    >
                        {opt}代
                    </button>
                    ))}
                </div>
                </div>
            )}

            {currentStep >= 2 && (
                <div className="mb-4">
                <div className="bg-[#FFBEBE] px-2 py-1 inline-block rounded font-bold text-black">性別は？</div>
                <div className="mt-2 flex gap-4 flex-wrap">
                    {[
                    { label: '男性', value: 'male' },
                    { label: '女性', value: 'female' },
                    { label: 'その他', value: 'other' }
                    ].map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => {
                        setGender(opt.value);
                        if (currentStep === 2) setTimeout(() => setCurrentStep(3), 800);
                        }}
                        className={`px-4 py-2 border rounded shadow bg-white text-black ${gender == opt.value ? 'bg-gray-200' : ''} hover:bg-gray-100`}
                    >
                        {opt.label}
                    </button>
                    ))}
                </div>
                </div>
            )}

            {currentStep >= 3 && (
                <div className="mb-4">
                <div className="bg-[#FFBEBE] px-2 py-1 inline-block rounded font-bold text-black">世帯人数は？</div>
                <div className="mt-2 flex gap-4 flex-wrap">
                    {[1, 2, 3, 4, 5].map(opt => (
                    <button
                        key={opt}
                        onClick={() => {
                        setHousehold(String(opt));
                        if (currentStep === 3) setTimeout(() => setCurrentStep(4), 800);
                        }}
                        className={`px-4 py-2 border rounded shadow bg-white text-black ${household == String(opt) ? 'bg-gray-200' : ''} hover:bg-gray-100`}
                    >
                        {opt}人
                    </button>
                    ))}
                </div>
                </div>
            )}

            {questions.map((q, index) => {
                const stepIndex = index + 4;
                return (
                currentStep >= stepIndex && (
                    <div key={q.id} className="mb-4">
                    <div className="bg-[#FFBEBE] px-2 py-1 inline-block rounded font-bold text-black">{q.question_text}</div>
                    <div className="mt-2 flex gap-4 flex-wrap">
                        {q.choices.map(choice => (
                        <button
                            key={choice.value}
                            onClick={() => {
                            handleChoice(q.id, choice.value);
                            }}
                            className={`px-4 py-2 border rounded shadow bg-white text-black ${answers[q.id] == choice.value ? 'bg-gray-200' : ''} hover:bg-gray-100`}
                        >
                            {choice.label}
                        </button>
                        ))}
                    </div>
                    </div>
                )
                );
            })}
            </div>
        </div>
        <div className="mt-6 flex flex-col items-center w-full">
            <button
            disabled={!allAnswered}
            onClick={handleSubmit}
            className={`px-8 py-2 rounded-full text-white font-bold ${luckiestGuy.className} ${
                allAnswered ? 'bg-red-500' : 'bg-gray-300'
            }`}
            >
            CHECK!
            </button>
            {errorMessage && <p className="mt-2 text-red-600">{errorMessage}</p>}
        </div>
        {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <FaSpinner className="animate-spin text-white text-4xl" />
            </div>
        )}
        </main>
    );
}
