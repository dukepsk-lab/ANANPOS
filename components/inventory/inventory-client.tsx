"use client"

import { useState, useMemo } from "react"
import { Search, AlertTriangle, X, Package, History } from "lucide-react"

export function InventoryClient({ products, categories }: { products: any[], categories: any[] }) {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<number | "ALL">("ALL")
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.includes(search) || p.code.includes(search)
      const matchCat = catFilter === "ALL" || p.categoryId === catFilter
      return matchSearch && matchCat
    })
  }, [products, search, catFilter])

  const openHistory = async (product: any) => {
    setSelectedProduct(product)
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/products/${product.id}/movements`)
      if (res.ok) {
        const data = await res.json()
        setMovements(data)
      } else {
        setMovements([])
      }
    } catch (e) {
      console.error(e)
      setMovements([])
    } finally {
      setLoadingHistory(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสินค้า หรือรหัส..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <select 
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium text-slate-700"
        >
          <option value="ALL">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
              <th className="p-4 font-semibold whitespace-nowrap">รหัส</th>
              <th className="p-4 font-semibold whitespace-nowrap">ชื่อสินค้า</th>
              <th className="p-4 font-semibold whitespace-nowrap">หมวดหมู่</th>
              <th className="p-4 font-semibold text-right whitespace-nowrap">คงเหลือ (หน่วยพื้นฐาน)</th>
              <th className="p-4 font-semibold text-right whitespace-nowrap">จุดสั่งซื้อ</th>
              <th className="p-4 font-semibold whitespace-nowrap">สถานะ</th>
              <th className="p-4 font-semibold text-center whitespace-nowrap">ประวัติ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const qty = p.stockBalance?.quantityOnHand || 0
              const isLow = qty <= p.reorderPoint

              return (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500">{p.code}</td>
                  <td className="p-4 font-bold text-slate-800">{p.name}</td>
                  <td className="p-4 text-slate-600">{p.category?.name || '-'}</td>
                  <td className={`p-4 text-right font-bold text-lg ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                    {qty} {p.baseUnit.name}
                  </td>
                  <td className="p-4 text-right text-slate-500">
                    {p.reorderPoint}
                  </td>
                  <td className="p-4">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold shadow-sm">
                        <AlertTriangle className="w-4 h-4" />
                        ใกล้หมด
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold shadow-sm">
                        <Package className="w-4 h-4" />
                        ปกติ
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => openHistory(p)}
                      className="p-3 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="ดูประวัติความเคลื่อนไหว"
                    >
                      <History className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 text-lg">
                  ไม่พบรายการสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over History */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex justify-end backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">ประวัติสต็อก</h2>
                <p className="text-slate-500 mt-1 font-medium">{selectedProduct.name}</p>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-3 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center text-slate-500 py-12 font-medium bg-white rounded-2xl border border-slate-200">
                  ยังไม่มีประวัติความเคลื่อนไหว
                </div>
              ) : (
                <div className="space-y-4">
                  {movements.map((m: any) => {
                    const isOut = m.type === 'SALE' || m.type === 'ADJUST_OUT' || m.type === 'WRITEOFF'
                    return (
                      <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${isOut ? 'bg-red-500' : 'bg-green-500'}`} />
                        <div className="flex justify-between items-start mb-3 pl-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${isOut ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {m.type}
                          </span>
                          <span className="text-sm text-slate-500 font-medium">
                            {new Date(m.createdAt).toLocaleString('th-TH')}
                          </span>
                        </div>
                        <div className="flex justify-between items-end pl-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-700">อ้างอิง: <span className="text-slate-900">{m.referenceDoc || '-'}</span></p>
                            <p className="text-xs text-slate-500">โดย: {m.user?.name || '-'}</p>
                          </div>
                          <div className={`text-2xl font-black ${isOut ? 'text-red-600' : 'text-green-600'}`}>
                            {isOut ? '-' : '+'}{m.quantity} <span className="text-sm font-medium text-slate-500">{selectedProduct.baseUnit.name}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
