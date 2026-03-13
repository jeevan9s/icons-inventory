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
import { getStockStatus } from "@/services/lib/hooks/helpers"


// representation of a Supabase row.
// status will be dynamic through function implementation in lib/helpers
export type InventoryRow = {
  id: number
  name: string
  total_stock: number
  net_stock: number
  item_properties: {
    equipment_type?: string
    [key: string]: any
  } | null
}

// uses headless tanstack to get a Table object, and then maps to frontend with components for rendering
export default function InventoryTable({ data }: { data: InventoryRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  /*
  ** filtering flow
  - useState used to manage if filter input (JSX element) is toggled/populated 
  - if it is, update the state
  - re-run getFilteredRowModel with the updated state
  - build object for rendering
  */

  // useMemo hook to store values between renders
  const columns = useMemo<ColumnDef<InventoryRow>[]>(() => [
    {
      // select buttons
      id: 'select',
      header: () => <input type="checkbox" className="rounded accent-green-600" />,
      cell: () => <input type="checkbox" className="rounded accent-green-600" />,
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: 'id', // accessorKey refers to what property/column in the table to look at
      header: ({ column }) => <ColHeader label="Item ID" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />, // returns the UI for the front of the header, defined in /frontendTypes.tsx
      cell: ({ getValue }) => <span className="font-mono text-xs text-neutral-400">{getValue() as string}</span>, // populates the cell with a fetched value, in this case with getValue(), specifies formatting
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <ColHeader label="Item Name" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-800 font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: 'total_stock',
      header: ({ column }) => <ColHeader label="Total" type="int" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-600">{getValue() as number}</span>,
    },
    {
      accessorKey: 'net_stock',
      header: ({ column }) => <ColHeader label="Available" type="int" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-600">{getValue() as number}</span>,
    },
    {
      id: 'equipment_type',
      accessorFn: (row) => row.item_properties?.equipment_type ?? '—',
      header: ({ column }) => <ColHeader label="Type" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ getValue }) => <span className="text-neutral-600">{getValue() as string}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <ColHeader label="Status" type="text" isSorted={column.getIsSorted()} onSort={column.getToggleSortingHandler()!} />,
      cell: ({ row }) => <StatusBadge status={getStockStatus(row.original)} />,
    },

    // properties button
    {
      id: 'actions',
      header: () => null,
      cell: () => <button className="text-neutral-400 hover:text-neutral-700 transition-colors"><MoreVertical size={14} /></button>,
      size: 40,
      enableSorting: false,
    },
  ], [])

  // table object
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
          placeholder="Filter by id, name, status..."
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