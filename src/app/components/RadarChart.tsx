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
  // 万一の保険：score keyがstringでもnumberに揃える
  const normalizeScores = (raw: Record<string | number, number>): Scores => {
    const normalized: Scores = {}
    for (const [key, value] of Object.entries(raw)) {
      normalized[Number(key)] = value
    }
    return normalized
  }

  const options = {
    scales: {
      r: {
        min: 3,
        // max: 5,
        ticks: {
          stepSize: 0.1,
          backdropColor: 'transparent',
          color: '#555',
          font: { size: 12 },
        },
        pointLabels: {
          font: { size: 12 },
          color: '#333',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  const datasets = [
    {
      label: '現在のスコア',
      data: metricIds.map((id) => scores[id] ?? 0),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
    ...products.map((product) => {
      const productScores = normalizeScores(product.scores)
      return {
        label: product.name,
        data: metricIds.map((id) => productScores[id] ?? 0),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    }),
  ]

  return <Radar data={{ labels, datasets }} options={options} />
}
