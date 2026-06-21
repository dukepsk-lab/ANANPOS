"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Receipt, DollarSign, CreditCard, Ban } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"

const formatBaht = (amount: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

export function DailyReportClient({ initialDate, sales, summary, userRole }: any) {
  const router = useRouter()
  const [date, setDate] = useState(initialDate)
  const [voidingId, setVoidingId] = useState<number | null>(null)
  const [confirmVoidId, setConfirmVoidId] = useState<number | null>(null)
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setDate(newDate)
    router.push(`/reports/daily?date=${newDate}`)
  }

  const handleVoid = async (id: number) => {
    setVoidingId(id)
    try {
      const res = await fetch(`/api/sales/${id}/void`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to void")
      toast.success("ยกเลิกบิลสำเร็จ", { description: "สต็อกถูกคืนเข้าระบบแล้ว" })
      router.refresh()
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการยกเลิกบิล")
    } finally {
      setVoidingId(null)
      setConfirmVoidId(null)
    }
  }

  const canVoid = userRole === "OWNER" || userRole === "STAFF"

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 inline-flex items-center gap-4">
        <Calendar className="w-6 h-6 text-blue-500" />
        <input 
          type="date" 
          value={date}
          onChange={handleDateChange}
          className="text-lg font-bold text-slate-700 outline-none bg-transparent"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
            <Receipt className="w-10 h-10" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-lg">ยอดขายรวม</p>
            <p className="text-4xl font-black text-slate-800 tracking-tight">฿{formatBaht(summary.totalSales)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
            <DollarSign className="w-10 h-10" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-lg">เงินสดรับ</p>
            <p className="text-4xl font-black text-slate-800 tracking-tight">฿{formatBaht(summary.cashReceived)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
            <CreditCard className="w-10 h-10" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-lg">เงินเชื่อ (ค้างชำระ)</p>
            <p className="text-4xl font-black text-slate-800 tracking-tight">฿{formatBaht(summary.creditSales)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-5 font-bold whitespace-nowrap">เลขที่บิล</th>
                <th className="p-5 font-bold whitespace-nowrap">เวลา</th>
                <th className="p-5 font-bold whitespace-nowrap">ลูกค้า</th>
                <th className="p-5 font-bold whitespace-nowrap">ประเภท</th>
                <th className="p-5 font-bold text-right whitespace-nowrap">ยอดรวม</th>
                <th className="p-5 font-bold text-center whitespace-nowrap">สถานะ</th>
                <th className="p-5 font-bold text-center whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s: any) => {
                const isVoid = s.status === 'VOID'
                return (
                  <tr key={s.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isVoid ? 'opacity-50 bg-slate-50' : ''}`}>
                    <td className="p-5 font-bold text-slate-800">{s.billNo}</td>
                    <td className="p-5 text-slate-500 font-medium">
                      {new Date(s.saleDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </td>
                    <td className="p-5 text-slate-700 font-medium">{s.customer?.name || 'ลูกค้าทั่วไป'}</td>
                    <td className="p-5">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                        s.paymentType === 'CASH' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                        s.paymentType === 'CREDIT' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {s.paymentType}
                      </span>
                    </td>
                    <td className={`p-5 text-right font-black text-xl ${isVoid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      ฿{formatBaht(s.grandTotal)}
                    </td>
                    <td className="p-5 text-center">
                      {isVoid ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-bold border border-red-200 shadow-sm">
                          <Ban className="w-4 h-4" /> ยกเลิกแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold border border-green-200 shadow-sm">
                          สมบูรณ์
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      {!isVoid && canVoid && (
                        <button 
                          onClick={() => setConfirmVoidId(s.id)}
                          disabled={voidingId === s.id}
                          className="px-5 py-2.5 bg-white border-2 border-red-100 hover:bg-red-50 hover:border-red-200 text-red-600 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 active:scale-95"
                        >
                          {voidingId === s.id ? 'กำลังยกเลิก...' : 'ยกเลิกบิล'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 text-xl font-medium">
                    ไม่มีรายการขายในวันนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmVoidId !== null}
        title="ยืนยันการยกเลิกบิล"
        message={`ยกเลิกบิล ${sales.find((s:any) => s.id === confirmVoidId)?.billNo}? สต็อกจะถูกคืนอัตโนมัติ ไม่สามารถย้อนกลับได้`}
        confirmText="ยืนยันการยกเลิก"
        isDestructive={true}
        onCancel={() => setConfirmVoidId(null)}
        onConfirm={() => confirmVoidId && handleVoid(confirmVoidId)}
      />
    </div>
  )
}
