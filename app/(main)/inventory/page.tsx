import { prisma } from "@/lib/prisma"
import { InventoryClient } from "@/components/inventory/inventory-client"
import { PageHeader } from "@/components/ui/page-header"

export const dynamic = "force-dynamic"


export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    where: { isStockItem: true, isActive: true },
    include: {
      category: true,
      baseUnit: true,
      stockBalance: true
    },
    orderBy: { name: 'asc' }
  })

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="จัดการสต็อกสินค้า" />
      <InventoryClient products={products} categories={categories} />
    </div>
  )
}
