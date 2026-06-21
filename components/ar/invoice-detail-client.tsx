"use client"

import Link from "next/link"
import { ArrowLeft, Printer, Receipt } from "lucide-react"

export function InvoiceDetailClient({ invoice }: { invoice: any }) {
  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
      {/* Header & Actions (Hidden in Print) */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/ar" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">ใบวางบิล {invoice.invoiceNo}</h1>
            <p className="text-slate-500 mt-1">รายละเอียดใบวางบิลและประวัติการชำระเงิน</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> พิมพ์เอกสาร
          </button>
          {invoice.status !== "PAID" && (
            <Link 
              href={`/ar/payments/new?customerId=${invoice.customerId}&invoiceId=${invoice.id}`} 
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium shadow-sm transition-colors"
            >
              <Receipt className="w-4 h-4" /> รับชำระเงิน
            </Link>
          )}
        </div>
      </div>

      {/* A4 Printable Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 print:p-0 print:border-none print:shadow-none mx-auto w-full max-w-[210mm] min-h-[297mm]">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">ใบวางบิล / INVOICE</h2>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="font-bold text-slate-800 text-lg">{invoice.customer.name}</p>
            <p className="text-slate-600 mt-1">{invoice.customer.address || "ไม่ระบุที่อยู่"}</p>
            <p className="text-slate-600">โทร: {invoice.customer.phone || "-"}</p>
            {invoice.customer.taxId && <p className="text-slate-600">เลขประจำตัวผู้เสียภาษี: {invoice.customer.taxId}</p>}
          </div>
          <div className="text-right border border-slate-200 p-4 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-500">เลขที่ใบวางบิล</p>
            <p className="font-bold text-slate-800 mb-2">{invoice.invoiceNo}</p>
            
            <p className="text-sm text-slate-500">วันที่วางบิล</p>
            <p className="font-medium text-slate-800 mb-2">{new Date(invoice.invoiceDate).toLocaleDateString('th-TH')}</p>
            
            <p className="text-sm text-slate-500">วันครบกำหนด</p>
            <p className="font-bold text-red-600">{new Date(invoice.dueDate).toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {/* Bills Table */}
        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-200 text-slate-800">
              <th className="p-3 border-r border-slate-200 w-12 text-center">ลำดับ</th>
              <th className="p-3 border-r border-slate-200">วันที่บิล</th>
              <th className="p-3 border-r border-slate-200">เลขที่บิลอ้างอิง</th>
              <th className="p-3 border-r border-slate-200 text-right">ยอดรวมบิล</th>
              <th className="p-3 text-right">ยอดที่ต้องชำระ</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoiceSales.map((is: any, index: number) => (
              <tr key={is.saleId} className="border-b border-slate-200">
                <td className="p-3 border-r border-slate-200 text-center">{index + 1}</td>
                <td className="p-3 border-r border-slate-200">{new Date(is.sale.saleDate).toLocaleDateString('th-TH')}</td>
                <td className="p-3 border-r border-slate-200">{is.sale.billNo}</td>
                <td className="p-3 border-r border-slate-200 text-right">{formatBaht(is.sale.grandTotal)}</td>
                <td className="p-3 text-right font-bold">{formatBaht(is.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-b-2 border-slate-800">
              <td colSpan={4} className="p-3 text-right font-bold text-slate-800 border-r border-slate-200">
                รวมเงินที่ต้องชำระทั้งสิ้น
              </td>
              <td className="p-3 text-right font-black text-lg text-slate-900">
                ฿{formatBaht(invoice.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Status / Balance */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <p className="text-slate-600">สถานะ: 
              {invoice.status === "PAID" ? <span className="ml-2 font-bold text-green-600">ชำระครบแล้ว</span> : 
               invoice.status === "PARTIAL" ? <span className="ml-2 font-bold text-orange-600">ชำระบางส่วน</span> : 
               <span className="ml-2 font-bold text-red-600">รอชำระ</span>}
            </p>
          </div>
          {invoice.status !== "OPEN" && (
            <div className="text-right">
              <p className="text-slate-600">ชำระแล้ว: <span className="font-bold text-green-600">฿{formatBaht(invoice.paidAmount)}</span></p>
              {invoice.balance > 0 && (
                <p className="text-slate-600 mt-1">ยอดคงค้าง: <span className="font-bold text-red-600 text-xl">฿{formatBaht(invoice.balance)}</span></p>
              )}
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-16 print:mt-32">
          <div className="text-center">
            <div className="border-b border-slate-400 w-48 mx-auto mb-2 h-8"></div>
            <p className="text-sm text-slate-600">ผู้รับบิล (ลูกค้า)</p>
            <p className="text-sm text-slate-500 mt-1">วันที่ _______/_______/_______</p>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 w-48 mx-auto mb-2 h-8"></div>
            <p className="text-sm text-slate-600">ผู้วางบิล</p>
            <p className="text-sm text-slate-500 mt-1">{invoice.createdBy?.name || "พนักงาน"}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
