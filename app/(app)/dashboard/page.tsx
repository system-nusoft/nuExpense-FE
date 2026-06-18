"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getExpensesApi,
  getMonthlySummaryApi,
  getCategorySummaryApi,
  downloadCsvApi,
} from "@/lib/services/expenses.service";
import { getCategoriesApi } from "@/lib/services/categories.service";
import { Expense, Category, MonthlySummary, CategorySummary } from "@/types";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import CategoryChart from "@/components/dashboard/CategoryChart";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function currentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}

function monthLabel(yyyymm: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  return new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function prevMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  if (month === 1) return `${year - 1}-12`;
  return `${year}-${String(month - 1).padStart(2, "0")}`;
}

function nextMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  if (month === 12) return `${year + 1}-01`;
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />;
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      {loading ? (
        <div className="h-7 bg-gray-200 rounded animate-pulse w-24" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue());
  const [csvStart, setCsvStart] = useState(currentMonthValue());
  const [csvEnd, setCsvEnd] = useState(currentMonthValue());

  const currencyCode = user?.homeCurrency || "USD";

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  useEffect(() => {
    async function load() {
      try {
        const [expData, catData] = await Promise.all([
          getExpensesApi({ page: 1, limit: 5 }),
          getCategoriesApi(),
        ]);
        setExpenses(expData.data);
        setCategories(catData);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getMonthlySummaryApi();
        setMonthlySummary(data);
      } catch {
        // fail silently
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, []);

  const loadCategorySummary = useCallback(async (month: string) => {
    setCategoryLoading(true);
    try {
      const data = await getCategorySummaryApi(month);
      setCategorySummary(data);
    } catch {
      // fail silently
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorySummary(selectedMonth);
  }, [selectedMonth, loadCategorySummary]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const currentMonth = currentMonthValue();
  const selectedSummary = monthlySummary.find((m) => m.month === selectedMonth);
  const totalForMonth = selectedSummary?.total ?? 0;
  const countForMonth = selectedSummary?.count ?? 0;

  const isCurrentMonth = selectedMonth === currentMonth;
  const oldestAvailable = monthlySummary[0]?.month;
  const atOldest = oldestAvailable ? selectedMonth <= oldestAvailable : false;

  function lastDayOfMonth(yyyymm: string): string {
    const [year, month] = yyyymm.split("-").map(Number);
    const last = new Date(year, month, 0).getDate();
    return `${yyyymm}-${String(last).padStart(2, "0")}`;
  }

  async function handleExportCsv() {
    setCsvLoading(true);
    try {
      await downloadCsvApi(`${csvStart}-01`, lastDayOfMonth(csvEnd));
    } catch {
      // fail silently
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()},{" "}
          {user?.name || user?.email?.split("@")[0] || "there"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s your expense overview
        </p>
      </div>

      {/* Scan CTA */}
      <Link href="/scan">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white cursor-pointer hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg active:scale-[0.99]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">
                AI Receipt Scanner
              </p>
              <h2 className="text-2xl font-bold">Scan a Receipt</h2>
              <p className="text-indigo-200 text-sm mt-1">
                Snap a photo, let AI extract the details
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      <div className="text-center -mt-3">
        <Link href="/expenses?add=1" className="text-sm text-gray-400 hover:text-gray-600">
          or <span className="underline">add manually</span>
        </Link>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3">
        <button
          onClick={() => setSelectedMonth(prevMonth(selectedMonth))}
          disabled={atOldest}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{monthLabel(selectedMonth)}</p>
          {!isCurrentMonth && (
            <button
              onClick={() => setSelectedMonth(currentMonth)}
              className="text-xs text-indigo-600 hover:underline mt-0.5"
            >
              Back to current
            </button>
          )}
        </div>
        <button
          onClick={() => setSelectedMonth(nextMonth(selectedMonth))}
          disabled={isCurrentMonth}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total spent"
          value={formatCurrency(totalForMonth)}
          loading={summaryLoading}
        />
        <StatCard
          label="Expenses"
          value={String(countForMonth)}
          loading={summaryLoading}
        />
      </div>

      {/* Monthly Spend Trend */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Monthly Trend
        </h2>
        {summaryLoading ? (
          <ChartSkeleton />
        ) : (
          <MonthlyChart
            data={monthlySummary}
            currency={currencyCode}
            selectedMonth={selectedMonth}
            onBarClick={(month) => setSelectedMonth(month)}
          />
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          {monthLabel(selectedMonth)} by Category
        </h2>
        {categoryLoading ? (
          <ChartSkeleton />
        ) : (
          <CategoryChart data={categorySummary} currency={currencyCode} />
        )}
      </div>

      {/* CSV Export */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">Export CSV</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select a date range to export</p>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">From</label>
            <input
              type="month"
              value={csvStart}
              onChange={(e) => setCsvStart(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">To</label>
            <input
              type="month"
              value={csvEnd}
              onChange={(e) => setCsvEnd(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={csvLoading}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          {csvLoading ? "Preparing…" : "Download CSV"}
        </button>
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          <Link href="/expenses" className="text-sm text-indigo-600 hover:underline font-medium">
            View all
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : expenses.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-gray-600 font-medium">No expenses yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Scan your first receipt to get started
              </p>
            </div>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                category={expense.categoryId ? categoryMap.get(expense.categoryId) : undefined}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
