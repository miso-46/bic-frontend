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
  const [showCallButton, setShowCallButton] = useState(false)
  const [isCallingSales, setIsCallingSales] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uuid = localStorage.getItem('tablet_uuid')
      if (uuid) {
        setShowCallButton(true)
      }
    }
  }, [])

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
    <main>
      <h1 className={`${mplusRounded.className} text-3xl font-bold`} style={{ textAlign: 'center', margin: '20px' }}>
        REVIEW
      </h1>
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
        {showCallButton && (
          <button className={`${buttonGroupStyles.btnCommon} ${buttonGroupStyles.btnDiagnose}`} onClick={handleCallSales}>
            店員を呼ぶ
          </button>
        )}
      </footer>
    </main>
  )
}