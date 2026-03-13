"use client"

import { useState, useMemo } from "react"
import { SortingState, ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender} from "@tanstack/react-table"
import { ColHeader, StatusBadge } from "../frontendTypes"
import { MoreVertical, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from "@/components/ui/input"
import { motion,  } from 'framer-motion'

// CHECK INVENTORYTABLE FOR INLINE COMMENTS & EXPLANATIONS, this file was copied from there and adjusted. 

// representation of a Supabase row 
export type LoanRow = {
  id: string
  item: string
  signee: string
  student_id: string
  student_name: string
  location: string
  notes: string
  time_out: string
  time_in: string
  status: string
}

export default function LoansTable({ data }: { data: LoanRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<LoanRow>[]>(() => [
    {
      id: 'select',
      header: () => <input type="checkbox" className="rounded accent-green-500" />,
      cell: () => <input type="checkbox" className="rounded accent-green-500" />,
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => <ColHeader label="Rental ID" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="font-mono text-xs text-neutral-400">{getValue() as string}</span>,
    },
    {
      accessorKey: 'item',
      header: ({ column }) => <ColHeader label="Item Name" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-800 font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: 'signee',
      header: ({ column }) => <ColHeader label="Signee" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-600">{getValue() as string}</span>,
    },
    {
      accessorKey: 'studentNumber',
      header: ({ column }) => <ColHeader label="Student Number" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="font-mono text-xs text-neutral-400">{getValue() as string}</span>,
    },
    {
      accessorKey: 'studentName',
      header: ({ column }) => <ColHeader label="Student Name" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-600">{getValue() as string}</span>,
    },
    {
      accessorKey: 'location',
      header: ({ column }) => <ColHeader label="Location" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-600">{getValue() as string}</span>,
    },
            {
      accessorKey: 'status',
      header: ({ column }) => <ColHeader label="Status" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    
    {
      accessorKey: 'timeOut',
      header: ({ column }) => <ColHeader label="Time Loaned" type="timestampt" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="font-mono text-xs text-neutral-400">{getValue() as string}</span>,
    },
    {
      accessorKey: 'timeIn',
      header: ({ column }) => <ColHeader label="Time Returned" type="timestamp" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="font-mono text-xs text-neutral-400">{(getValue() as string) || '—'}</span>,
    },

    {
      accessorKey: 'Notes',
      header: ({ column }) => <ColHeader label="notes" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-400 text-xs">{(getValue() as string) || '—'}</span>,
    },

    {
      id: 'actions',
      header: () => null,
      cell: () => <button className="text-neutral-400 hover:text-neutral-700 transition-colors"><MoreVertical size={14} /></button>,
      size: 40,
      enableSorting: false,
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100">
        <Search size={13} className="text-neutral-400 shrink-0" />
        <Input
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Filter by id, item, student..."
          className="h-7 bg-transparent border-none text-xs text-neutral-600 placeholder:text-neutral-400 focus-visible:ring-0 font-mp p-0"
        />
      </div>
      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="border-neutral-100 hover:bg-transparent">
                {hg.headers.map(header => (
                  <TableHead key={header.id} className="bg-neutral-50 px-4 py-2.5 border-r border-neutral-100 last:border-r-0" style={{ width: header.getSize() }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="px-4 py-2.5 text-sm border-r border-neutral-50 last:border-r-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </motion.tr>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-neutral-400 py-12 font-mp text-sm">
                  No rows found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}