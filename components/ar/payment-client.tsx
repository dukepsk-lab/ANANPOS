"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Calendar, CheckCircle } from "lucide-react"
import { format } from "date-fns"

export function PaymentClient({ customers, defaultCustomerId, defaultInvoiceId, currentUserId }: any) {
  const router = useRouter()
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">(defaultCustomerId || "")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | "">(defaultInvoiceId || "")
  
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [amountInput, setAmountInput] = useState<string>("")
  const [method, setMethod] = useState("CASH")
  const [reference, setReference] = useState("")
  const [note, setNote] = useState("")
  
  const [isAuto, setIsAuto] = useState(true)
  const [manualAllocations, setManualAllocations] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCustomer = useMemo(() => {
    return customers.find((c: any) => c.id === selectedCustomerId)
  }, [customers, selectedCustomerId])

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  // FIFO Auto Allocation
  const autoAllocations = useMemo(() => {
    const allocs: Record<number, number> = {}
    if (!selectedCustomer || !isAuto) return allocs
    
    let remainingAmount = parseFloat(amountInput) || 0
    if (remainingAmount <= 0) return allocs

    // Prioritize invoice if selected? Actually the requirements say apply to bills.
    // If an invoice is selected, we could filter sales to only those in the invoice.
    // For simplicity, we just apply to all unpaid sales oldest first.
    let targetSales = selectedCustomer.sales
    
    if (selectedInvoiceId) {
      const invoice = selectedCustomer.invoices.find((i: any) => i.id === selectedInvoiceId)
      if (invoice) {
        const invoiceSaleIds = invoice.invoiceSales.map((is: any) => is.saleId)
        targetSales = targetSales.filter((s: any) => invoiceSaleIds.includes(s.id))
      }
    }

    for (const sale of targetSales) {
      const remainingSaleBalance = sale.grandTotal - sale.paidAmount
      if (remainingSaleBalance <= 0) continue

      if (remainingAmount >= remainingSaleBalance) {
        allocs[sale.id] = remainingSaleBalance
        remainingAmount -= remainingSaleBalance
      } else {
        allocs[sale.id] = remainingAmount
        remainingAmount = 0
        break
      }
    }

    return allocs
  }, [selectedCustomer, amountInput, isAuto, selectedInvoiceId])

  const currentAllocations = isAuto ? autoAllocations : manualAllocations

  const totalAllocated = useMemo(() => {
    return Object.values(currentAllocations).reduce((sum, val) => sum + val, 0)
  }, [currentAllocations])

  // If manual, amount input should ideally reflect total allocated, or we just validate they match
  
  const handleManualChange = (saleId: number, val: string, maxAmount: number) => {
    setIsAuto(false)
    const num = parseFloat(val) || 0
    setManualAllocations(prev => {
      const next = { ...prev }
      if (num <= 0) {
        delete next[saleId]
      } else {
        next[saleId] = Math.min(num, maxAmount)
      }
      return next
    })
  }

  // Pre-fill amount if invoice is selected
  useEffect(() => {
    if (selectedInvoiceId && selectedCustomer) {
      const invoice = selectedCustomer.invoices.find((i: any) => i.id === selectedInvoiceId)
      if (invoice && invoice.balance > 0) {
        setAmountInput(invoice.balance.toString())
        setIsAuto(true)
      }
    }
  }, [selectedInvoiceId, selectedCustomer])

  const handleSubmit = async () => {
    const payAmount = parseFloat(amountInput) || 0
    if (!selectedCustomerId || payAmount <= 0) {
      alert("กรุณาระบุจำนวนเงินที่รับชำระ")
      return
    }

    if (totalAllocated <= 0) {
      alert("ไม่มีบิลให้ตัดยอด หรือไม่ได้จัดสรรยอดชำระ")
      return
    }

    // Prepare allocations array
    const allocationsArray = Object.entries(currentAllocations).map(([saleId, applyAmount]) => ({
      saleId: parseInt(saleId),
      applyAmount
    }))

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          invoiceId: selectedInvoiceId || undefined,
          amount: payAmount,
          method,
          reference,
          note,
          paymentDate: new Date(paymentDate).toISOString(),
          createdById: currentUserId,
          allocations: allocationsArray
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create payment")
      }

      alert("บันทึกรับชำระเงินสำเร็จ")
      router.push(`/ar/customers/${selectedCustomerId}`)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full">
      {/* Header & Back */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/ar" className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">รับชำระเงิน</h1>
            <p className="text-slate-500 mt-1">บันทึกการรับชำระเงินและตัดยอดหนี้</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || totalAllocated === 0}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-white font-bold shadow-md transition-all active:scale-95"
        >
          {isSubmitting ? "กำลังบันทึก..." : <><Save className="w-5 h-5" /> ยืนยันรับชำระเงิน</>}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ลูกค้า</label>
              <select 
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value ? Number(e.target.value) : "")
                  setSelectedInvoiceId("")
                  setAmountInput("")
                  setManualAllocations({})
                  setIsAuto(true)
                }}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- เลือกลูกค้า --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} (ค้าง {formatBaht(c.balance)})</option>
                ))}
              </select>
            </div>

            {selectedCustomer && selectedCustomer.invoices.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">อ้างอิงใบวางบิล (ถ้ามี)</label>
                <select 
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : ""
                    setSelectedInvoiceId(id)
                    setManualAllocations({})
                    setIsAuto(true)
                    if (!id) setAmountInput("")
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- ไม่ระบุบิล --</option>
                  {selectedCustomer.invoices.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.invoiceNo} (ยอดค้าง {formatBaht(i.balance)})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงินที่ได้รับ <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">฿</span>
                <input 
                  type="number" 
                  value={amountInput}
                  onChange={e => {
                    setAmountInput(e.target.value)
                    if (!isAuto) {
                      // If they change amount while manual, maybe we just leave manual allocations alone
                      // or warn them. We will just let them mismatch and show a warning in UI.
                    }
                  }}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-white text-lg font-bold text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              {!isAuto && Math.abs((parseFloat(amountInput)||0) - totalAllocated) > 0.01 && (
                <p className="text-orange-500 text-sm mt-1">⚠️ ยอดจัดสรรไม่ตรงกับยอดรับเงิน</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ช่องทางชำระ</label>
                <select 
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">เงินสด</option>
                  <option value="TRANSFER">โอนเงิน</option>
                  <option value="CHEQUE">เช็ค</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่รับชำระ</label>
                <input 
                  type="date" 
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เลขอ้างอิง / สลิป</label>
              <input 
                type="text" 
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น เลขที่สลิป หรือเลขที่เช็ค"
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Allocation */}
        <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
            <h2 className="font-bold text-slate-800">จัดสรรยอดชำระ</h2>
            <div className="flex gap-2 bg-white rounded-lg p-1 border border-slate-200">
              <button 
                onClick={() => {
                  setIsAuto(true)
                  setManualAllocations({})
                }}
                className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${isAuto ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
              >
                อัตโนมัติ (FIFO)
              </button>
              <button 
                onClick={() => {
                  setIsAuto(false)
                  setManualAllocations({ ...autoAllocations })
                }}
                className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${!isAuto ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}
              >
                กำหนดเอง
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedCustomer ? (
              <div className="h-full flex items-center justify-center text-slate-400">เลือกลูกค้าทางซ้ายเพื่อแสดงบิล</div>
            ) : selectedCustomer.sales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">ไม่มียอดค้างชำระ</div>
            ) : (
              <div className="space-y-3">
                {selectedCustomer.sales.map((s: any) => {
                  const remaining = s.grandTotal - s.paidAmount
                  const allocated = currentAllocations[s.id] || 0
                  const isFullyCleared = allocated > 0 && Math.abs(allocated - remaining) < 0.01

                  // If invoice is selected, maybe we only show those sales?
                  // Or we show all but highlight invoice ones. Let's just show all for now.

                  return (
                    <div key={s.id} className={`p-4 rounded-xl border transition-colors ${allocated > 0 ? "border-green-200 bg-green-50" : "border-slate-100 bg-white hover:border-slate-300"}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-800">{s.billNo}</p>
                          <p className="text-sm text-slate-500">{new Date(s.saleDate).toLocaleDateString('th-TH')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">ยอดค้างบิลนี้</p>
                          <p className="font-bold text-slate-800">฿{formatBaht(remaining)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          {isAuto ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 transition-all" 
                                  style={{ width: `${(allocated / remaining) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-green-600 w-24 text-right">
                                {allocated > 0 ? `+ ฿${formatBaht(allocated)}` : ""}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm text-slate-500">ตัดยอด:</span>
                              <input 
                                type="number" 
                                value={currentAllocations[s.id] || ""}
                                onChange={(e) => handleManualChange(s.id, e.target.value, remaining)}
                                className="w-32 p-2 text-right border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                        </div>
                        {isFullyCleared && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-between items-center">
            <span className="text-slate-600 font-medium">รวมยอดจัดสรร</span>
            <span className="text-2xl font-black text-green-600">฿{formatBaht(totalAllocated)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
