import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { InvoiceDetailClient } from "@/components/ar/invoice-detail-client"

const prisma = new PrismaClient()

export default async function InvoiceDetailPage({
  params
}: {
  params: { id: string }
}) {
  const invoiceId = parseInt(params.id)
  if (isNaN(invoiceId)) return notFound()

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      createdBy: { select: { name: true } },
      invoiceSales: {
        include: {
          sale: {
            include: {
              items: {
                include: { 
                  product: { select: { code: true, name: true } },
                  productUnit: { include: { unit: true } }
                }
              }
            }
          }
        }
      },
      payments: {
        orderBy: { paymentDate: "desc" },
        include: {
          createdBy: { select: { name: true } }
        }
      }
    }
  })

  if (!invoice) return notFound()

  return <InvoiceDetailClient invoice={invoice} />
}
