'use client'

import  ProductTabs  from '../../components/ProductTabs'
import buttonGroupStyles from '../../components/ButtonGroup.module.css'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { M_PLUS_Rounded_1c } from 'next/font/google';

const mplusRounded = M_PLUS_Rounded_1c({
  weight: '700',
  subsets: ['latin'],
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
console.log('apiUrl:', apiUrl);

export default function Home() {
  const params = useParams();
  const receptionId = parseInt(params.receptionId as string, 10);
  const [isCallingSales, setIsCallingSales] = useState(false)
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCallSales = async () => {
    try {
      setIsCallingSales(true)
      const uuid = localStorage.getItem('tablet_uuid')
      const frontend_url = window.location.href

      await axios.post(`${apiUrl}/call_sales`, {
        reception_id: receptionId,
        uuid,
        frontend_url,
      })
    } catch {
      alert('店員呼出しに失敗しました')
      setIsCallingSales(false)
    }
  }

  return (
    <>
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-2 relative">
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setIsMenuOpen(prev => !prev)}
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className={`${mplusRounded.className} text-3xl font-bold text-center flex-1`}>REVIEW</h1>
        {isMenuOpen && (
          <div className="absolute top-full left-4 bg-white border rounded-md shadow-lg z-50">
            <button
              className="block px-4 py-2 text-left w-full text-gray-700 hover:bg-gray-100"
              onClick={() => router.push('/')}
            >トップに戻る</button>
          </div>
        )}
      </header>
      <main>
        {isCallingSales && (
          <h2 style={{ textAlign: 'center', color: 'red' }}>
            店員呼出し中です。お待ちください・・・
          </h2>
        )}
        <ProductTabs />
        <footer className={buttonGroupStyles.footer}>
          <button
            className={`${buttonGroupStyles.btnCommon} ${buttonGroupStyles.btnReturn}`}
            onClick={() => {
              localStorage.removeItem(`recommendation_${receptionId}`)
              router.push('/')
            }}
          >
            トップに戻る
          </button>
          <button
            className={`${buttonGroupStyles.btnCommon} ${buttonGroupStyles.btnReset}`}
            onClick={() => {
              localStorage.removeItem(`recommendation_${receptionId}`)
              const categoryId = localStorage.getItem("category_id");
              if (categoryId) {
                router.push(`/chat/${categoryId}`);
              } else {
                alert("カテゴリ取得に失敗したのでトップに戻ってください");
              }
            }}
          >
            再入力
          </button>
          <button className={`${buttonGroupStyles.btnCommon} ${buttonGroupStyles.btnDiagnose}`} onClick={handleCallSales}>
            店員を呼ぶ
          </button>
        </footer>
      </main>
    </>
  )
}