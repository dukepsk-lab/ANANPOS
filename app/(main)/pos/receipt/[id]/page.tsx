import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { ReceiptClient } from "./receipt-client"

const prisma = new PrismaClient()

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const sale = await prisma.sale.findUnique({
    where: { id: Number(params.id) },
    include: {
      items: {
        include: {
          product: true,
          productUnit: {
            include: { unit: true }
          }
        }
      },
      customer: true,
      user: true
    }
  })

  if (!sale) notFound()

  return <ReceiptClient sale={sale} />
}
