"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export function ReceiptClient({ sale }: { sale: any }) {
  useEffect(() => {
    // Auto-trigger print when component mounts
    window.print()
  }, [])

  return (
    <div className="bg-white text-black max-w-[80mm] mx-auto p-4 text-sm font-sans" style={{ fontFamily: 'monospace' }}>
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">ANAN POS</h1>
        <p>ร้านอนันต์วัสดุก่อสร้าง</p>
        <p>โทร. 02-123-4567</p>
        <p>ใบเสร็จรับเงินอย่างย่อ</p>
      </div>
      
      <div className="mb-4 text-xs">
        <p>เลขที่บิล: {sale.billNo}</p>
        <p>วันที่: {new Date(sale.saleDate).toLocaleString('th-TH')}</p>
        <p>พนักงาน: {sale.createdBy?.name}</p>
        {sale.customer && <p>ลูกค้า: {sale.customer.name}</p>}
      </div>

      <div className="border-t border-black border-dashed my-2"></div>

      <table className="w-full text-xs mb-2">
        <thead>
          <tr className="border-b border-black border-dashed">
            <th className="text-left py-1 w-1/2">รายการ</th>
            <th className="text-right py-1">จำนวน</th>
            <th className="text-right py-1">รวม</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item: any) => (
            <tr key={item.id}>
              <td className="py-1">
                <div className="line-clamp-1">{item.product.name}</div>
                <div className="text-[10px] text-gray-500">@{item.unitPrice}/{item.productUnit.unit.name}</div>
              </td>
              <td className="text-right py-1 align-top">{item.quantity}</td>
              <td className="text-right py-1 align-top">{item.lineTotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black border-dashed my-2"></div>

      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>รวมเป็นเงิน</span>
          <span>{sale.subtotal.toFixed(2)}</span>
        </div>
        {sale.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>ส่วนลด</span>
            <span>-{sale.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-2">
          <span>ยอดสุทธิ</span>
          <span>{sale.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-black border-dashed my-2"></div>

      <div className="text-center text-xs mt-4">
        <p>ขอบคุณที่ใช้บริการ</p>
        <p>Please come again</p>
      </div>

      {/* Hide controls when printing */}
      <div className="mt-6 print:hidden flex flex-col gap-2">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => window.print()}>
          พิมพ์บิลอีกครั้ง
        </Button>
        <Button variant="ghost" size="lg" className="w-full bg-slate-100" onClick={() => window.history.back()}>
          กลับไปหน้าขาย
        </Button>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-\\[80mm\\], .max-w-\\[80mm\\] * {
            visibility: visible;
          }
          .max-w-\\[80mm\\] {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 80mm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
