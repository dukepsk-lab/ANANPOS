"use client"

import { useState } from "react"
import { X, Minus, Plus } from "lucide-react"

export function UnitDialog({ product, customer, onClose, onAdd }: any) {
  const getPrice = (u: any) => customer?.priceTier === "CONTRACTOR" && u.contractorPrice ? u.contractorPrice : u.price

  const defaultUnit = product.productUnits.find((u:any) => u.isDefaultSale) || product.productUnits[0]
  const [selectedUnit, setSelectedUnit] = useState<any>(defaultUnit)
  const [quantity, setQuantity] = useState<number | string>(1)
  const [customPrice, setCustomPrice] = useState<number | string>(getPrice(defaultUnit) || 0)

  const handleAdd = () => {
    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) return

    const price = product.isStockItem ? getPrice(selectedUnit) : Number(customPrice)
    
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productUnitId: selectedUnit.id,
      name: product.name,
      unitName: selectedUnit.unit.name,
      quantity: qty,
      quantityBase: qty * selectedUnit.conversionRate,
      unitPrice: price,
      lineTotal: qty * price,
      isStockItem: product.isStockItem,
      stockWarning: product.isStockItem && ((product.stockBalance?.quantityOnHand || 0) - (qty * selectedUnit.conversionRate) < 0)
    })
  }

  const handleUnitSelect = (u: any) => {
    setSelectedUnit(u)
    if (!product.isStockItem) setCustomPrice(getPrice(u))
  }

  return (
    <div className="modal-overlay">
      <div className="modal flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">{product.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Unit selection */}
          <div>
            <label className="block text-slate-500 font-medium mb-3">เลือกหน่วยขาย</label>
            <div className="grid grid-cols-2 gap-3">
              {product.productUnits.map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => handleUnitSelect(u)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:-translate-y-1 ${
                    selectedUnit.id === u.id 
                    ? 'border-primary bg-primary/5 ring-4 ring-primary/20 shadow-md' 
                    : 'border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="font-heading font-bold text-xl">{u.unit.name}</div>
                  {product.isStockItem && (
                    <div className="text-slate-500 font-medium mt-1">
                      ฿{getPrice(u)}
                      {customer?.priceTier === "CONTRACTOR" && u.contractorPrice && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 rounded">ราคาส่ง</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-slate-500 font-medium mb-3">จำนวน ({selectedUnit.unit.name})</label>
              <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-slate-200">
                <button 
                  onClick={() => setQuantity(Number(quantity) > 1 ? Number(quantity) - 1 : 1)}
                  className="w-16 h-14 bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <input 
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-14 text-center text-3xl font-heading font-black border-x border-slate-200 focus:outline-none focus:bg-primary/5"
                />
                <button 
                  onClick={() => setQuantity(Number(quantity) + 1)}
                  className="w-16 h-14 bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {!product.isStockItem && (
              <div className="flex-1">
                <label className="block text-slate-500 font-medium mb-3">ราคา (บาท)</label>
                <input 
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="input h-14 px-4 text-2xl font-heading font-black shadow-sm"
                />
              </div>
            )}
          </div>
          
          {product.isStockItem && ((product.stockBalance?.quantityOnHand || 0) - (Number(quantity) * selectedUnit.conversionRate) < 0) && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl font-medium flex gap-3 items-center">
              <div className="text-2xl">⚠️</div>
              <div>คำเตือน: สต็อกไม่พอ (มีอยู่ {product.stockBalance?.quantityOnHand || 0} {product.baseUnit.name}) สต็อกจะติดลบหลังการขาย</div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button 
            onClick={handleAdd}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl text-2xl font-heading font-bold transition-all hover:-translate-y-1 active:scale-95 shadow-lg flex justify-center items-center gap-2"
          >
            เพิ่มลงบิล
          </button>
        </div>
      </div>
    </div>
  )
}
