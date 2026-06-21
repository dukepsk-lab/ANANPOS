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
        className="flex items-center gap-3 px-3 py-3 w-full rounded-lg hover:bg-red-900/50 text-red-400 transition-colors text-lg"
      >
        <LogOut className="w-6 h-6" />
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
