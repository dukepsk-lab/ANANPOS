"use client"

import { useState, useEffect } from "react"
import { Type } from "lucide-react"

export function FontSizeToggle() {
  const [size, setSize] = useState("text-base")

  useEffect(() => {
    const saved = localStorage.getItem("ananpos_fontSize")
    if (saved) setSize(saved)
  }, [])

  const toggleSize = () => {
    const sizes = ["text-sm", "text-base", "text-lg", "text-xl"]
    const currentIndex = sizes.indexOf(size)
    const nextSize = sizes[(currentIndex + 1) % sizes.length]
    
    setSize(nextSize)
    localStorage.setItem("ananpos_fontSize", nextSize)
    
    // Apply to html element
    document.documentElement.classList.remove(...sizes)
    document.documentElement.classList.add(nextSize)
  }

  return (
    <button 
      onClick={toggleSize}
      title="ปรับขนาดตัวอักษร"
      className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1"
    >
      <Type className="w-5 h-5" />
      <span className="text-xs font-bold uppercase w-4">{size === "text-sm" ? "S" : size === "text-base" ? "M" : size === "text-lg" ? "L" : "XL"}</span>
    </button>
  )
}
