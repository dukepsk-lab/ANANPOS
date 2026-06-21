import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import {
  ShoppingCart,
  CreditCard,
  Truck,
  Package,
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  ReceiptText
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const formatBaht = (amount: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

type LowStockRow = {
  id: number
  code: string
  name: string
  reorderPoint: number
  quantityOnHand: number
  unitName: string
}

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role as string || "CASHIER"

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todaysSales, pendingDeliveries, arBalance, lowStockProducts] = await Promise.all([
    prisma.sale.aggregate({
      where: { saleDate: { gte: today }, status: { not: "VOID" } },
      _sum: { grandTotal: true },
      _count: { id: true }
    }),
    prisma.delivery.count({ where: { status: "PENDING" } }),
    prisma.customer.aggregate({
      where: { balance: { gt: 0 } },
      _sum: { balance: true }
    }),
    prisma.$queryRaw<LowStockRow[]>`
      SELECT p.id, p.code, p.name, p."reorderPoint", sb."quantityOnHand", u.name as "unitName"
      FROM "Product" p
      JOIN "StockBalance" sb ON sb."productId" = p.id
      JOIN "Unit" u ON u.id = p."baseUnitId"
      WHERE p."isStockItem" = true AND sb."quantityOnHand" < p."reorderPoint"
      ORDER BY (p."reorderPoint" - sb."quantityOnHand") DESC
      LIMIT 20
    `
  ])

  const totalSalesToday = todaysSales._sum.grandTotal || 0
  const totalBillsToday = todaysSales._count.id || 0
  const totalAR = arBalance._sum.balance || 0

  const menuItems = [
    { name: "ขายของ", icon: ShoppingCart, href: "/pos", allowedRoles: ["OWNER", "CASHIER", "STAFF"] },
    { name: "ลูกหนี้", icon: CreditCard, href: "/ar", allowedRoles: ["OWNER", "CASHIER", "STAFF"] },
    { name: "จัดส่ง", icon: Truck, href: "/delivery", allowedRoles: ["OWNER", "CASHIER", "STAFF"] },
    { name: "สต็อก", icon: Package, href: "/inventory", allowedRoles: ["OWNER", "CASHIER", "STAFF"] },
    { name: "รายงาน", icon: BarChart3, href: "/reports/daily", allowedRoles: ["OWNER", "STAFF"] },
    { name: "ตั้งค่า", icon: Settings, href: "/settings", allowedRoles: ["OWNER"] },
  ]

  const visibleMenu = menuItems.filter(item => item.allowedRoles.includes(role))

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader title="หน้าหลัก" description="ภาพรวมการขายและสต็อกประจำวัน" />

      {/* Quick Nav */}
      <section className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {visibleMenu.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="card flex flex-col items-center justify-center gap-2 py-4 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-slate-700">{item.name}</span>
            </Link>
          )
        })}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="ยอดขายวันนี้" value={formatBaht(totalSalesToday)} icon={TrendingUp} tone="default" />
        <StatCard label="จำนวนบิล" value={`${totalBillsToday} ใบ`} icon={ReceiptText} tone="success" />
        <StatCard label="รอจัดส่ง" value={`${pendingDeliveries} เที่ยว`} icon={Truck} tone="warning" />
        <StatCard label="ลูกหนี้ค้างชำระ" value={formatBaht(totalAR)} icon={CreditCard} tone="danger" />
      </section>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">แจ้งเตือนสต็อกใกล้หมด</h2>
            <Badge variant="danger">
              <AlertTriangle className="w-3 h-3" />
              {lowStockProducts.length} รายการ
            </Badge>
          </div>

          <Table>
            <THead>
              <TR>
                <TH>รหัส</TH>
                <TH>ชื่อสินค้า</TH>
                <TH>คงเหลือ</TH>
                <TH>จุดสั่งซื้อ (ต่ำกว่า)</TH>
              </TR>
            </THead>
            <TBody>
              {lowStockProducts.map((product) => (
                <TR key={product.id}>
                  <TD className="text-slate-500">{product.code}</TD>
                  <TD className="font-medium text-slate-800">{product.name}</TD>
                  <TD className="font-semibold text-red-600">
                    {product.quantityOnHand} {product.unitName}
                  </TD>
                  <TD className="text-slate-500">
                    {product.reorderPoint} {product.unitName}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </section>
      )}
    </div>
  )
}
