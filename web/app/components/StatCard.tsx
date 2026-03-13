type StatCardProps = {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}

// to be used as the top layer of the dashboard
export default function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className="p-2.5 bg-neutral-50 rounded-xl shrink-0">
        <Icon size={16} className="text-neutral-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-mp text-neutral-400 truncate">{label}</p>
        <p className="text-xl font-mp font-semibold text-neutral-800">{value}</p>
        {sub && <p className="text-xs font-mp text-neutral-400 truncate">{sub}</p>}
      </div>
    </div>
  )
}