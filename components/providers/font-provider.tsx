"use client"

import { useEffect, useState } from "react"

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedSize = localStorage.getItem("ananpos_fontSize") || "text-base"
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg", "text-xl")
    document.documentElement.classList.add(savedSize)
    setMounted(true)
  }, [])

  // To avoid hydration mismatch, you could render children only after mount, 
  // but for pure HTML class changes it's fine.
  return <>{children}</>
}
