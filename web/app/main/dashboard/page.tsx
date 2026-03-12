"use client"

import Layout from '@/app/components/Layout'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { InventoryRow } from '@/app/components/InventoryTable'
import { LoanRow } from '@/app/components/LoansTable'
import InventoryTable from '@/app/components/InventoryTable'
import LoansTable from '@/app/components/LoansTable'


type Tab = 'inventory' | 'loans'
type ViewMode = 'table' | 'board' // TODO

// design notes
/*
try 2 get strucrtew  liwe this for table viwe:  (TODO)

[    ] [     ]  [     ]  [     ]
|                               |              |
|                               |              |
|                               |              |
|                               |              |
|                               |              |


*/

type DashboardProps = {
  inventoryData?: InventoryRow[]
  loansData?: LoanRow[]
}

export default function Dashboard({ inventoryData = [], loansData = [] }: DashboardProps) {
const [tab, setTab] = useState<Tab>('inventory')

return (
  <Layout>
    <div className="h-[calc(100vh-115px)] px-8 py-6 font-mp flex flex-col gap-6">

      <div className="flex gap-6 flex-1 min-h-0">

        <div className="flex flex-col flex-[2] min-w-0 border border-neutral-100 rounded-2xl overflow-hidden bg-white">
          <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
            <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-3">
              {(['inventory', 'loans'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all hover:cursor-pointer duration-200 capitalize font-mp
                    ${tab === t ? 'bg-white shadow-sm text-neutral-800' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-neutral-800 text-white text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-700 transition-colors font-mp">
              <Plus size={15} /> Add Item
            </button>
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

        <div className="flex flex-col flex-[1] min-w-0 min-h-0 border border-neutral-100 rounded-2xl bg-white" />

      </div>
    </div>
  </Layout>
)
}