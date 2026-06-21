"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { FileText, Receipt, User } from "lucide-react"

type ProcessedCustomer = {
  id: number
  name: string
  phone: string
  balance: number
  creditLimit: number
  creditTermDays: number
  unpaidBillsCount: number
  oldestSaleDate: Date | null
  overdueDays: number
}

export function ArClient({ customers }: { customers: ProcessedCustomer[] }) {
  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
            <tr>
              <th className="p-4">ชื่อลูกค้า</th>
              <th className="p-4">เบอร์โทร</th>
              <th className="p-4 text-right">ยอดค้าง (บาท)</th>
              <th className="p-4 text-right">วงเงิน (บาท)</th>
              <th className="p-4 text-center">บิลค้าง</th>
              <th className="p-4 text-center">ค้างนานสุด</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => {
              const isOverdue = c.oldestSaleDate && c.overdueDays > c.creditTermDays
              const isNearLimit = c.creditLimit > 0 && c.balance > c.creditLimit * 0.8
              const isOverLimit = c.creditLimit > 0 && c.balance >= c.creditLimit

              return (
                <tr 
                  key={c.id} 
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    isOverdue || isOverLimit ? "bg-red-50 hover:bg-red-100" : isNearLimit ? "bg-orange-50 hover:bg-orange-100" : ""
                  )}
                >
                  <td className="p-4 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", isOverdue || isOverLimit ? "bg-red-500" : isNearLimit ? "bg-orange-500" : "bg-green-500")} />
                      {c.name}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{c.phone}</td>
                  <td className={cn("p-4 text-right font-bold", isOverLimit ? "text-red-600" : "text-slate-800")}>
                    {formatBaht(c.balance)}
                  </td>
                  <td className="p-4 text-right text-slate-500">
                    {c.creditLimit > 0 ? formatBaht(c.creditLimit) : "ไม่จำกัด"}
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn("px-2 py-1 rounded-full text-sm", c.unpaidBillsCount > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>
                      {c.unpaidBillsCount} บิล
                    </span>
                  </td>
                  <td className={cn("p-4 text-center font-medium", isOverdue ? "text-red-600" : "text-slate-600")}>
                    {c.oldestSaleDate ? `${c.overdueDays} วัน` : "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Link 
                        href={`/ar/customers/${c.id}`}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger"
                        title="ดูรายละเอียด"
                      >
                        <User className="w-5 h-5" />
                      </Link>
                      <Link 
                        href={`/ar/invoices/new?customerId=${c.id}`}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors tooltip-trigger"
                        title="วางบิล"
                      >
                        <FileText className="w-5 h-5" />
                      </Link>
                      <Link 
                        href={`/ar/payments/new?customerId=${c.id}`}
                        className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip-trigger"
                        title="รับชำระ"
                      >
                        <Receipt className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  ไม่มีข้อมูลลูกหนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
