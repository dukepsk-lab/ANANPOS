"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

type User = {
  id: number
  name: string
  role: string
}

export function LoginClient({ users }: { users: User[] }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setPin("")
    setError(false)
  }

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      if (newPin.length === 4) {
        submitLogin(selectedUser!.id, newPin)
      }
    }
  }

  const handleDelete = () => setPin((prev) => prev.slice(0, -1))
  const handleClear = () => setPin("")

  const submitLogin = async (userId: number, currentPin: string) => {
    setLoading(true)
    setError(false)
    
    try {
      const res = await signIn("credentials", {
        userId: userId.toString(),
        pin: currentPin,
        redirect: false,
      })

      if (res?.error) {
        setError(true)
        setPin("")
        setTimeout(() => setError(false), 500) // remove shake class after animation
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (e) {
      setError(true)
      setPin("")
    } finally {
      setLoading(false)
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full justify-center">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800">เลือกผู้ใช้งาน</h2>
        <div className="grid grid-cols-2 gap-4">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="p-6 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-xl font-medium text-slate-700">{user.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full justify-center max-w-xs mx-auto w-full">
      <button 
        onClick={() => setSelectedUser(null)}
        className="text-blue-600 font-medium mb-8 text-left hover:underline"
      >
        ← เปลี่ยนผู้ใช้งาน
      </button>

      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-4">
          {selectedUser.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{selectedUser.name}</h2>
        <p className="text-slate-500">ใส่รหัส 4 หลัก</p>
      </div>

      <div className={cn("flex justify-center gap-3 mb-8", error && "animate-shake")}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-5 h-5 rounded-full transition-all duration-200",
              pin.length > i ? "bg-blue-600 scale-110" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-center font-medium mb-4">รหัสไม่ถูกต้อง</p>}

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePinInput(num.toString())}
            disabled={loading}
            className="h-16 text-2xl font-medium rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          disabled={loading}
          className="h-16 text-lg font-medium text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"
        >
          ล้าง
        </button>
        <button
          onClick={() => handlePinInput("0")}
          disabled={loading}
          className="h-16 text-2xl font-medium rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="h-16 text-lg font-medium text-slate-500 rounded-xl hover:bg-slate-50 transition-colors"
        >
          ลบ
        </button>
      </div>
    </div>
  )
}
