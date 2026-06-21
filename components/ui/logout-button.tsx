"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function LogoutButton() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleLogout = () => {
    // Instead of creating a whole form in client, we can submit a hidden form
    const form = document.getElementById("logout-form") as HTMLFormElement
    if (form) form.requestSubmit()
  }

  return (
    <>
      <button
        onClick={() => setIsConfirmOpen(true)}
        className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md hover:bg-red-900/40 text-red-400 transition-colors text-sm font-medium"
      >
        <LogOut className="w-4 h-4" />
        ออกจากระบบ
      </button>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="ออกจากระบบ"
        message="คุณต้องการออกจากระบบใช่หรือไม่?"
        confirmText="ออกจากระบบ"
        isDestructive={true}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  )
}
