import { prisma } from "@/lib/prisma"
import { LoginClient } from "./login-client"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true }
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl card overflow-hidden flex min-h-[480px] p-0">
        {/* Left side - Welcome */}
        <div className="w-1/2 bg-slate-900 text-white p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-heading font-bold mb-3">ระบบจัดการร้านวัสดุก่อสร้าง</h1>
          <p className="text-slate-400 text-sm">เข้าสู่ระบบเพื่อเริ่มการขายและจัดการข้อมูล</p>
        </div>

        {/* Right side - Login */}
        <div className="w-1/2 p-8 bg-white flex flex-col justify-center">
          <LoginClient users={users} />
        </div>
      </div>
    </div>
  )
}
