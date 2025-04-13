'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { ProductCard, ProductData } from './ProductCard'
import { useParams } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type ScoreItem = {
  metricsId: number
  name: string
  score: number
}

export const ProductSwiper = () => {
  const [products, setProducts] = useState<ProductData[]>([])
  const [scores, setScores] = useState<Record<number, number>>({})
  const [metricIdToName, setMetricIdToName] = useState<Record<number, string>>({}) 
  const { receptionId } = useParams();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res1 = await fetch(`${apiUrl}/priority/${receptionId}`)
        const scoreList = await res1.json()
  
        // ✅ ここが該当箇所（修正ポイント）
        const scoreMap: Record<number, number> = {}
        const metricNameMap: Record<number, string> = {}

        scoreList.forEach((item: ScoreItem) => {
          scoreMap[item.metricsId] = item.score
          metricNameMap[item.metricsId] = item.name
        })        

        setScores(scoreMap)
        setMetricIdToName(metricNameMap)
  
        const payload = {
          receptionId: Number(receptionId),
          scores: scoreMap,
        }
  
        const res2 = await fetch(`${apiUrl}/recommend/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
  
        if (!res2.ok) throw new Error('Failed to fetch product data')
  
        const raw = await res2.json()
        console.log('API raw response:', raw)
        console.log('recommendedProducts:', raw.recommendedProducts)
  
        setProducts(raw.recommendedProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    if (receptionId) {
      fetchProducts()
    }
  }, [receptionId])

  return (
    <Swiper spaceBetween={50} slidesPerView={1}>
      {products.map((product, index) => (
        <SwiperSlide key={index}>
          <ProductCard key={product.id} product={product} scores={scores} metricIdToName={metricIdToName}  />
        </SwiperSlide>
      ))}
    </Swiper>
  )
} 