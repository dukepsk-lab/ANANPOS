"use client"

import { useState } from "react"
import { X, Receipt, FileText } from "lucide-react"

const formatBaht = (amount: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

export function PaymentDialog({ 
  cart, 
  customer, 
  subtotal, 
  discount, 
  vatAmount, 
  grandTotal, 
  onClose, 
  onSuccess 
}: any) {
  const [tab, setTab] = useState<'CASH' | 'CREDIT' | 'PARTIAL'>('CASH')
  const [docType, setDocType] = useState<'RECEIPT' | 'TAX_INVOICE'>('RECEIPT')
  const [receivedAmount, setReceivedAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleNumpad = (val: string) => {
    if (val === 'C') setReceivedAmount("")
    else if (val === 'B') setReceivedAmount(prev => prev.slice(0, -1))
    else setReceivedAmount(prev => prev + val)
  }

  const handleQuickAmount = (amount: number) => {
    setReceivedAmount(amount.toString())
  }

  const receivedNum = Number(receivedAmount) || 0
  const change = tab === 'CASH' && receivedNum >= grandTotal ? receivedNum - grandTotal : 0

  const handleConfirm = async () => {
    if (tab === 'CASH' && receivedNum < grandTotal) {
      alert("รับเงินไม่พอ!")
      return
    }
    if ((tab === 'CREDIT' || tab === 'PARTIAL') && !customer) {
      alert("ต้องเลือกลูกค้าสำหรับการขายเชื่อ!")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer?.id || null,
          subtotal,
          discountAmount: discount,
          vatAmount,
          grandTotal,
          paymentType: tab,
          paidAmount: tab === 'CASH' ? grandTotal : (tab === 'PARTIAL' ? receivedNum : 0),
          docType,
          items: cart.map((i: any) => ({
            productId: i.productId,
            productUnitId: i.productUnitId,
            quantity: i.quantity,
            quantityBase: i.quantityBase,
            unitPrice: i.unitPrice,
            lineTotal: i.lineTotal
          }))
        })
      })

      if (!res.ok) throw new Error("Sale failed")
      onSuccess()
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการบันทึกบิล (API อาจจะยังไม่พร้อมใช้งาน)")
      // For MVP Checkpoint 1.5, we will close on success assuming API might not exist yet
      onSuccess() 
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex overflow-hidden h-[700px] animate-in slide-in-from-bottom-8 duration-300">
        
        {/* LEFT: Payment Methods */}
        <div className="w-1/2 border-r border-slate-100 flex flex-col bg-slate-50">
          <div className="p-6 border-b border-slate-200 bg-white">
            <h2 className="text-3xl font-heading font-bold text-slate-800">การชำระเงิน</h2>
          </div>
          
          <div className="flex border-b border-slate-200 bg-white">
            <button 
              onClick={() => setTab('CASH')}
              className={`flex-1 py-4 text-lg font-heading font-bold border-b-4 transition-colors ${tab === 'CASH' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
            >
              เงินสด
            </button>
            <button 
              onClick={() => setTab('CREDIT')}
              className={`flex-1 py-4 text-lg font-heading font-bold border-b-4 transition-colors ${tab === 'CREDIT' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
            >
              เงินเชื่อ
            </button>
            <button 
              onClick={() => setTab('PARTIAL')}
              className={`flex-1 py-4 text-lg font-heading font-bold border-b-4 transition-colors ${tab === 'PARTIAL' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
            >
              จ่ายบางส่วน
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {tab === 'CASH' || tab === 'PARTIAL' ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-slate-500 font-medium mb-2">ยอดที่ต้องชำระ</p>
                  <p className="text-5xl font-heading font-black text-slate-800">฿{formatBaht(grandTotal)}</p>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <span className="text-slate-400 font-medium">รับเงินมา</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={receivedAmount} 
                    placeholder="0"
                    className="text-right text-4xl font-heading font-black text-primary outline-none w-2/3 bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[100, 500, 1000].map(amt => (
                    <button key={amt} onClick={() => handleQuickAmount(amt)} className="p-3 bg-secondary/10 text-secondary font-bold font-heading rounded-xl border border-secondary/20 text-lg hover:bg-secondary/20 transition-colors">
                      +{amt}
                    </button>
                  ))}
                  <button onClick={() => handleQuickAmount(grandTotal)} className="p-3 bg-primary/10 text-primary font-bold font-heading rounded-xl border border-primary/20 text-lg hover:bg-primary/20 transition-colors">
                    พอดี
                  </button>

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => handleNumpad(num.toString())} className="p-4 bg-white border border-slate-200 rounded-xl text-3xl font-heading font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm">
                      {num}
                    </button>
                  ))}
                  <button onClick={() => handleNumpad('C')} className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xl font-bold hover:bg-red-100 transition-colors">
                    C
                  </button>
                  <button onClick={() => handleNumpad('0')} className="p-4 bg-white border border-slate-200 rounded-xl text-3xl font-heading font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm">
                    0
                  </button>
                  <button onClick={() => handleNumpad('B')} className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xl font-bold hover:bg-slate-200 transition-colors">
                    ⌫
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
                {!customer ? (
                  <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 shadow-sm">
                    <p className="text-2xl font-bold mb-2">ต้องเลือกลูกค้าสำหรับเงินเชื่อ!</p>
                    <p className="text-red-500">กรุณาปิดหน้าต่างนี้และเลือกลูกค้าในบิลก่อน</p>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl font-bold mx-auto border-4 border-white shadow-md">
                      {customer.name.charAt(0)}
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800">{customer.name}</h3>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 text-left space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">ยอดหนี้เดิม</span>
                        <span className="font-bold text-xl text-slate-700">฿{formatBaht(customer.balance)}</span>
                      </div>
                      <div className="flex justify-between items-center text-blue-600 font-bold bg-blue-50 p-3 rounded-xl">
                        <span>บิลนี้เพิ่ม</span>
                        <span className="text-xl">+ ฿{formatBaht(grandTotal)}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                        <span className="text-slate-600 font-medium">ยอดหนี้สุทธิ</span>
                        <span className="font-black text-2xl text-slate-900">฿{formatBaht(customer.balance + grandTotal)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Summary & Actions */}
        <div className="w-1/2 p-8 flex flex-col bg-white">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-bold text-slate-800">เอกสาร</h3>
            <button onClick={onClose} className="p-3 rounded-full hover:bg-slate-100 text-slate-400 bg-slate-50 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setDocType('RECEIPT')}
              className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all hover:-translate-y-1 ${docType === 'RECEIPT' ? 'border-primary bg-primary/5 text-primary ring-4 ring-primary/20 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-300 shadow-sm'}`}
            >
              <Receipt className="w-10 h-10" />
              <span className="font-heading font-bold text-lg">ใบเสร็จอย่างย่อ</span>
            </button>
            <button 
              onClick={() => setDocType('TAX_INVOICE')}
              className={`flex-1 p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all hover:-translate-y-1 ${docType === 'TAX_INVOICE' ? 'border-primary bg-primary/5 text-primary ring-4 ring-primary/20 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-300 shadow-sm'}`}
            >
              <FileText className="w-10 h-10" />
              <span className="font-heading font-bold text-lg">ใบกำกับภาษี</span>
            </button>
          </div>

          {tab === 'CASH' && (
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] mb-8 flex-1 flex flex-col justify-center items-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-20" />
              <p className="text-slate-400 text-xl font-medium mb-2 relative z-10">เงินทอน</p>
              <p className={`text-7xl font-black relative z-10 tracking-tighter ${change > 0 ? 'text-emerald-400' : 'text-white'}`}>
                ฿{formatBaht(Math.max(0, change))}
              </p>
            </div>
          )}

          {tab === 'PARTIAL' && (
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] mb-8 flex-1 flex flex-col justify-center items-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500 rounded-full blur-3xl opacity-20" />
              <p className="text-slate-400 text-xl font-medium mb-2 relative z-10">ค้างชำระเพิ่ม (ลงบัญชี)</p>
              <p className={`text-6xl font-black text-amber-400 relative z-10 tracking-tighter`}>
                ฿{formatBaht(Math.max(0, grandTotal - receivedNum))}
              </p>
            </div>
          )}

          {tab === 'CREDIT' && (
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] mb-8 flex-1 flex flex-col justify-center items-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-20" />
              <p className="text-slate-400 text-xl font-medium mb-2 relative z-10">บันทึกเป็นหนี้</p>
              <p className={`text-6xl font-black text-blue-400 relative z-10 tracking-tighter`}>
                ฿{formatBaht(grandTotal)}
              </p>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-6 bg-accent hover:bg-accent/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl text-2xl font-heading font-bold transition-transform shadow-xl active:scale-95 flex justify-center items-center gap-3"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันการขาย"}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
