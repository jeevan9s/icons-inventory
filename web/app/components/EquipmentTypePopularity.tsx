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

interface PopularityChartProps {
  data: { name: string; borrowed: number }[];
}

export default function PopularityChart({ data }: PopularityChartProps) {
  if (!data.length || data.every((d) => d.borrowed === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm font-mp text-neutral-400">
        No data found
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="borrowed" fill="#6F956D" />
      </BarChart>
    </ResponsiveContainer>
  );
}
