'use client'

import { ProductSwiper } from '../../components/ProductSwiper'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
console.log('apiUrl:', apiUrl);

export default function Home({ params }: { params: { receptionId: string } }) {
  const [showCallButton, setShowCallButton] = useState(false)
  const [isCallingStaff, setIsCallingStaff] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const uuid = localStorage.getItem('tablet_uuid')
      if (uuid) {
        setShowCallButton(true)
      }
    }
  }, [])

  const handleCallStaff = async () => {
    try {
      setIsCallingStaff(true)
      await axios.post(`${apiUrl}/call_staff`, {
        reception_id: params.receptionId
      })
    } catch (err) {
      alert('店員呼出しに失敗しました')
      setIsCallingStaff(false)
    }
  }

  return (
    <main>
      <h1 style={{ textAlign: 'center', margin: '20px' }}>おすすめ商品レビュー</h1>
      {isCallingStaff && (
        <h2 style={{ textAlign: 'center', color: 'red' }}>
          店員呼出し中です。お待ちください・・・
        </h2>
      )}
      <ProductSwiper />
      <div>
        <button onClick={() => router.push('/')}>トップに戻る</button>
        <button >再入力</button>
        {showCallButton && (
          <button onClick={handleCallStaff}>店員を呼ぶ</button>
        )}
      </div>
    </main>
  )
}