'use client'

import { ProductSwiper } from '../../components/ProductSwiper'
import  ProductTabs  from '../../components/ProductTabs'

export default function Home() {
  return (
    <main>
      <h1 style={{ textAlign: 'center', margin: '20px' }}>おすすめ商品レビュー</h1>
      <ProductTabs />
    </main>
  )
}