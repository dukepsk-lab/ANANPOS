"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Receipt, Edit } from "lucide-react"

export function CustomerDetailClient({ customer }: any) {
  const [activeTab, setActiveTab] = useState("unpaid")
  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const unpaidSales = customer.sales.filter((s: any) => s.status === "UNPAID" || s.status === "PARTIAL")

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Back */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/ar" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{customer.name}</h1>
            <p className="text-slate-500 mt-1">รายละเอียดลูกหนี้ และประวัติการทำรายการ</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition-colors">
            <Edit className="w-4 h-4" /> แก้ไขข้อมูล
          </button>
          <Link href={`/ar/invoices/new?customerId=${customer.id}`} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium shadow-sm transition-colors">
            <FileText className="w-4 h-4" /> วางบิล
          </Link>
          <Link href={`/ar/payments/new?customerId=${customer.id}`} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium shadow-sm transition-colors">
            <Receipt className="w-4 h-4" /> รับชำระ
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex gap-8">
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">เบอร์โทรติดต่อ</p>
          <p className="font-medium text-slate-800">{customer.phone || "-"}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">ที่อยู่</p>
          <p className="font-medium text-slate-800 line-clamp-2">{customer.address || "-"}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">ประเภทราคา</p>
          <p className="font-medium text-slate-800">{customer.priceTier === "CONTRACTOR" ? "ช่างรับเหมา" : "ขายปลีก"}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">เงื่อนไขเครดิต</p>
          <p className="font-medium text-slate-800">{customer.creditTermDays} วัน</p>
        </div>
        <div className="flex-1 border-l pl-8">
          <p className="text-sm text-slate-500 mb-1">ยอดค้างปัจจุบัน</p>
          <p className="text-3xl font-black text-red-600">฿{formatBaht(customer.balance)}</p>
          <p className="text-sm text-slate-500 mt-1">วงเงิน: {customer.creditLimit > 0 ? `฿${formatBaht(customer.creditLimit)}` : "ไม่จำกัด"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === "unpaid" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            onClick={() => setActiveTab("unpaid")}
          >
            บิลค้างชำระ ({unpaidSales.length})
          </button>
          <button 
            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === "sales" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            onClick={() => setActiveTab("sales")}
          >
            ประวัติการซื้อ ({customer.sales.length})
          </button>
          <button 
            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === "payments" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
            onClick={() => setActiveTab("payments")}
          >
            ประวัติการชำระ ({customer.payments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium sticky top-0">
              <tr>
                {activeTab === "payments" ? (
                  <>
                    <th className="p-4">วันที่ชำระ</th>
                    <th className="p-4">เลขที่ใบเสร็จ</th>
                    <th className="p-4">ช่องทาง</th>
                    <th className="p-4">อ้างอิงบิล</th>
                    <th className="p-4">พนักงาน</th>
                    <th className="p-4 text-right">ยอดเงิน (บาท)</th>
                  </>
                ) : (
                  <>
                    <th className="p-4">วันที่ทำรายการ</th>
                    <th className="p-4">เลขที่บิล</th>
                    <th className="p-4">ประเภท</th>
                    <th className="p-4 text-right">ยอดรวม</th>
                    <th className="p-4 text-right">ชำระแล้ว</th>
                    <th className="p-4 text-right">ค้างชำระ</th>
                    <th className="p-4 text-center">สถานะ</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab === "unpaid" && unpaidSales.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{new Date(s.saleDate).toLocaleDateString('th-TH')}</td>
                  <td className="p-4 font-medium text-slate-800">{s.billNo}</td>
                  <td className="p-4 text-slate-500">{s.paymentType}</td>
                  <td className="p-4 text-right">{formatBaht(s.grandTotal)}</td>
                  <td className="p-4 text-right text-green-600">{formatBaht(s.paidAmount)}</td>
                  <td className="p-4 text-right font-bold text-red-600">{formatBaht(s.grandTotal - s.paidAmount)}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                      ค้างชำระ
                    </span>
                  </td>
                </tr>
              ))}
              
              {activeTab === "sales" && customer.sales.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{new Date(s.saleDate).toLocaleDateString('th-TH')}</td>
                  <td className="p-4 font-medium text-slate-800">{s.billNo}</td>
                  <td className="p-4 text-slate-500">{s.paymentType}</td>
                  <td className="p-4 text-right">{formatBaht(s.grandTotal)}</td>
                  <td className="p-4 text-right text-green-600">{formatBaht(s.paidAmount)}</td>
                  <td className="p-4 text-right font-bold text-slate-800">{formatBaht(s.grandTotal - s.paidAmount)}</td>
                  <td className="p-4 text-center">
                    {s.status === "PAID" ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">ชำระครบแล้ว</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">ค้างชำระ</span>
                    )}
                  </td>
                </tr>
              ))}

              {activeTab === "payments" && customer.payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">{new Date(p.paymentDate).toLocaleDateString('th-TH')}</td>
                  <td className="p-4 font-medium text-slate-800">{p.paymentNo}</td>
                  <td className="p-4 text-slate-600">{p.method}</td>
                  <td className="p-4 text-slate-500">{p.note || "-"}</td>
                  <td className="p-4 text-slate-500">{p.createdBy?.name}</td>
                  <td className="p-4 text-right font-bold text-green-600">+{formatBaht(p.amount)}</td>
                </tr>
              ))}

              {/* Empty states */}
              {activeTab === "unpaid" && unpaidSales.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">ไม่มียอดค้างชำระ</td></tr>
              )}
              {activeTab === "sales" && customer.sales.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">ไม่มีประวัติการซื้อ</td></tr>
              )}
              {activeTab === "payments" && customer.payments.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">ไม่มีประวัติการชำระเงิน</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
