import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: Number(params.id) },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true } }
      }
    })

    return NextResponse.json(movements)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch movements" }, { status: 500 })
  }
}
