"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { FileText, Receipt, User } from "lucide-react"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

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
    <div className="card flex-1 flex flex-col overflow-hidden p-0">
      {customers.length === 0 ? (
        <EmptyState icon={User} title="ไม่มีข้อมูลลูกหนี้" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>ชื่อลูกค้า</TH>
              <TH>เบอร์โทร</TH>
              <TH className="text-right">ยอดค้าง (บาท)</TH>
              <TH className="text-right">วงเงิน (บาท)</TH>
              <TH className="text-center">บิลค้าง</TH>
              <TH className="text-center">ค้างนานสุด</TH>
              <TH className="text-center">จัดการ</TH>
            </TR>
          </THead>
          <TBody>
            {customers.map((c) => {
              const isOverdue = c.oldestSaleDate && c.overdueDays > c.creditTermDays
              const isNearLimit = c.creditLimit > 0 && c.balance > c.creditLimit * 0.8
              const isOverLimit = c.creditLimit > 0 && c.balance >= c.creditLimit

              return (
                <TR
                  key={c.id}
                  className={cn(
                    isOverdue || isOverLimit ? "bg-red-50 hover:bg-red-100" : isNearLimit ? "bg-orange-50 hover:bg-orange-100" : ""
                  )}
                >
                  <TD className="font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", isOverdue || isOverLimit ? "bg-red-500" : isNearLimit ? "bg-orange-500" : "bg-green-500")} />
                      {c.name}
                    </div>
                  </TD>
                  <TD>{c.phone}</TD>
                  <TD className={cn("text-right font-bold", isOverLimit ? "text-red-600" : "text-slate-800")}>
                    {formatBaht(c.balance)}
                  </TD>
                  <TD className="text-right text-slate-500">
                    {c.creditLimit > 0 ? formatBaht(c.creditLimit) : "ไม่จำกัด"}
                  </TD>
                  <TD className="text-center">
                    <Badge variant={c.unpaidBillsCount > 0 ? "info" : "neutral"}>
                      {c.unpaidBillsCount} บิล
                    </Badge>
                  </TD>
                  <TD className={cn("text-center font-medium", isOverdue ? "text-red-600" : "text-slate-600")}>
                    {c.oldestSaleDate ? `${c.overdueDays} วัน` : "-"}
                  </TD>
                  <TD>
                    <div className="flex justify-center gap-1">
                      <Link
                        href={`/ar/customers/${c.id}`}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-md transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <User className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/ar/invoices/new?customerId=${c.id}`}
                        className="p-1.5 text-slate-500 hover:text-accent hover:bg-orange-50 rounded-md transition-colors"
                        title="วางบิล"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/ar/payments/new?customerId=${c.id}`}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        title="รับชำระ"
                      >
                        <Receipt className="w-4 h-4" />
                      </Link>
                    </div>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
    </div>
  )
}
