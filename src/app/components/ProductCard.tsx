import { RadarChart } from './RadarChart'
import styles from './ProductCard.module.css'

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
}


export const ProductCard = ({ product }: { product: ProductData }) => (
    <div className={styles.card}>
      <h2>{product.name}</h2>
      <p className={styles.price}>価格: {product.price} 円</p>
      <p>ブランド: {product.brand}</p>
      <p>カテゴリ: {product.category}</p>
      <p>
        サイズ: 幅 {product.dimensions.width}mm × 奥行 {product.dimensions.depth}mm × 高さ {product.dimensions.height}mm
      </p>
      <p className={styles.description}>{product.description}</p>
      <div className={styles.actions}>
        <button>トップに戻る</button>
        <button>再入力</button>
        <button>店員を呼ぶ</button>
      </div>
    </div>
  ) 