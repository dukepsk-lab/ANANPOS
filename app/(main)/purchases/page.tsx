import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, PackagePlus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"


export const dynamic = "force-dynamic"

export default async function PurchasesPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { purchaseDate: 'desc' },
    include: {
      supplier: true,
      items: true
    },
    take: 50 // Limit for MVP
  })

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <PageHeader
        title="รับสินค้าเข้า (Purchases)"
        description="ประวัติการสั่งซื้อและรับสินค้าเข้าสต็อก"
        actions={
          <Link href="/purchases/new" className="btn-primary">
            <Plus className="w-4 h-4" /> รับสินค้าใหม่
          </Link>
        }
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <Table>
          <THead>
            <tr>
              <TH>วันที่ทำรายการ</TH>
              <TH>เลขที่อ้างอิง (PO)</TH>
              <TH>ผู้จัดจำหน่าย</TH>
              <TH className="text-center">จำนวนรายการ</TH>
              <TH className="text-right">ยอดรวม (บาท)</TH>
              <TH className="text-center">สถานะ</TH>
            </tr>
          </THead>
          <TBody>
            {purchases.map(p => (
              <TR key={p.id}>
                <TD className="text-slate-600">{new Date(p.purchaseDate).toLocaleDateString('th-TH')}</TD>
                <TD className="font-medium text-slate-800">{p.purchaseNo}</TD>
                <TD className="text-slate-800">{p.supplier.name}</TD>
                <TD className="text-center text-slate-600">{p.items.length}</TD>
                <TD className="text-right font-semibold text-slate-800">{formatBaht(p.total)}</TD>
                <TD className="text-center">
                  <Badge variant="success">รับเข้าแล้ว</Badge>
                </TD>
              </TR>
            ))}

            {purchases.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState icon={PackagePlus} title="ยังไม่มีประวัติการรับสินค้าเข้า" />
                </td>
              </tr>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  )
}
