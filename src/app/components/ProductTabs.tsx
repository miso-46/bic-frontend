'use client'
import { Tab } from '@headlessui/react'
import { ProductSwiper } from './ProductSwiper'
import { PriorityCard } from './PriorityCard'

export default function ProductTabs() {
  return (
    <div className="w-full max-w-5xl mx-auto">
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
                おすすめの商品
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
            <ProductSwiper />
          </Tab.Panel>
          <Tab.Panel className="bg-white rounded-xl p-3">
            <PriorityCard />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
