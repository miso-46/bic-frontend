'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { ProductCard, ProductData } from './ProductCard'

export const ProductSwiper = () => {
  const [products, setProducts] = useState<ProductData[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const scoreList = [
          { metricsId: 1, name: '部屋全体の掃除能力の高さ', score: 5.0 },
          { metricsId: 2, name: '細かい場所の掃除能力の高さ', score: 4.75 },
          { metricsId: 3, name: '水拭き性能の高さ', score: 4.5 },
          { metricsId: 4, name: 'カーペットの掃除しやすさ', score: 4.5 },
          { metricsId: 5, name: '賢さ', score: 4.5 },
          { metricsId: 6, name: 'アプリの使いやすさ', score: 5.0 },
          { metricsId: 7, name: 'ゴミの捨てやすさ', score: 4.75 },
          { metricsId: 8, name: '水拭き後のお手入れのしやすさ', score: 4.75 },
          { metricsId: 9, name: '静音性の高さ', score: 4.5 },
        ]

        const scores = scoreList.reduce((acc, cur) => {
          acc[cur.metricsId] = cur.score
          return acc
        }, {} as Record<number, number>)

        const payload = {
          receptionId: 5,
          scores,
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommend/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('Failed to fetch product data')

        const raw = await res.json()
        console.log('API raw response:', raw)
        console.log('recommendedProducts:', raw.recommendedProducts)
            
        setProducts(raw.recommendedProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  return (
    <Swiper spaceBetween={50} slidesPerView={1}>
      {products.map((product, index) => (
        <SwiperSlide key={index}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
} 
