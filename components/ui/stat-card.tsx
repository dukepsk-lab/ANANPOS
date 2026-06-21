import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: "default" | "success" | "warning" | "danger"
  hint?: string
}) {
  const toneClasses = {
    default: "bg-blue-50 text-primary",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
  }[tone]

  return (
    <div className="card p-4 flex items-center gap-3">
      {Icon && (
        <div className={cn("w-10 h-10 rounded-md flex items-center justify-center shrink-0", toneClasses)}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
        <p className="text-xl font-heading font-bold text-slate-800 leading-tight">{value}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}
