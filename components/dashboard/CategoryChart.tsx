"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CategorySummary } from "@/types";

interface Props {
  data: CategorySummary[];
  currency: string;
}

export default function CategoryChart({ data, currency }: Props) {
  const formatValue = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(v);

  const total = data.reduce((s, d) => s + d.total, 0);
  const hasAnyBudget = data.some((d) => d.budgetAmount);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No expenses this month
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!hasAnyBudget && (
        <Link
          href="/categories"
          className="flex items-center gap-3 bg-[#eef2f5] hover:bg-[#e3ebef] rounded-xl px-3 py-2.5 transition-colors"
        >
          <span className="text-lg flex-shrink-0">🎯</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#263e4e]">No budgets set yet</p>
            <p className="text-xs text-[#3e6378]">
              Set a monthly budget per category to see how close you are to your limit →
            </p>
          </div>
        </Link>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [formatValue(Number(v ?? 0)), "Spent"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {data.map((d) => {
          const pct = total > 0 ? ((d.total / total) * 100).toFixed(1) : "0";
          const budgetPct = d.budgetAmount ? Math.min((d.total / d.budgetAmount) * 100, 100) : null;
          const overBudget = d.budgetAmount ? d.total > d.budgetAmount : false;
          const barColor = overBudget ? "#ef4444" : budgetPct && budgetPct >= 80 ? "#f59e0b" : "#22c55e";
          return (
            <div key={d.categoryId ?? "none"}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-gray-700 truncate">
                    {d.icon && !/[a-z]/.test(d.icon) ? `${d.icon} ` : ""}{d.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-gray-400 text-xs">{pct}%</span>
                  <span className={`font-medium ${overBudget ? "text-red-600" : "text-gray-900"}`}>
                    {formatValue(d.total)}
                  </span>
                </div>
              </div>
              {d.budgetAmount && (
                <div className="mt-1.5 ml-4">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${budgetPct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {overBudget
                      ? `${formatValue(d.total - d.budgetAmount)} over budget`
                      : `${formatValue(d.budgetAmount - d.total)} remaining`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
