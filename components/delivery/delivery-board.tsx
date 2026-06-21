"use client"

import { useState } from "react"
import { Truck, MapPin, Phone, Package, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
    { id: "PENDING", title: "รอจัดส่ง", icon: Clock, color: "bg-amber-50 text-amber-700", borderColor: "border-amber-200", badge: "warning" as const },
    { id: "IN_TRANSIT", title: "กำลังจัดส่ง", icon: Truck, color: "bg-blue-50 text-blue-700", borderColor: "border-blue-200", badge: "info" as const },
    { id: "DELIVERED", title: "ส่งสำเร็จ", icon: CheckCircle, color: "bg-emerald-50 text-emerald-700", borderColor: "border-emerald-200", badge: "success" as const }
  ]

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map(col => {
        const colDeliveries = deliveries.filter(d => d.status === col.id)
        const ColIcon = col.icon

        return (
          <div key={col.id} className="flex-1 min-w-[300px] bg-slate-50 rounded-lg border border-slate-200 flex flex-col">
            {/* Column Header */}
            <div className={`p-3 rounded-t-lg border-b ${col.borderColor} flex items-center justify-between bg-white`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${col.color}`}>
                  <ColIcon className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-sm text-slate-800">{col.title}</h2>
              </div>
              <Badge variant={col.badge}>{colDeliveries.length}</Badge>
            </div>

            {/* Column Content */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {colDeliveries.length === 0 ? (
                <div className="h-28 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-md">
                  ไม่มีรายการ
                </div>
              ) : (
                colDeliveries.map(delivery => (
                  <div key={delivery.id} className="card p-3 flex flex-col gap-2">

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{delivery.customer.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">บิล: {delivery.sale.billNo}</p>
                      </div>
                      {delivery.isCOD && (
                        <Badge variant="danger">
                          <AlertCircle className="w-3 h-3" /> เก็บปลายทาง
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                        <p className="line-clamp-2">{delivery.deliveryAddress}</p>
                      </div>
                      {delivery.customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <p>{delivery.customer.phone}</p>
                        </div>
                      )}
                    </div>

                    {/* Order summary */}
                    <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 mt-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-1.5">
                        <Package className="w-3.5 h-3.5" />
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
                        <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-800">
                          <span>ยอดเก็บเงิน:</span>
                          <span className="text-red-600">฿{formatBaht(delivery.sale.grandTotal - delivery.sale.paidAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-1 flex gap-2">
                      {col.id === "PENDING" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => updateStatus(delivery.id, "IN_TRANSIT")}
                          disabled={isLoading === delivery.id}
                        >
                          {isLoading === delivery.id ? "..." : "เริ่มจัดส่ง"}
                        </Button>
                      )}

                      {col.id === "IN_TRANSIT" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(delivery.id, "PENDING")}
                            disabled={isLoading === delivery.id}
                          >
                            ย้อนกลับ
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => updateStatus(delivery.id, "DELIVERED")}
                            disabled={isLoading === delivery.id}
                          >
                            <CheckCircle className="w-4 h-4" /> ส่งสำเร็จ
                          </Button>
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
