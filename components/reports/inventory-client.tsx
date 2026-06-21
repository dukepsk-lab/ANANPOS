"use client"

import { useState } from "react"
import { Search, Download, Printer, AlertTriangle } from "lucide-react"

export function InventoryClient({ initialData }: { initialData: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const formatQty = (qty: number) => {
    return new Intl.NumberFormat('th-TH').format(qty)
  }

  const filteredData = initialData.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const urgentItems = filteredData.filter(p => p.status === "URGENT")
  const totalInventoryValue = filteredData.reduce((sum, p) => sum + p.totalValue, 0)

  const handleExportCSV = () => {
    const headers = ["รหัสสินค้า", "ชื่อสินค้า", "คงเหลือ", "หน่วยฐาน", "จุดสั่งซื้อ", "ต้นทุนเฉลี่ย", "มูลค่ารวม", "สถานะ"]
    const rows = filteredData.map(p => [
      p.code,
      p.name,
      p.quantityOnHand,
      p.baseUnit,
      p.reorderPoint,
      p.avgCost.toFixed(2),
      p.totalValue.toFixed(2),
      p.status === "URGENT" ? "ต้องสั่งซื้อ" : "ปกติ"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `inventory_report_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrintPO = () => {
    // Print just the urgent items as a simplified PO
    if (urgentItems.length === 0) {
      alert("ไม่มีสินค้าที่ต้องสั่งซื้อ")
      return
    }
    
    let printContents = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="text-align: center;">ใบสั่งซื้อที่แนะนำ (Suggested Purchase Order)</h2>
        <p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">รหัส</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">สินค้า</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">คงเหลือ</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">จุดสั่งซื้อ</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">ควรสั่ง (แนะนำ)</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">หน่วย</th>
            </tr>
          </thead>
          <tbody>
            ${urgentItems.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.code}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantityOnHand}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.reorderPoint}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">
                  ${item.reorderPoint > 0 ? (item.reorderPoint * 2) - item.quantityOnHand : 10}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.baseUnit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContents)
      printWindow.document.close()
      printWindow.focus()
      // slight delay for rendering
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  return (
    <div className="flex flex-col h-full gap-6 pb-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-medium">รายการสินค้าทั้งหมด</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{filteredData.length} รายการ</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-medium">มูลค่าสต็อกรวม (ทุนเฉลี่ย)</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-1">฿{formatBaht(totalInventoryValue)}</h3>
          </div>
        </div>
        <div className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-red-600 font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> ต้องสั่งซื้อด่วน
            </p>
            <h3 className="text-3xl font-bold text-red-700 mt-1">{urgentItems.length} รายการ</h3>
          </div>
          {urgentItems.length > 0 && (
            <button 
              onClick={handlePrintPO}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700"
            >
              พิมพ์ใบสั่งซื้อ
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหารหัส หรือ ชื่อสินค้า..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr className="text-slate-500 font-medium text-sm">
                <th className="p-4 border-b">รหัส</th>
                <th className="p-4 border-b">สินค้า</th>
                <th className="p-4 border-b text-right">คงเหลือ</th>
                <th className="p-4 border-b">หน่วยฐาน</th>
                <th className="p-4 border-b text-right">จุดสั่งซื้อ</th>
                <th className="p-4 border-b text-right">ทุนเฉลี่ย</th>
                <th className="p-4 border-b text-right">มูลค่ารวม</th>
                <th className="p-4 border-b text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(item => (
                <tr key={item.id} className={`hover:bg-slate-50 ${item.status === 'URGENT' ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 text-slate-500 font-mono text-sm">{item.code}</td>
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className={`p-4 text-right font-bold ${item.status === 'URGENT' ? 'text-red-600' : 'text-slate-700'}`}>
                    {formatQty(item.quantityOnHand)}
                  </td>
                  <td className="p-4 text-slate-600">{item.baseUnit}</td>
                  <td className="p-4 text-right text-slate-500">{formatQty(item.reorderPoint)}</td>
                  <td className="p-4 text-right text-slate-600">฿{formatBaht(item.avgCost)}</td>
                  <td className="p-4 text-right font-medium text-blue-600">฿{formatBaht(item.totalValue)}</td>
                  <td className="p-4 text-center">
                    {item.status === "URGENT" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" /> ต้องสั่งซื้อ
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        ปกติ
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    ไม่พบข้อมูลสินค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
