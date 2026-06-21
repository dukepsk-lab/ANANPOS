import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FontSizeToggle } from "@/components/ui/font-size-toggle"
import { LogoutButton } from "@/components/ui/logout-button"
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Store,
  Menu
} from "lucide-react"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role as string

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
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex shrink-0 shadow-xl z-20">
        <div className="h-20 flex items-center px-6 bg-primary text-white font-bold text-2xl gap-3 shadow-md">
          <Store className="w-8 h-8" />
          <span className="font-heading tracking-tight">ANAN POS</span>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          {visibleMenu.map((item) => {
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-primary hover:text-white transition-all duration-200 font-bold"
              >
                <Icon className="w-6 h-6" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 bg-slate-950/50">
          <form id="logout-form" action={async () => {
            "use server"
            await signOut()
          }}>
            <LogoutButton />
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-heading font-bold text-slate-800 hidden md:block tracking-tight">หน้าหลัก</h1>
          </div>
          <div className="flex items-center gap-6">
            <FontSizeToggle />
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {session.user.name?.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 leading-none">{session.user.name}</span>
                <span className="text-xs text-primary font-bold">{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
