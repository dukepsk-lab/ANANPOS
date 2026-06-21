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
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            id="product-search-input"
            type="text"
            placeholder="ค้นหาสินค้าด้วยชื่อ, รหัส (F1)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4 h-11 text-base"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-3 py-2 border-b border-border flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 h-9 rounded-md font-semibold text-sm transition-colors border ${
            activeCategory === null
            ? 'bg-primary border-primary text-white shadow-sm'
            : 'bg-white border-border text-slate-600 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          ทั้งหมด
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 h-9 rounded-md font-semibold text-sm transition-colors border ${
              activeCategory === cat.id
              ? 'bg-primary border-primary text-white shadow-sm'
              : 'bg-white border-border text-slate-600 hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {filteredProducts.map((p: any) => {
            const defaultUnit = p.productUnits.find((u: any) => u.isDefaultSale) || p.productUnits[0]
            const price = defaultUnit?.price || 0
            const stock = p.stockBalance?.quantityOnHand || 0
            const isLow = p.isStockItem && stock < p.reorderPoint

            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="card flex flex-col relative overflow-hidden text-left p-3 min-h-[110px] hover:border-primary/40 hover:shadow-md transition-all"
              >
                {isLow && (
                  <div className="absolute top-0 right-0 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-md shadow-sm">
                    ใกล้หมด
                  </div>
                )}
                <span className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">{p.code}</span>
                <span className="font-heading font-semibold text-slate-800 text-sm leading-tight mb-3 flex-1">{p.name}</span>
                <div className="flex justify-between items-end mt-auto w-full">
                  <span className="text-lg font-bold text-primary">฿{price}</span>
                  {p.isStockItem && (
                    <span className={`text-xs font-semibold ${isLow ? 'text-destructive' : 'text-slate-400'}`}>
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
