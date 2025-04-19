import styles from './ProductCard.module.css'
import Image from 'next/image'
import { RadarChart } from './RadarChart'

export type ProductData = {
  id: number
  name: string
  brand: string
  price: string
  dimensions: {
    width: number
    depth: number
    height: number
  }
  description: string
  category: string
  image?: string
  scores: Record<number, number> // 👈 商品ごとのスコア（metrics_idベース）
}

export const ProductCard = ({
  product,
  scores, 
  metricIdToName, // ✅ ユーザースコア（比較対象）
}: {
  product: ProductData
  scores: Record<number, number>
  metricIdToName: Record<number, string>
}) => (
  <div className={styles.card}>
    {/* ▼ 2カラムレイアウトにする親要素 */}
    <div className={styles.columns}>
      {/* ▼ レーダーチャート部分 */}
      <div className={styles.chartContainer}>
        <RadarChart
          scores={scores}           // ← ユーザーのスコア
          products={[product]}      // ← この商品だけを比較対象として渡す
          metricIdToName={metricIdToName}
        />
      </div>
      {/* ▼ 商品情報（テキスト部分） */}
      <div className={styles.productInfo}>
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            width={165}
            height={165}
            style={{ objectFit: 'contain', marginBottom: '8px' }}
          />
        )}
        <h2>{product.name}</h2>
        <p className={styles.price}>価格: {product.price} 円</p>
        <p>ブランド: {product.brand}</p>
        <p>カテゴリ: {product.category}</p>
        <p>
          サイズ: 幅 {product.dimensions.width}mm × 奥行 {product.dimensions.depth}mm × 高さ {product.dimensions.height}mm
        </p>
        <p className={styles.description}>{product.description}</p>
      </div>
    </div>
  </div>
)

