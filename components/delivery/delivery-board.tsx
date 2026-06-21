"use client"

import { useState } from "react"
import { Truck, MapPin, Phone, Package, CheckCircle, Clock, AlertCircle } from "lucide-react"

export function DeliveryBoard({ initialDeliveries }: { initialDeliveries: any[] }) {
  const [deliveries, setDeliveries] = useState(initialDeliveries)
  const [isLoading, setIsLoading] = useState<number | null>(null)

  const updateStatus = async (id: number, newStatus: string) => {
    setIsLoading(id)
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error("Failed to update status")
      
      const updated = await res.json()
      
      setDeliveries(prev => 
        prev.map(d => d.id === id ? { ...d, status: updated.status, deliveredAt: updated.deliveredAt } : d)
      )
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    } finally {
      setIsLoading(null)
    }
  }

  const columns = [
    { id: "PENDING", title: "รอจัดส่ง", icon: Clock, color: "bg-orange-100 text-orange-700", borderColor: "border-orange-200" },
    { id: "IN_TRANSIT", title: "กำลังจัดส่ง", icon: Truck, color: "bg-blue-100 text-blue-700", borderColor: "border-blue-200" },
    { id: "DELIVERED", title: "ส่งสำเร็จ", icon: CheckCircle, color: "bg-green-100 text-green-700", borderColor: "border-green-200" }
  ]

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      {columns.map(col => {
        const colDeliveries = deliveries.filter(d => d.status === col.id)
        const ColIcon = col.icon
        
        return (
          <div key={col.id} className="flex-1 min-w-[320px] bg-slate-100/50 rounded-2xl border border-slate-200 flex flex-col">
            {/* Column Header */}
            <div className={`p-4 rounded-t-2xl border-b ${col.borderColor} flex items-center justify-between bg-white`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${col.color}`}>
                  <ColIcon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800">{col.title}</h2>
              </div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">
                {colDeliveries.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {colDeliveries.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  ไม่มีรายการ
                </div>
              ) : (
                colDeliveries.map(delivery => (
                  <div key={delivery.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{delivery.customer.name}</h3>
                        <p className="text-sm text-slate-500 font-mono mt-0.5">บิล: {delivery.sale.billNo}</p>
                      </div>
                      {delivery.isCOD && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> เก็บปลายทาง
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                        <p className="line-clamp-2">{delivery.deliveryAddress}</p>
                      </div>
                      {delivery.customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <p>{delivery.customer.phone}</p>
                        </div>
                      )}
                    </div>

                    {/* Order summary */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <Package className="w-4 h-4" /> 
                        <span>รายการสินค้า ({delivery.sale.items.length})</span>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1 line-clamp-3">
                        {delivery.sale.items.map((item: any) => (
                          <li key={item.id} className="flex justify-between">
                            <span className="truncate pr-2">{item.product.name}</span>
                            <span className="shrink-0">{item.quantity} {item.productUnit.unit.name}</span>
                          </li>
                        ))}
                      </ul>
                      {delivery.isCOD && (
                        <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-800">
                          <span>ยอดเก็บเงิน:</span>
                          <span className="text-red-600">฿{formatBaht(delivery.sale.grandTotal - delivery.sale.paidAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-2">
                      {col.id === "PENDING" && (
                        <button 
                          onClick={() => updateStatus(delivery.id, "IN_TRANSIT")}
                          disabled={isLoading === delivery.id}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                        >
                          {isLoading === delivery.id ? "..." : "เริ่มจัดส่ง"}
                        </button>
                      )}
                      
                      {col.id === "IN_TRANSIT" && (
                        <>
                          <button 
                            onClick={() => updateStatus(delivery.id, "PENDING")}
                            disabled={isLoading === delivery.id}
                            className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                          >
                            ย้อนกลับ
                          </button>
                          <button 
                            onClick={() => updateStatus(delivery.id, "DELIVERED")}
                            disabled={isLoading === delivery.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" /> ส่งสำเร็จ
                          </button>
                        </>
                      )}

                      {col.id === "DELIVERED" && (
                        <p className="text-xs text-slate-400 text-center w-full">
                          ส่งเมื่อ: {new Date(delivery.deliveredAt).toLocaleString('th-TH')}
                        </p>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
