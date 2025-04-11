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

export const RadarChart = ({ scores }: { scores: { [key: string]: number } }) => {
  const labels = Object.keys(scores)
  const data = {
    labels,
    datasets: [
      {
        label: 'スコア',
        data: Object.values(scores),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  }

  return <Radar data={data} />
}