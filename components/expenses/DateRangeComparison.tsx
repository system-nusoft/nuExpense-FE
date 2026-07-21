"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { DateRangeComparisonRow } from "@/types";
import { getDateRangeComparisonApi } from "@/lib/services/expenses.service";
import Button from "@/components/Button";

interface Props {
  currency: string;
}

const MONTHS_OPTIONS = [3, 6, 12];

function monthLabel(yyyymm: string, locale: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  return new Date(year, month - 1).toLocaleString(locale, {
    month: "short",
    year: "2-digit",
  });
}

function dayLabel(iso: string): string {
  const [, , day] = iso.split("-").map(Number);
  return String(day);
}

export default function DateRangeComparison({ currency }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [startDay, setStartDay] = useState(1);
  const [endDay, setEndDay] = useState(15);
  const [months, setMonths] = useState(6);
  const [data, setData] = useState<DateRangeComparisonRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatAxisTick = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}K`;
    return String(v);
  };

  async function handleCompare() {
    if (startDay > endDay) {
      setError(t("expenses.compare.errorDayRange"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const rows = await getDateRangeComparisonApi({ startDay, endDay, months });
      setData(rows);
    } catch {
      setError(t("expenses.compare.errorLoad"));
    } finally {
      setLoading(false);
    }
  }

  const chartData = (data ?? []).map((d) => ({
    rawMonth: d.month,
    month: monthLabel(d.month, language),
    total: d.total,
    count: d.count,
    rangeStart: d.rangeStart,
    rangeEnd: d.rangeEnd,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-900">{t("expenses.compare.title")}</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {t("expenses.compare.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("expenses.compare.fromDay")}</label>
          <input
            type="number"
            min={1}
            max={31}
            value={startDay}
            onChange={(e) => setStartDay(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a]"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("expenses.compare.toDay")}</label>
          <input
            type="number"
            min={1}
            max={31}
            value={endDay}
            onChange={(e) => setEndDay(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a]"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t("expenses.compare.compareAcross")}</label>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a]"
          >
            {MONTHS_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {t("expenses.compare.lastNMonths", { count: m })}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleCompare} loading={loading} className="h-fit">
          {t("expenses.compare.compare")}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mt-3">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-5 flex flex-col gap-4">
          {chartData.every((d) => d.total === 0) ? (
            <p className="text-center text-gray-400 text-sm py-6">
              {t("expenses.compare.noExpensesFound")}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatAxisTick}
                  width={36}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), t("charts.spent")]}
                  labelFormatter={(label, payload) => {
                    const p = payload?.[0]?.payload;
                    if (!p) return label;
                    return `${label} (${dayLabel(p.rangeStart)}–${dayLabel(p.rangeEnd)})`;
                  }}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#3e6378" />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="flex flex-col gap-1.5">
            {data.map((row, i) => {
              const prev = i > 0 ? data[i - 1] : null;
              const pctChange =
                prev && prev.total > 0 ? ((row.total - prev.total) / prev.total) * 100 : null;
              const isLatest = i === data.length - 1;
              return (
                <div
                  key={row.month}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    isLatest ? "bg-[#eef2f5]" : "bg-gray-50"
                  }`}
                >
                  <div>
                    <span className="font-medium text-gray-900">{monthLabel(row.month, language)}</span>
                    <span className="text-gray-400 text-xs ms-1.5">
                      {dayLabel(row.rangeStart)}–{dayLabel(row.rangeEnd)} · {t("expenses.compare.expenseCount", { count: row.count })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{formatCurrency(row.total)}</span>
                    {pctChange !== null && (
                      <span
                        className={`text-xs font-medium ${
                          pctChange > 0 ? "text-red-500" : pctChange < 0 ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {pctChange > 0 ? "▲" : pctChange < 0 ? "▼" : "–"} {Math.abs(pctChange).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
