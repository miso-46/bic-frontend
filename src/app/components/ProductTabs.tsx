'use client'
import { Tab } from '@headlessui/react'
import { ProductSwiper } from './ProductSwiper'
import { PriorityCard } from './PriorityCard'

export default function ProductTabs() {
  return (
    <><div className="w-full max-w-5xl mx-auto">
      <Tab.Group>
        <Tab.List className="flex w-full p-1 space-x-1 bg-red-900/20 rounded-xl">
            <Tab
                className={({ selected }) =>
                    `w-1/2 py-2.5 text-center text-sm font-medium rounded-lg transition-colors ${
                    selected
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-red-500 border border-red-500 hover:bg-red-50'
                    }`
                }
            >
                おすすめの商品レビュー
            </Tab>
            <Tab
                className={({ selected }) =>
                    `w-1/2 py-2.5 text-center text-sm font-medium rounded-lg transition-colors ${
                    selected
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-red-500 border border-red-500 hover:bg-red-50'
                    }`
                }
            >
                優先順位
            </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel className="bg-white rounded-xl p-3">
            {/* おすすめの商品レビューの内容として、既存の ProductSwiper を使用 */}
            <ProductSwiper />
          </Tab.Panel>
          <Tab.Panel className="bg-white rounded-xl p-3">
            {/* 優先順位のコンテンツ（ここは後で詳細を実装する） */}
            <h2 className="text-lg font-bold">優先順位</h2>
            <PriorityCard />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
    <div className="flex justify-center gap-4 my-4">
      <button className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition-colors">
        トップに戻る
      </button>
      <button className="px-4 py-2 rounded-full border border-black text-black hover:bg-gray-100 transition-colors">
        再入力
      </button>
      <button className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
        店員を呼ぶ
      </button>
    </div></>
  )
}
