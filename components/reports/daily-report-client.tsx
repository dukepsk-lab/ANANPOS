"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Receipt, DollarSign, CreditCard, Ban } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import { StatCard } from "@/components/ui/stat-card"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

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
    <div className="space-y-4">
      {/* Date Picker */}
      <div className="card inline-flex items-center gap-3 p-3">
        <Calendar className="w-4 h-4 text-primary" />
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="text-sm font-semibold text-slate-700 outline-none bg-transparent"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="ยอดขายรวม" value={`฿${formatBaht(summary.totalSales)}`} icon={Receipt} tone="default" />
        <StatCard label="เงินสดรับ" value={`฿${formatBaht(summary.cashReceived)}`} icon={DollarSign} tone="success" />
        <StatCard label="เงินเชื่อ (ค้างชำระ)" value={`฿${formatBaht(summary.creditSales)}`} icon={CreditCard} tone="warning" />
      </div>

      {/* Table */}
      <Table>
        <THead>
          <TR>
            <TH>เลขที่บิล</TH>
            <TH>เวลา</TH>
            <TH>ลูกค้า</TH>
            <TH>ประเภท</TH>
            <TH className="text-right">ยอดรวม</TH>
            <TH className="text-center">สถานะ</TH>
            <TH className="text-center">จัดการ</TH>
          </TR>
        </THead>
        <TBody>
          {sales.map((s: any) => {
            const isVoid = s.status === 'VOID'
            return (
              <TR key={s.id} className={isVoid ? 'opacity-50 bg-slate-50' : ''}>
                <TD className="font-semibold text-slate-800">{s.billNo}</TD>
                <TD className="text-slate-500">
                  {new Date(s.saleDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                </TD>
                <TD className="text-slate-700">{s.customer?.name || 'ลูกค้าทั่วไป'}</TD>
                <TD>
                  <Badge variant={
                    s.paymentType === 'CASH' ? 'success' :
                    s.paymentType === 'CREDIT' ? 'warning' : 'info'
                  }>
                    {s.paymentType}
                  </Badge>
                </TD>
                <TD className={`text-right font-bold ${isVoid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  ฿{formatBaht(s.grandTotal)}
                </TD>
                <TD className="text-center">
                  {isVoid ? (
                    <Badge variant="danger">
                      <Ban className="w-3 h-3" /> ยกเลิกแล้ว
                    </Badge>
                  ) : (
                    <Badge variant="success">สมบูรณ์</Badge>
                  )}
                </TD>
                <TD className="text-center">
                  {!isVoid && canVoid && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmVoidId(s.id)}
                      disabled={voidingId === s.id}
                      className="bg-white text-destructive border border-red-200 hover:bg-red-50 shadow-none"
                    >
                      {voidingId === s.id ? 'กำลังยกเลิก...' : 'ยกเลิกบิล'}
                    </Button>
                  )}
                </TD>
              </TR>
            )
          })}
          {sales.length === 0 && (
            <TR>
              <TD colSpan={7}>
                <EmptyState title="ไม่มีรายการขายในวันนี้" />
              </TD>
            </TR>
          )}
        </TBody>
      </Table>

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
