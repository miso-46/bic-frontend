'use client'

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { ProductCard, ProductData } from './ProductCard'
import { useParams } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const ProductSwiper = () => {
  const [products, setProducts] = useState<ProductData[]>([])
  const [scores, setScores] = useState<Record<number, number>>({})
  const { receptionId } = useParams();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res1 = await fetch(`${apiUrl}/priority/${receptionId}`)
        const scoreList = await res1.json()
  
        const scores = scoreList.reduce((acc: Record<number, number>, cur: any) => {
          acc[cur.metricsId] = cur.score
          return acc
        }, {})
  
        const payload = {
          receptionId: Number(receptionId),
          scores,
        }
  
        console.log("payload:", payload)
        setScores(scores)
  
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
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
} 