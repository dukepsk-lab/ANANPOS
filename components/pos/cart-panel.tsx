"use client"

import { ShoppingCart, Trash2 } from "lucide-react"

const formatBaht = (amount: number) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

export function CartPanel({ 
  cart, 
  onRemove, 
  customers, 
  selectedCustomer, 
  onSelectCustomer,
  subtotal,
  discount,
  onDiscountChange,
  isVatIncluded,
  onVatChange,
  vatAmount,
  grandTotal,
  onCheckout
}: any) {
  
  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl z-10 relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-slate-600">บิลขายใหม่</span>
          <span className="text-slate-400 text-sm">{new Date().toLocaleDateString('th-TH')}</span>
        </div>
        
        {/* Customer Selector */}
        <select 
          id="customer-selector"
          className="input font-bold text-slate-700 w-full"
          value={selectedCustomer?.id || ""}
          onChange={(e) => {
            const val = e.target.value
            onSelectCustomer(val ? customers.find((c:any) => c.id === Number(val)) : null)
          }}
        >
          <option value="">+ ลูกค้าทั่วไป (เงินสด)</option>
          {customers.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name} {c.type === 'CREDIT' ? '(เครดิต)' : ''}</option>
          ))}
        </select>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">ยังไม่มีรายการสินค้า</p>
          </div>
        ) : (
          cart.map((item: any) => (
            <div key={item.id} className="card p-4 flex gap-3 relative group overflow-visible min-h-[80px]">
              <div className="flex-1">
                <div className="font-heading font-bold text-slate-800 line-clamp-1">{item.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {item.quantity} {item.unitName} x ฿{item.unitPrice}
                </div>
              </div>
              <div className="font-heading font-bold text-lg text-slate-800 self-center">
                ฿{formatBaht(item.lineTotal)}
              </div>
              <button 
                onClick={() => onRemove(item.id)}
                className="absolute -right-2 -top-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-slate-100 bg-white space-y-3">
        <div className="flex justify-between text-slate-500">
          <span>รวมเป็นเงิน</span>
          <span className="font-bold">฿{formatBaht(subtotal)}</span>
        </div>
        
        <div className="flex justify-between items-center text-slate-500">
          <span>ส่วนลดท้ายบิล</span>
          <div className="w-24">
            <input 
              type="number" 
              value={discount || ''}
              onChange={(e) => onDiscountChange(Number(e.target.value))}
              placeholder="0"
              className="w-full text-right p-1 border-b border-slate-200 focus:outline-none focus:border-blue-500 bg-transparent font-bold"
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isVatIncluded} 
              onChange={(e) => onVatChange(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>VAT 7%</span>
          </label>
          <span className="font-bold">฿{formatBaht(vatAmount)}</span>
        </div>

        <div className="flex justify-between items-end pt-3 border-t border-slate-100">
          <span className="text-xl font-bold text-slate-800">ยอดสุทธิ</span>
          <span className="text-4xl font-heading font-black text-primary">฿{formatBaht(grandTotal)}</span>
        </div>

        <button 
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full py-5 bg-accent hover:bg-accent/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl text-2xl font-bold font-heading transition-all shadow-lg mt-4 flex justify-center gap-2 items-center active:scale-95 hover:-translate-y-1"
        >
          เก็บเงิน
        </button>
      </div>
    </div>
  )
}
