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
  data: { name: string; borrowed: number }[];
};

export default function DemandItemsChart({ data }: Props) {
  if (!data.length || data.every((d) => d.borrowed === 0)) {
    return (
      <div className="flex items-center justify-center h-full h-full text-sm font-mp text-neutral-400">
        No data found
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" width={120} type="category" />
          <Tooltip />
          <Bar dataKey="borrowed" fill="#6F956D" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
