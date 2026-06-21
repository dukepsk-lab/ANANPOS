"use client"

import { useState, useMemo } from "react"
import { Calendar, Download, Search } from "lucide-react"
import { differenceInDays, format } from "date-fns"

export function AgingReportClient({ customers }: any) {
  const [asOfDate, setAsOfDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [searchQuery, setSearchQuery] = useState("")

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  // Calculate Aging
  const agingData = useMemo(() => {
    const referenceDate = new Date(asOfDate)
    
    let totalAll = 0
    let total0to30 = 0
    let total31to60 = 0
    let total61to90 = 0
    let totalOver90 = 0

    const rows = customers.map((c: any) => {
      let b0to30 = 0
      let b31to60 = 0
      let b61to90 = 0
      let bOver90 = 0
      let customerTotal = 0

      c.sales.forEach((s: any) => {
        const saleDate = new Date(s.saleDate)
        
        if (saleDate <= referenceDate) {
          const days = differenceInDays(referenceDate, saleDate)
          const remaining = s.grandTotal - s.paidAmount
          
          if (remaining > 0) {
            customerTotal += remaining
            if (days <= 30) b0to30 += remaining
            else if (days <= 60) b31to60 += remaining
            else if (days <= 90) b61to90 += remaining
            else bOver90 += remaining
          }
        }
      })

      totalAll += customerTotal
      total0to30 += b0to30
      total31to60 += b31to60
      total61to90 += b61to90
      totalOver90 += bOver90

      return {
        ...c,
        total: customerTotal,
        b0to30,
        b31to60,
        b61to90,
        bOver90
      }
    }).filter((r: any) => r.total > 0) 

    if (searchQuery) {
      return {
        rows: rows.filter((r: any) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.phone?.includes(searchQuery)),
        totals: { totalAll, total0to30, total31to60, total61to90, totalOver90 }
      }
    }

    return {
      rows: rows.sort((a: any, b: any) => b.total - a.total),
      totals: { totalAll, total0to30, total31to60, total61to90, totalOver90 }
    }
  }, [customers, asOfDate, searchQuery])

  const exportCSV = () => {
    const headers = ["ชื่อลูกค้า", "ยอดรวม", "0-30 วัน", "31-60 วัน", "61-90 วัน", "เกิน 90 วัน"]
    const csvRows = agingData.rows.map((r: any) => 
      [r.name, r.total, r.b0to30, r.b31to60, r.b61to90, r.bOver90].join(",")
    )
    csvRows.unshift(headers.join(","))
    csvRows.push(["รวมทั้งสิ้น", agingData.totals.totalAll, agingData.totals.total0to30, agingData.totals.total31to60, agingData.totals.total61to90, agingData.totals.totalOver90].join(","))
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `aging_report_${asOfDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานอายุหนี้ (AR Aging Report)</h1>
          <p className="text-slate-500 mt-1">วิเคราะห์ยอดค้างชำระแบ่งตามช่วงเวลา</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาลูกค้า..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">วิเคราะห์ ณ วันที่:</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={asOfDate}
                onChange={e => setAsOfDate(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors shadow-sm font-medium"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-medium sticky top-0 z-10">
              <tr>
                <th className="p-4">ชื่อลูกค้า</th>
                <th className="p-4 text-right bg-blue-50/50">ยอดรวมค้างชำระ</th>
                <th className="p-4 text-right text-green-700">0 - 30 วัน</th>
                <th className="p-4 text-right text-yellow-600">31 - 60 วัน</th>
                <th className="p-4 text-right text-orange-600">61 - 90 วัน</th>
                <th className="p-4 text-right text-red-600">เกิน 90 วัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agingData.rows.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{row.name}</td>
                  <td className="p-4 text-right font-bold text-slate-800 bg-blue-50/20">{formatBaht(row.total)}</td>
                  <td className="p-4 text-right text-slate-600">{row.b0to30 > 0 ? formatBaht(row.b0to30) : "-"}</td>
                  <td className="p-4 text-right text-slate-600">{row.b31to60 > 0 ? formatBaht(row.b31to60) : "-"}</td>
                  <td className="p-4 text-right text-slate-600">{row.b61to90 > 0 ? formatBaht(row.b61to90) : "-"}</td>
                  <td className="p-4 text-right font-bold text-red-500">{row.bOver90 > 0 ? formatBaht(row.bOver90) : "-"}</td>
                </tr>
              ))}

              {agingData.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">ไม่มียอดค้างชำระ ณ วันที่ระบุ</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-800 text-white sticky bottom-0 z-10">
              <tr>
                <td className="p-4 font-bold text-right">รวมทั้งสิ้น</td>
                <td className="p-4 text-right font-black text-lg">฿{formatBaht(agingData.totals.totalAll)}</td>
                <td className="p-4 text-right font-bold text-green-400">฿{formatBaht(agingData.totals.total0to30)}</td>
                <td className="p-4 text-right font-bold text-yellow-400">฿{formatBaht(agingData.totals.total31to60)}</td>
                <td className="p-4 text-right font-bold text-orange-400">฿{formatBaht(agingData.totals.total61to90)}</td>
                <td className="p-4 text-right font-bold text-red-400">฿{formatBaht(agingData.totals.totalOver90)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
