"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LoanRow } from "@/services/lib/types";
import { buildLoanTrends } from "@/services/lib/analytics";

interface LoanTrendsChartProps {
  loans: LoanRow[];
  selection?: LoanRow[];
  mode?: "hourly" | "daily";
  normalize?: boolean;
}

export default function LoanTrendsChart({
  loans,
  selection,
  mode = "hourly",
  normalize = false,
}: LoanTrendsChartProps) {
  const data = buildLoanTrends(loans, selection, { mode, normalize });

  if (!data.length || data.every((d) => d.total === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm font-mp text-neutral-400">
        No data found
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip
            formatter={(value: any) => {
              if (typeof value === "number") {
                return normalize ? `${(value * 100).toFixed(1)}%` : value;
              }
              return value;
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#6F956D"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
