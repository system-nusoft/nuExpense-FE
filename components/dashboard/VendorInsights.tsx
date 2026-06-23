"use client";

import { VendorInsight } from "@/types";

interface Props {
  data: VendorInsight[];
  currency: string;
  loading: boolean;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const COLORS = [
  "#6366f1", "#ec4899", "#f97316", "#22c55e",
  "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444",
  "#14b8a6", "#64748b",
];

export default function VendorInsights({ data, currency, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
        No expense history yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((v, i) => (
        <div key={v.name} className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          >
            {v.name[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
            <p className="text-xs text-gray-400">
              {v.count} visit{v.count !== 1 ? "s" : ""} &middot; avg {formatAmount(v.average, currency)} &middot; last {formatDate(v.lastDate)}
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
            {formatAmount(v.total, currency)}
          </p>
        </div>
      ))}
    </div>
  );
}
