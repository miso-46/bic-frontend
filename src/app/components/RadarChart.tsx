'use client'

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { useEffect, useState } from 'react'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

// 型定義（読みやすさのため明示）
type Scores = Record<number, number>
type ProductWithScores = {
  id: number
  name: string
  scores: Scores
}
type MetricIdToName = Record<number, string>

export const RadarChart = ({
  scores,
  products,
  metricIdToName,
}: {
  scores: Scores                // ユーザーのスコア（比較元）
  products: ProductWithScores[] // 商品リスト（スコアあり）
  metricIdToName: MetricIdToName // メトリクスID -> 名前
}) => {
  // 表示順の基準となる metricsId の一覧
  const metricIds = Object.keys(scores).map(Number)
  const labels = metricIds.map((id) => metricIdToName[id] ?? `指標${id}`)
  // モバイル判定
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  // 長いラベルは8文字ごとに折り返し
  const wrappedLabels = labels.map((label) => {
    if (label.length <= 8) return label
    return label.match(new RegExp(`.{1,8}`, 'g')) || [label]
  })
  // 万一の保険：score keyがstringでもnumberに揃える
  const normalizeScores = (raw: Record<string | number, number>): Scores => {
    const normalized: Scores = {}
    for (const [key, value] of Object.entries(raw)) {
      normalized[Number(key)] = value
    }
    return normalized
  }

  const options = {
    // モバイル時のタップでの表示設定
    interaction: { mode: 'nearest' as const, intersect: true },
    scales: {
      r: {
        min: 3,
        // max: 5,
        ticks: {
          display: false,
          stepSize: 0.1,
          backdropColor: 'transparent',
          color: '#555',
          font: { size: 10 },
        },
        pointLabels: {
          display: !isMobile, // モバイル時は非表示
          font: { size: 10 },
          color: '#333',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      // モバイル時のツールチップは interaction で制御し、ここでは有効/無効のみ設定
      tooltip: {
        enabled: isMobile,
        callbacks: {
          title: (items: TooltipItem<'radar'>[]) => {
            const idx = items[0].dataIndex
            return Array.isArray(labels[idx]) ? labels[idx].join('\n') : labels[idx]
          },
          label: (ctx: TooltipItem<'radar'>) => `${ctx.dataset.label}: ${ctx.parsed.r}`,
        },
      },
    },
  }

  const datasets = [
    {
      label: 'あなたのスコア',
      data: metricIds.map((id) => scores[id] ?? 0),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
    ...products.map((product) => {
      const productScores = normalizeScores(product.scores)
      return {
        label: 'おすすめの商品',
        data: metricIds.map((id) => productScores[id] ?? 0),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    }),
  ]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '250px' : '400px', // モバイル時は高さを圧縮
        padding: isMobile ? '0px' : '20px',
      }}
    >
      <Radar
        data={{ labels: wrappedLabels, datasets }}
        options={{
          ...options,
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: isMobile ? 0 : 20 },
        }}
      />
    </div>
  )
}
