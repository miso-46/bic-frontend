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
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const { receptionId } = useParams();

  useEffect(() => {
    const onResize = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    // バージョンアップしたキャッシュキーに切り替え (旧キャッシュは削除)
    const oldKey = `recommendation_${receptionId}`
    const cacheKey = `recommendation_v2_${receptionId}`
    if (typeof window !== 'undefined') {
      localStorage.removeItem(oldKey)
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const {
            products: cachedProducts,
            scores: cachedScores,
            metricIdToName: cachedMetricIdToName,
          } = JSON.parse(cached)
          setProducts(cachedProducts)
          setScores(cachedScores)
          setMetricIdToName(cachedMetricIdToName)
          return
        } catch {
          localStorage.removeItem(cacheKey)
        }
      }
    }
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
  
        // マッチ率機能を削除: 単純に推奨商品をセット
        setProducts(raw.recommendedProducts)
        // ローカルストレージにキャッシュを保存
        if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify({
            products: raw.recommendedProducts,
            scores: scoreMap,
            metricIdToName: metricNameMap,
          }))
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    if (receptionId) {
      fetchProducts()
    }
  }, [receptionId])

  return (
    <>
      <Swiper
        spaceBetween={20}
        slidesPerView={isMobile ? 1.2 : 1.2}
        centeredSlides={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {products.map((product, index) => (
          <SwiperSlide key={index}>
            <ProductCard
              key={product.id}
              product={product}
              scores={scores}
              metricIdToName={metricIdToName}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {/* ドットインジケーター */}
      <div className="flex justify-center items-center gap-1 mt-2">
        {products.map((_, idx) => (
          <span
            key={idx}
            className={`text-xl ${activeIndex === idx ? 'text-red-500' : 'text-gray-300'}`}
          >
            ●
          </span>
        ))}
      </div>
    </>
  )
} 