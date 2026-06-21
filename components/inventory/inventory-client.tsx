"use client"

import { useState, useMemo } from "react"
import { Search, AlertTriangle, X, Package, History } from "lucide-react"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

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
    <div className="card overflow-hidden p-0">
      {/* Toolbar */}
      <div className="p-3 border-b border-border bg-slate-50 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า หรือรหัส..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="select w-auto"
        >
          <option value="ALL">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table>
        <THead>
          <tr>
            <TH>รหัส</TH>
            <TH>ชื่อสินค้า</TH>
            <TH>หมวดหมู่</TH>
            <TH className="text-right">คงเหลือ (หน่วยพื้นฐาน)</TH>
            <TH className="text-right">จุดสั่งซื้อ</TH>
            <TH>สถานะ</TH>
            <TH className="text-center">ประวัติ</TH>
          </tr>
        </THead>
        <TBody>
          {filteredProducts.map((p) => {
            const qty = p.stockBalance?.quantityOnHand || 0
            const isLow = qty <= p.reorderPoint

            return (
              <TR key={p.id}>
                <TD className="text-slate-500">{p.code}</TD>
                <TD className="font-semibold text-slate-800">{p.name}</TD>
                <TD className="text-slate-600">{p.category?.name || '-'}</TD>
                <TD className={`text-right font-semibold ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                  {qty} {p.baseUnit.name}
                </TD>
                <TD className="text-right text-slate-500">
                  {p.reorderPoint}
                </TD>
                <TD>
                  {isLow ? (
                    <Badge variant="danger">
                      <AlertTriangle className="w-3 h-3" />
                      ใกล้หมด
                    </Badge>
                  ) : (
                    <Badge variant="success">
                      <Package className="w-3 h-3" />
                      ปกติ
                    </Badge>
                  )}
                </TD>
                <TD className="text-center">
                  <button
                    onClick={() => openHistory(p)}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                    title="ดูประวัติความเคลื่อนไหว"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </TD>
              </TR>
            )
          })}
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan={7}>
                <EmptyState icon={Package} title="ไม่พบรายการสินค้า" />
              </td>
            </tr>
          )}
        </TBody>
      </Table>

      {/* Slide-over History */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-lg flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-base font-heading font-bold text-slate-800">ประวัติสต็อก</h2>
                <p className="text-sm text-slate-500 mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-slate-200 rounded-md transition-colors bg-white shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : movements.length === 0 ? (
                <EmptyState icon={History} title="ยังไม่มีประวัติความเคลื่อนไหว" />
              ) : (
                <div className="space-y-2">
                  {movements.map((m: any) => {
                    const isOut = m.type === 'SALE' || m.type === 'ADJUST_OUT' || m.type === 'WRITEOFF'
                    return (
                      <div key={m.id} className="card p-3 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOut ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <Badge variant={isOut ? "danger" : "success"}>
                            {m.type}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(m.createdAt).toLocaleString('th-TH')}
                          </span>
                        </div>
                        <div className="flex justify-between items-end pl-2">
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-slate-700">อ้างอิง: <span className="text-slate-900">{m.referenceDoc || '-'}</span></p>
                            <p className="text-xs text-slate-500">โดย: {m.user?.name || '-'}</p>
                          </div>
                          <div className={`text-lg font-bold ${isOut ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isOut ? '-' : '+'}{m.quantity} <span className="text-xs font-medium text-slate-500">{selectedProduct.baseUnit.name}</span>
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
