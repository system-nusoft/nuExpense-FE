"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MonthlySummary } from "@/types";

interface Props {
  data: MonthlySummary[];
  currency: string;
  selectedMonth?: string;
  onBarClick?: (month: string) => void;
}

function formatMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  return new Date(year, month - 1).toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export default function MonthlyChart({ data, currency, selectedMonth, onBarClick }: Props) {
  const chartData = data.map((d) => ({
    rawMonth: d.month,
    month: formatMonth(d.month),
    total: d.total,
  }));

  const formatValue = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);

  const formatAxisTick = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}K`;
    return String(v);
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        onClick={(e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const payload = (e as any)?.activePayload?.[0]?.payload;
          if (onBarClick && payload?.rawMonth) onBarClick(payload.rawMonth);
        }}
        style={{ cursor: onBarClick ? "pointer" : "default" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={formatAxisTick} width={36} />
        <Tooltip
          formatter={(v) => [formatValue(Number(v ?? 0)), "Spent"]}
          contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.rawMonth === selectedMonth ? "#4338ca" : "#6366f1"}
              opacity={selectedMonth && entry.rawMonth !== selectedMonth ? 0.5 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
