"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search, Save, PackageMinus } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function CreateReturnClient({ currentUserId }: { currentUserId: number }) {
  const router = useRouter()
  const [billNo, setBillNo] = useState("")
  const [sale, setSale] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  const [returnItems, setReturnItems] = useState<any[]>([])
  const [reason, setReason] = useState("CUSTOMER_RETURN")
  const [refundMethod, setRefundMethod] = useState("CASH")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const searchSale = async () => {
    if (!billNo) return
    setIsSearching(true)
    setError("")
    setSale(null)
    setReturnItems([])

    try {
      const res = await fetch(`/api/sales/search?billNo=${billNo}`)
      if (!res.ok) throw new Error("ไม่พบบิลนี้ในระบบ")
      
      const data = await res.json()
      setSale(data)
      // Initialize return items structure (default 0 quantity to return)
      setReturnItems(data.items.map((item: any) => ({
        ...item,
        returnQty: 0,
        restock: true
      })))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSearching(false)
    }
  }

  const updateReturnQty = (itemId: number, qty: string) => {
    const num = parseFloat(qty) || 0
    setReturnItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // limit to max purchased qty
        const val = Math.min(Math.max(0, num), item.quantity)
        return { ...item, returnQty: val }
      }
      return item
    }))
  }

  const toggleRestock = (itemId: number) => {
    setReturnItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, restock: !item.restock } : item
    ))
  }

  const totalRefund = returnItems.reduce((sum, item) => sum + (item.returnQty * item.unitPrice), 0)

  const handlePreSubmit = () => {
    const itemsToReturn = returnItems.filter(item => item.returnQty > 0)
    if (itemsToReturn.length === 0) {
      toast.warning("กรุณาระบุจำนวนสินค้าที่ต้องการคืนอย่างน้อย 1 รายการ")
      return
    }
    setIsConfirmOpen(true)
  }

  const handleSubmit = async () => {
    const itemsToReturn = returnItems.filter(item => item.returnQty > 0)

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalSaleId: sale.id,
          customerId: sale.customerId || null, // Ensure customer is mapped
          returnDate: new Date().toISOString(),
          reason,
          totalRefund,
          refundMethod,
          note,
          createdById: currentUserId,
          items: itemsToReturn.map(item => ({
            productId: item.productId,
            productUnitId: item.productUnitId,
            quantity: item.returnQty,
            quantityBase: item.returnQty * item.productUnit.conversionRate,
            restock: item.restock,
            unitPrice: item.unitPrice
          }))
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create return")
      }

      toast.success("บันทึกการรับคืนสินค้าสำเร็จ")
      router.push("/returns")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/returns" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">สร้างรายการรับคืน</h1>
            <p className="text-slate-500 mt-1">ค้นหาบิลและระบุรายการสินค้าที่ลูกค้านำมาคืน</p>
          </div>
        </div>
        
        <button 
          onClick={handlePreSubmit}
          disabled={isSubmitting || totalRefund === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-md transition-all active:scale-95"
        >
          {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-5 h-5" /> ยืนยันการรับคืน</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">ค้นหาจากเลขที่บิลขาย (Bill No)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={billNo}
              onChange={e => setBillNo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchSale()}
              placeholder="เช่น INV-260618-0001"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button 
          onClick={searchSale}
          disabled={isSearching || !billNo}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold rounded-xl h-[52px]"
        >
          {isSearching ? "กำลังค้นหา..." : "ค้นหาบิล"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
          {error}
        </div>
      )}

      {sale && (
        <div className="grid grid-cols-3 gap-6">
          {/* Items */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-320px)] overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <PackageMinus className="w-5 h-5" /> สินค้าในบิล {sale.billNo}
              </h2>
              <span className="text-sm font-medium text-slate-500">
                ลูกค้า: {sale.customer?.name || "ขาจรทั่วไป"}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium text-sm">
                  <tr>
                    <th className="p-4">รายการสินค้า</th>
                    <th className="p-4 text-center">ซื้อไป</th>
                    <th className="p-4 text-center w-32">จำนวนที่คืน</th>
                    <th className="p-4 text-center">คืนเข้าสต็อก?</th>
                    <th className="p-4 text-right">ยอดคืน (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnItems.map(item => (
                    <tr key={item.id} className={item.returnQty > 0 ? "bg-blue-50/50" : ""}>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{item.product.name}</p>
                        <p className="text-xs text-slate-500">
                          ราคา: {formatBaht(item.unitPrice)} / {item.productUnit.unit.name}
                        </p>
                      </td>
                      <td className="p-4 text-center text-slate-600 font-medium">
                        {item.quantity}
                      </td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          value={item.returnQty || ""}
                          onChange={(e) => updateReturnQty(item.id, e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold"
                          min="0"
                          max={item.quantity}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <label className="flex items-center justify-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={item.restock}
                            onChange={() => toggleRestock(item.id)}
                            disabled={item.returnQty === 0}
                            className="w-5 h-5 rounded text-blue-600"
                          />
                          <span className={`text-sm ${item.restock ? "text-slate-700" : "text-red-500"}`}>
                            {item.restock ? "รับเข้าสต็อก" : "ของเสีย/ทิ้ง"}
                          </span>
                        </label>
                      </td>
                      <td className="p-4 text-right font-bold text-blue-600">
                        {formatBaht(item.returnQty * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Return Info */}
          <div className="col-span-1 space-y-6">
            <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6 text-white">
              <h3 className="text-slate-400 mb-2 font-medium">ยอดรวมที่ต้องคืนเงิน (บาท)</h3>
              <div className="text-4xl font-black text-blue-400">{formatBaht(totalRefund)}</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เหตุผลการคืน</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CUSTOMER_RETURN">ลูกค้าขอเปลี่ยน/คืน</option>
                  <option value="DAMAGED">สินค้าชำรุดเสียหาย</option>
                  <option value="WRONG_ITEM">ร้านจ่ายสินค้าผิด</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วิธีคืนเงิน</label>
                <select 
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">คืนเป็นเงินสด</option>
                  {sale.customer && <option value="CREDIT_NOTE">ลดยอดค้างชำระ (Credit Note)</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ</label>
                <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="ยืนยันการรับคืนสินค้า"
        message={`ต้องการบันทึกการรับคืน หรือตัดของเสียใช่หรือไม่? จะไม่สามารถย้อนกลับได้`}
        confirmText="ยืนยันบันทึก"
        isDestructive={false}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleSubmit}
      />
    </div>
  )
}
