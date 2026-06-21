import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { CustomerDetailClient } from "@/components/ar/customer-detail-client"

const prisma = new PrismaClient()

export default async function CustomerDetailPage({
  params
}: {
  params: { id: string }
}) {
  const customerId = parseInt(params.id)
  if (isNaN(customerId)) return notFound()

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      sales: {
        orderBy: { saleDate: 'desc' }
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: {
          createdBy: { select: { name: true } }
        }
      }
    }
  })

  if (!customer) return notFound()

  return <CustomerDetailClient customer={customer} />
}
