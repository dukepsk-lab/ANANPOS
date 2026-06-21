"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"

export function ProductSearch({ products, categories, onSelectProduct }: any) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchSearch = p.name.includes(search) || p.code.includes(search)
      const matchCat = activeCategory ? p.categoryId === activeCategory : true
      return matchSearch && matchCat
    })
  }, [products, search, activeCategory])

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
          <input 
            id="product-search-input"
            type="text" 
            placeholder="ค้นหาสินค้าด้วยชื่อ, รหัส (F1)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-12 pr-4 py-4 text-lg"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-6 py-2.5 rounded-xl font-bold text-lg transition-all border-2 ${
            activeCategory === null 
            ? 'bg-primary border-primary text-white shadow-md' 
            : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          ทั้งหมด
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 rounded-xl font-bold text-lg transition-all border-2 ${
              activeCategory === cat.id 
              ? 'bg-primary border-primary text-white shadow-md' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredProducts.map((p: any) => {
            const defaultUnit = p.productUnits.find((u: any) => u.isDefaultSale) || p.productUnits[0]
            const price = defaultUnit?.price || 0
            const stock = p.stockBalance?.quantityOnHand || 0
            const isLow = p.isStockItem && stock < p.reorderPoint

            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="card flex flex-col relative overflow-hidden text-left p-5 min-h-[140px]"
              >
                {isLow && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                    ใกล้หมด
                  </div>
                )}
                <span className="text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-wider">{p.code}</span>
                <span className="font-heading font-bold text-slate-800 text-lg leading-tight mb-4 flex-1">{p.name}</span>
                <div className="flex justify-between items-end mt-auto w-full">
                  <span className="text-2xl font-black text-primary">฿{price}</span>
                  {p.isStockItem && (
                    <span className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-slate-400'}`}>
                      เหลือ {stock}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
