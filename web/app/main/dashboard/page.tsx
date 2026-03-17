"use client"

import Layout from '@/app/components/Layout'
import { useState } from 'react'
import { Plus, Package, ClipboardList, ListTodo, AlertTriangle, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import InventoryTable from '@/app/components/InventoryTable'
import LoansTable from '@/app/components/LoansTable'
import StatCard from '@/app/components/StatCard'
import { useDatabase } from '@/services/lib/hooks/useDatabase'

type Tab = 'inventory' | 'loans'


export default function Dashboard() {
  const {useGetRows, useDeleteRow, useExport} = useDatabase(); // get hooks from lib/hooks/useDatabase

  const [tab, setTab] = useState<Tab>('loans')

  const { data: inventoryData = [] } = useGetRows("Stock")
  const { data: loansData = [] } = useGetRows("Loans")

  const totalItems = inventoryData.length
  const activeLoans = loansData.filter((l: any) => !l.timeIn).length
  const returned = loansData.filter((l: any) => !!l.timeIn).length
  const lowStock = inventoryData.filter((i: any) => i.status === 'Low Stock' || i.status === 'Out of Stock').length

  return (
    <Layout>
      <div className="min-h-[calc(100vh-115px)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 font-mp flex flex-col gap-4">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
          <StatCard icon={Package}       label="Total Items"        value={totalItems} />
          <StatCard icon={ClipboardList} label="Active Loans"       value={activeLoans} />
          <StatCard icon={ListTodo}      label="Returned"           value={returned} />
          <StatCard icon={AlertTriangle} label="Low / Out of Stock" value={lowStock} />
        </div>

        <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">

          <div className="flex flex-col min-w-0 xl:flex-[2] border border-neutral-100 rounded-2xl overflow-hidden bg-white min-h-[500px] xl:min-h-0">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 gap-3">
              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                {(['loans', 'inventory'] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all hover:cursor-pointer duration-200 capitalize font-mp
                      ${tab === t ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
<div className="flex flex-row gap-2">
              <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-neutral-800 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-700 hover:scale-105 transition-colors font-mp whitespace-nowrap">
                <Download size={13} /> Export 
              </button>

              <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-neutral-800 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-700 hover:scale-105 transition-colors font-mp whitespace-nowrap">
                <Plus size={13} /> Add Item
              </button>
            </div>

</div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  {tab === 'inventory' && <InventoryTable data={inventoryData} />}
                  {tab === 'loans'     && <LoansTable data={loansData} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="xl:flex-[1] min-w-0 border border-neutral-100 rounded-2xl bg-white min-h-[300px] xl:min-h-0" />

        </div>
      </div>
    </Layout>
  )
}