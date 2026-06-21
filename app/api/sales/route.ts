import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      customerId,
      subtotal,
      discountAmount,
      vatAmount,
      grandTotal,
      paymentType,
      paidAmount,
      docType,
      items // Array of { productId, productUnitId, quantity, quantityBase, unitPrice, lineTotal }
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }

    const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '') // YYMMDD
    
    // Execute transaction
    const newSale = await prisma.$transaction(async (tx) => {
      
      // 1. Generate Bill No
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const countToday = await tx.sale.count({
        where: { saleDate: { gte: todayStart } }
      })
      const billNo = `INV-${todayStr}-${String(countToday + 1).padStart(4, '0')}`

      // 2. Create Sale and SaleItems
      const sale = await tx.sale.create({
        data: {
          billNo,
          userId: Number(session.user.id),
          customerId: customerId ? Number(customerId) : null,
          subtotal: Number(subtotal),
          discountAmount: Number(discountAmount),
          vatAmount: Number(vatAmount),
          grandTotal: Number(grandTotal),
          paymentType,
          paidAmount: Number(paidAmount),
          status: 'COMPLETED',
          docType,
          items: {
            create: items.map((item: any) => ({
              productId: Number(item.productId),
              productUnitId: Number(item.productUnitId),
              quantity: Number(item.quantity),
              quantityBase: Number(item.quantityBase),
              unitPrice: Number(item.unitPrice),
              lineTotal: Number(item.lineTotal)
            }))
          }
        },
        include: { items: true }
      })

      // 3. Deduct Stock & Create Stock Movements
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.productId) }
        })

        if (product && product.isStockItem) {
          // Deduct from StockBalance
          await tx.stockBalance.update({
            where: { productId: product.id },
            data: { quantityOnHand: { decrement: Number(item.quantityBase) } }
          })

          // Create StockMovement
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: 'SALE',
              quantity: Number(item.quantityBase),
              referenceDoc: billNo,
              userId: Number(session.user.id)
            }
          })
        }
      }

      // 4. Update Customer Balance if CREDIT or PARTIAL
      if (customerId && (paymentType === 'CREDIT' || paymentType === 'PARTIAL')) {
        const creditAmount = Number(grandTotal) - Number(paidAmount)
        if (creditAmount > 0) {
          await tx.customer.update({
            where: { id: Number(customerId) },
            data: { balance: { increment: creditAmount } }
          })
        }
      }

      return sale
    })

    return NextResponse.json({ success: true, saleId: newSale.id, billNo: newSale.billNo })

  } catch (error) {
    console.error("Sale Error:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
