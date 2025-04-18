'use client'

import  ProductTabs  from '../../components/ProductTabs'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'

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
      <h1 style={{ textAlign: 'center', margin: '20px' }}>おすすめ商品レビュー</h1>
      {isCallingSales && (
        <h2 style={{ textAlign: 'center', color: 'red' }}>
          店員呼出し中です。お待ちください・・・
        </h2>
      )}
      <ProductTabs />
      <div className="flex justify-center gap-4 my-4">
        <button className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition-colors" onClick={() => router.push('/')}>トップに戻る</button>
        <button className="px-4 py-2 rounded-full border border-black text-black hover:bg-gray-100 transition-colors" onClick={() => {
            const categoryId = localStorage.getItem("category_id");
            if (categoryId) {
              router.push(`/chat/${categoryId}`);
            } else {
              alert("カテゴリ取得に失敗したのでトップに戻ってください");
            }
          }}>再入力</button>
        {showCallButton && (
          <button className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors" onClick={handleCallSales}>店員を呼ぶ</button>
        )}
      </div>
    </main>
  )
}