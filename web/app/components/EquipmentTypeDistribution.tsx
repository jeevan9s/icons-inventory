"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TypeDistributionChartProps {
  data: { category: string; count: number }[];
}

const COLORS = [
  "#6F956D",
  "#7D3C38",
  "#263F66",
  "#f1cf0e",
  "#8b5cf6",
  "#76f63b",
];

export default function TypeDistributionChart({
  data,
}: TypeDistributionChartProps) {
  if (!data.length || data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-[100%] text-sm font-mp text-neutral-400">
        No data found
      </div>
    );
  }

  return (
    <div className="h-full w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={175}
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
    </div>
  );
}
