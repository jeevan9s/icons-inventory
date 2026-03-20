// type definitions for tools used in frontend
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { motion } from 'framer-motion'

// implement getStatus in lib/hooks
const statusColors: Record<string, string> = {
  'Available':    'bg-green-100 text-green-700',
  'Low Stock':    'bg-yellow-100 text-yellow-700',
  'Out of Stock': 'bg-red-100 text-red-700',
  'Returned':     'bg-green-100 text-green-700',
  'Checked Out':  'bg-blue-100 text-blue-700',
  'Overdue' : 'bg-red-100 text-red-700'
}

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`text-xs font-mp px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${statusColors[status] ?? 'bg-neutral-100 text-neutral-600'}`}>
    {status}
  </span>
)

export const ColHeader = ({ label, type, isSorted, onSort }: {
  label: string; type: string; isSorted: false | 'asc' | 'desc'; onSort: (event:unknown) => void
}) => (
  <button onClick={onSort} className="flex items-center gap-1.5 group w-full text-left">
    <span className="text-md font-semibold text-neutral-600 font-mp">{label}</span>
    <span className="text-[10px] text-neutral-400 font-mono">{type}</span>
    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
      {isSorted === 'asc' ? (
        <ChevronUp size={12} className="text-neutral-500" />
      ) : isSorted === 'desc' ? (
        <ChevronDown size={12} className="text-neutral-500" />
      ) : (
        <ArrowUpDown size={11} className="text-neutral-400" />
      )}
    </span>
  </button>
)

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/20 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="bg-white border border-neutral-200 rounded-2xl shadow-xl p-6 w-96 font-mp"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export type TableType = "Stock" | "Loans";
