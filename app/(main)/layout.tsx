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
      <aside className="w-56 bg-slate-900 text-slate-300 flex-col hidden md:flex shrink-0 z-20">
        <div className="h-14 flex items-center px-4 bg-slate-950 text-white font-bold text-base gap-2 border-b border-slate-800">
          <Store className="w-5 h-5 text-accent" />
          <span className="font-heading tracking-tight">ANAN POS</span>
        </div>
        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {visibleMenu.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors duration-150 text-sm font-medium text-slate-300"
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-slate-800">
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
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-heading font-bold text-slate-800 hidden md:block tracking-tight">หน้าหลัก</h1>
          </div>
          <div className="flex items-center gap-4">
            <FontSizeToggle />
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                {session.user.name?.charAt(0)}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-slate-800 text-xs">{session.user.name}</span>
                <span className="text-[11px] text-primary font-medium">{role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
