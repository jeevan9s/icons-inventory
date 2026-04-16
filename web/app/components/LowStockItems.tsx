"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: { name: string; net_stock: number }[];
};

export default function LowStockChart({ data }: Props) {
  if (!data.length || data.every((d) => d.net_stock === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm font-mp text-neutral-400">
        No data found
      </div>
    );
  }

  return (
    <div className="h-full w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="net_stock" fill="#6F956D" />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
