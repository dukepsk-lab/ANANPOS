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
    <div className="flex flex-col h-full bg-white border-l border-border relative">
      {/* Header */}
      <div className="p-3 border-b border-border bg-slate-50">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm text-slate-600">บิลขายใหม่</span>
          <span className="text-slate-400 text-xs">{new Date().toLocaleDateString('th-TH')}</span>
        </div>

        {/* Customer Selector */}
        <select
          id="customer-selector"
          className="select font-semibold text-slate-700 w-full h-10"
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
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">ยังไม่มีรายการสินค้า</p>
          </div>
        ) : (
          cart.map((item: any) => (
            <div key={item.id} className="card p-3 flex gap-3 relative group overflow-visible min-h-[44px]">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-800 line-clamp-1">{item.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.quantity} {item.unitName} x ฿{item.unitPrice}
                </div>
              </div>
              <div className="font-bold text-base text-slate-800 self-center">
                ฿{formatBaht(item.lineTotal)}
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="absolute -right-2 -top-2 w-7 h-7 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="p-3 border-t border-border bg-white space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>รวมเป็นเงิน</span>
          <span className="font-semibold">฿{formatBaht(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-sm text-slate-500">
          <span>ส่วนลดท้ายบิล</span>
          <div className="w-24">
            <input
              type="number"
              value={discount || ''}
              onChange={(e) => onDiscountChange(Number(e.target.value))}
              placeholder="0"
              className="w-full text-right p-1 border-b border-border focus:outline-none focus:border-primary bg-transparent font-semibold"
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isVatIncluded}
              onChange={(e) => onVatChange(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span>VAT 7%</span>
          </label>
          <span className="font-semibold">฿{formatBaht(vatAmount)}</span>
        </div>

        <div className="flex justify-between items-end pt-2 border-t border-border">
          <span className="text-base font-semibold text-slate-800">ยอดสุทธิ</span>
          <span className="text-2xl font-heading font-bold text-primary">฿{formatBaht(grandTotal)}</span>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full h-12 bg-accent hover:bg-accent/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-md text-lg font-bold font-heading transition-colors shadow-sm mt-2 flex justify-center gap-2 items-center active:scale-[0.98]"
        >
          เก็บเงิน
        </button>
      </div>
    </div>
  )
}
