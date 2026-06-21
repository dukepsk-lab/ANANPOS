"use client"

import { X } from "lucide-react"

export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  isDestructive = false
}: {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            <button onClick={onCancel} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="px-4 py-3 border-t border-border bg-slate-50 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="btn-ghost"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onCancel()
            }}
            className={isDestructive ? "inline-flex items-center justify-center gap-2 bg-destructive text-white hover:bg-destructive/90 px-4 py-2 rounded-md text-sm font-semibold shadow-sm" : "btn-primary"}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
