"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Receipt, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

export function CustomerDetailClient({ customer }: any) {
  const [activeTab, setActiveTab] = useState("unpaid")
  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const unpaidSales = customer.sales.filter((s: any) => s.status === "UNPAID" || s.status === "PARTIAL")

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header & Back */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/ar" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm border border-border">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-lg font-heading font-bold text-slate-800 tracking-tight">{customer.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">รายละเอียดลูกหนี้ และประวัติการทำรายการ</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4" /> แก้ไขข้อมูล
          </Button>
          <Link href={`/ar/invoices/new?customerId=${customer.id}`}>
            <Button variant="primary">
              <FileText className="w-4 h-4" /> วางบิล
            </Button>
          </Link>
          <Link href={`/ar/payments/new?customerId=${customer.id}`}>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Receipt className="w-4 h-4" /> รับชำระ
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-4 flex gap-6">
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">เบอร์โทรติดต่อ</p>
          <p className="text-sm font-medium text-slate-800">{customer.phone || "-"}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">ที่อยู่</p>
          <p className="text-sm font-medium text-slate-800 line-clamp-2">{customer.address || "-"}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">ประเภทราคา</p>
          <p className="text-sm font-medium text-slate-800">{customer.priceTier === "CONTRACTOR" ? "ช่างรับเหมา" : "ขายปลีก"}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">เงื่อนไขเครดิต</p>
          <p className="text-sm font-medium text-slate-800">{customer.creditTermDays} วัน</p>
        </div>
        <div className="flex-1 border-l border-border pl-6">
          <p className="text-xs text-slate-500 mb-1">ยอดค้างปัจจุบัน</p>
          <p className="text-xl font-heading font-bold text-red-600">฿{formatBaht(customer.balance)}</p>
          <p className="text-xs text-slate-500 mt-0.5">วงเงิน: {customer.creditLimit > 0 ? `฿${formatBaht(customer.creditLimit)}` : "ไม่จำกัด"}</p>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex border-b border-border">
          <button
            className={cn(
              "px-4 py-2.5 font-medium text-sm transition-colors",
              activeTab === "unpaid" ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
            onClick={() => setActiveTab("unpaid")}
          >
            บิลค้างชำระ ({unpaidSales.length})
          </button>
          <button
            className={cn(
              "px-4 py-2.5 font-medium text-sm transition-colors",
              activeTab === "sales" ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
            onClick={() => setActiveTab("sales")}
          >
            ประวัติการซื้อ ({customer.sales.length})
          </button>
          <button
            className={cn(
              "px-4 py-2.5 font-medium text-sm transition-colors",
              activeTab === "payments" ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            )}
            onClick={() => setActiveTab("payments")}
          >
            ประวัติการชำระ ({customer.payments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <Table>
            <THead>
              <TR>
                {activeTab === "payments" ? (
                  <>
                    <TH>วันที่ชำระ</TH>
                    <TH>เลขที่ใบเสร็จ</TH>
                    <TH>ช่องทาง</TH>
                    <TH>อ้างอิงบิล</TH>
                    <TH>พนักงาน</TH>
                    <TH className="text-right">ยอดเงิน (บาท)</TH>
                  </>
                ) : (
                  <>
                    <TH>วันที่ทำรายการ</TH>
                    <TH>เลขที่บิล</TH>
                    <TH>ประเภท</TH>
                    <TH className="text-right">ยอดรวม</TH>
                    <TH className="text-right">ชำระแล้ว</TH>
                    <TH className="text-right">ค้างชำระ</TH>
                    <TH className="text-center">สถานะ</TH>
                  </>
                )}
              </TR>
            </THead>
            <TBody>
              {activeTab === "unpaid" && unpaidSales.map((s: any) => (
                <TR key={s.id}>
                  <TD>{new Date(s.saleDate).toLocaleDateString('th-TH')}</TD>
                  <TD className="font-medium text-slate-800">{s.billNo}</TD>
                  <TD className="text-slate-500">{s.paymentType}</TD>
                  <TD className="text-right">{formatBaht(s.grandTotal)}</TD>
                  <TD className="text-right text-emerald-600">{formatBaht(s.paidAmount)}</TD>
                  <TD className="text-right font-bold text-red-600">{formatBaht(s.grandTotal - s.paidAmount)}</TD>
                  <TD className="text-center">
                    <Badge variant="danger">ค้างชำระ</Badge>
                  </TD>
                </TR>
              ))}

              {activeTab === "sales" && customer.sales.map((s: any) => (
                <TR key={s.id}>
                  <TD>{new Date(s.saleDate).toLocaleDateString('th-TH')}</TD>
                  <TD className="font-medium text-slate-800">{s.billNo}</TD>
                  <TD className="text-slate-500">{s.paymentType}</TD>
                  <TD className="text-right">{formatBaht(s.grandTotal)}</TD>
                  <TD className="text-right text-emerald-600">{formatBaht(s.paidAmount)}</TD>
                  <TD className="text-right font-bold text-slate-800">{formatBaht(s.grandTotal - s.paidAmount)}</TD>
                  <TD className="text-center">
                    {s.status === "PAID" ? (
                      <Badge variant="success">ชำระครบแล้ว</Badge>
                    ) : (
                      <Badge variant="danger">ค้างชำระ</Badge>
                    )}
                  </TD>
                </TR>
              ))}

              {activeTab === "payments" && customer.payments.map((p: any) => (
                <TR key={p.id}>
                  <TD>{new Date(p.paymentDate).toLocaleDateString('th-TH')}</TD>
                  <TD className="font-medium text-slate-800">{p.paymentNo}</TD>
                  <TD>{p.method}</TD>
                  <TD className="text-slate-500">{p.note || "-"}</TD>
                  <TD className="text-slate-500">{p.createdBy?.name}</TD>
                  <TD className="text-right font-bold text-emerald-600">+{formatBaht(p.amount)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>

          {/* Empty states */}
          {activeTab === "unpaid" && unpaidSales.length === 0 && (
            <EmptyState title="ไม่มียอดค้างชำระ" />
          )}
          {activeTab === "sales" && customer.sales.length === 0 && (
            <EmptyState title="ไม่มีประวัติการซื้อ" />
          )}
          {activeTab === "payments" && customer.payments.length === 0 && (
            <EmptyState title="ไม่มีประวัติการชำระเงิน" />
          )}
        </div>
      </Card>
    </div>
  )
}
