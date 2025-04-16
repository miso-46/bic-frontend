'use client'

import { ProductSwiper } from '../../components/ProductSwiper'
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
    } catch (err) {
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
      <ProductSwiper />
      <div>
        <button onClick={() => router.push('/')}>トップに戻る</button>
        <button >再入力</button>
        {showCallButton && (
          <button onClick={handleCallSales}>店員を呼ぶ</button>
        )}
      </div>
    </main>
  )
}