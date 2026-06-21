"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Calendar, Search, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

export function CreatePurchaseClient({ suppliers, products, currentUserId }: any) {
  const router = useRouter()
  
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | "">("")
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [items, setItems] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return []
    const q = searchQuery.toLowerCase()
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(q) || 
      p.code.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [products, searchQuery])

  const addItem = (product: any) => {
    // Default to the first unit
    const defaultUnit = product.productUnits[0]
    if (!defaultUnit) return

    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(), // temporary id
        productId: product.id,
        productName: product.name,
        productUnits: product.productUnits,
        selectedUnitId: defaultUnit.id,
        quantity: 1,
        unitCost: 0
      }
    ])
    setSearchQuery("")
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  }, [items])

  const handleSubmit = async () => {
    if (!selectedSupplierId) {
      alert("กรุณาเลือกผู้จัดจำหน่าย")
      return
    }
    if (items.length === 0) {
      alert("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ")
      return
    }

    const hasInvalidItem = items.some(item => item.quantity <= 0 || item.unitCost < 0)
    if (hasInvalidItem) {
      alert("กรุณาตรวจสอบจำนวนและราคาต้นทุนให้ถูกต้อง")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          purchaseDate: new Date(purchaseDate).toISOString(),
          note,
          createdById: currentUserId,
          items: items.map(item => ({
            productId: item.productId,
            productUnitId: item.selectedUnitId,
            quantity: parseFloat(item.quantity),
            unitCost: parseFloat(item.unitCost)
          }))
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create purchase")
      }

      alert("บันทึกรับสินค้าสำเร็จ")
      router.push("/purchases")
      router.refresh()
    } catch (error: any) {
      alert(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
      {/* Header & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/purchases" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">สร้างใบรับสินค้าเข้า</h1>
            <p className="text-slate-500 mt-1">รับสินค้าจาก Supplier และนำเข้าสต็อก</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || items.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-md transition-all active:scale-95"
        >
          {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-5 h-5" /> บันทึกและรับของเข้าสต็อก</>}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ผู้จัดจำหน่าย (Supplier) <span className="text-red-500">*</span></label>
              <select 
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value ? Number(e.target.value) : "")}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- เลือก Supplier --</option>
                {suppliers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">วันที่รับของ</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
              <textarea 
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="เช่น เลขที่อ้างอิงบิลจาก Supplier"
              />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6 text-white">
            <h3 className="text-slate-400 mb-2 font-medium">รวมยอดสั่งซื้อ (บาท)</h3>
            <div className="text-4xl font-black">{formatBaht(total)}</div>
            <p className="text-sm text-slate-400 mt-2">ยอดรวมนี้ใช้สำหรับอ้างอิงเท่านั้น (ระบบไม่สร้างหนี้ AP)</p>
          </div>
        </div>

        {/* Right Panel: Items */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="ค้นหาสินค้าที่ต้องการรับเข้า..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Search Results Dropdown */}
              {searchQuery && filteredProducts.length > 0 && (
                <div className="absolute z-10 left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                  {filteredProducts.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500">รหัส: {p.code}</p>
                      </div>
                      <Plus className="w-5 h-5 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <p>ค้นหาสินค้าด้านบนเพื่อเพิ่มรายการ</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium sticky top-0">
                  <tr>
                    <th className="p-4">สินค้า</th>
                    <th className="p-4 w-32">จำนวน</th>
                    <th className="p-4 w-32">หน่วย</th>
                    <th className="p-4 w-32 text-right">ต้นทุน/หน่วย</th>
                    <th className="p-4 w-32 text-right">รวม</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{item.productName}</p>
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                          min="1"
                        />
                      </td>
                      <td className="p-4">
                        <select 
                          value={item.selectedUnitId}
                          onChange={(e) => updateItem(item.id, "selectedUnitId", Number(e.target.value))}
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {item.productUnits.map((pu: any) => (
                            <option key={pu.id} value={pu.id}>{pu.unit.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={item.unitCost || ""}
                          onChange={(e) => updateItem(item.id, "unitCost", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right"
                          min="0"
                        />
                      </td>
                      <td className="p-4 text-right font-bold text-slate-800">
                        {formatBaht((parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0))}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
