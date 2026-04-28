type StatCardProps = {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}

// to be used as the top layer of the dashboard
export default function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
      <div className="p-1.5 sm:p-2.5 bg-neutral-50 rounded-lg sm:rounded-xl shrink-0">
        <Icon size={16} className="sm:w-[18px] sm:h-[18px] text-neutral-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-mp text-neutral-400 truncate">{label}</p>
        <p className="text-lg sm:text-xl font-mp font-semibold text-neutral-800">{value}</p>
        {sub && <p className="text-[10px] sm:text-xs font-mp text-neutral-400 truncate">{sub}</p>}
      </div>
    </div>
  )
}