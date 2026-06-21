"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Calendar, Printer } from "lucide-react"
import { addDays, format } from "date-fns"

export function CreateInvoiceClient({ customers, defaultCustomerId, currentUserId }: any) {
  const router = useRouter()
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">(defaultCustomerId || "")
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const [selectedSaleIds, setSelectedSaleIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCustomer = useMemo(() => {
    return customers.find((c: any) => c.id === selectedCustomerId)
  }, [customers, selectedCustomerId])

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const toggleSale = (id: number) => {
    setSelectedSaleIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedCustomer) {
      if (selectedSaleIds.length === selectedCustomer.sales.length) {
        setSelectedSaleIds([])
      } else {
        setSelectedSaleIds(selectedCustomer.sales.map((s: any) => s.id))
      }
    }
  }

  const totalAmount = useMemo(() => {
    if (!selectedCustomer) return 0
    return selectedCustomer.sales
      .filter((s: any) => selectedSaleIds.includes(s.id))
      .reduce((sum: number, s: any) => sum + (s.grandTotal - s.paidAmount), 0)
  }, [selectedCustomer, selectedSaleIds])

  const handleSubmit = async () => {
    if (!selectedCustomerId || selectedSaleIds.length === 0) {
      alert("กรุณาเลือกลูกค้าและบิลอย่างน้อย 1 รายการ")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          saleIds: selectedSaleIds,
          invoiceDate: new Date(invoiceDate).toISOString(),
          dueDate: new Date(dueDate).toISOString(),
          createdById: currentUserId
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create invoice")
      }

      const invoice = await res.json()
      alert("สร้างใบวางบิลสำเร็จ เลขที่: " + invoice.invoiceNo)
      router.push(`/ar/invoices/${invoice.id}`)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
      {/* Header & Back */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/ar" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">สร้างใบวางบิลใหม่</h1>
            <p className="text-slate-500 mt-1">เลือกลูกค้าและรายการบิลค้างชำระเพื่อวางบิล</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || selectedSaleIds.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-md transition-all active:scale-95"
        >
          {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-5 h-5" /> ยืนยันการสร้างใบวางบิล</>}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ลูกค้า</label>
              <select 
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value ? Number(e.target.value) : "")
                  setSelectedSaleIds([])
                }}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.sales.length} บิลค้าง)</option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ยอดค้างปัจจุบัน:</span>
                  <span className="font-bold text-red-600">฿{formatBaht(selectedCustomer.balance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">เครดิตเทอม:</span>
                  <span className="font-medium text-slate-800">{selectedCustomer.creditTermDays} วัน</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">วันที่วางบิล</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">วันครบกำหนดชำระ</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">สรุปยอดวางบิล</h3>
            <div className="flex justify-between items-end">
              <span className="text-blue-700">เลือกแล้ว {selectedSaleIds.length} บิล</span>
              <span className="text-3xl font-black text-blue-700">฿{formatBaht(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Bills Table */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
            <h2 className="font-bold text-slate-800">เลือกรายการบิลค้างชำระ</h2>
            {selectedCustomer && selectedCustomer.sales.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800">
                <input 
                  type="checkbox" 
                  checked={selectedSaleIds.length === selectedCustomer.sales.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                เลือกทั้งหมด
              </label>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {!selectedCustomer ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <p>กรุณาเลือกลูกค้าทางด้านซ้าย</p>
              </div>
            ) : selectedCustomer.sales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <p>ไม่มีบิลค้างชำระสำหรับลูกค้ารายนี้</p>
              </div>
            ) : (
              <table className="w-full text-left relative">
                <thead className="bg-white border-b border-slate-100 text-slate-500 font-medium sticky top-0 z-10">
                  <tr>
                    <th className="p-4 w-12"></th>
                    <th className="p-4">วันที่ทำรายการ</th>
                    <th className="p-4">เลขที่บิล</th>
                    <th className="p-4 text-right">ยอดค้าง (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedCustomer.sales.map((s: any) => {
                    const remaining = s.grandTotal - s.paidAmount
                    const isSelected = selectedSaleIds.includes(s.id)
                    return (
                      <tr 
                        key={s.id} 
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/50" : ""}`}
                        onClick={() => toggleSale(s.id)}
                      >
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSale(s.id)}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-4 text-slate-600">{new Date(s.saleDate).toLocaleDateString('th-TH')}</td>
                        <td className="p-4 font-medium text-slate-800">{s.billNo}</td>
                        <td className="p-4 text-right font-bold text-slate-800">{formatBaht(remaining)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
