"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getExpensesApi } from "@/lib/services/expenses.service";
import { getCategoriesApi } from "@/lib/services/categories.service";
import { Expense, Category } from "@/types";
import ExpenseCard from "@/components/expenses/ExpenseCard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
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
  const [loading, setLoading] = useState(true);

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
        // fail silently on dashboard
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Stats: total this month
  const now = new Date();
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalThisMonth = thisMonthExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || "0"),
    0
  );

  const currencySymbol = user?.homeCurrency || "USD";

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencySymbol,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.name || user?.email?.split("@")[0] || "there"}{" "}
          👋
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
              <svg
                className="w-9 h-9 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total this month"
          value={formatCurrency(totalThisMonth)}
          loading={loading}
        />
        <StatCard
          label="Receipts this month"
          value={String(thisMonthExpenses.length)}
          loading={loading}
        />
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Expenses
          </h2>
          <Link
            href="/expenses"
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
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
                category={
                  expense.categoryId
                    ? categoryMap.get(expense.categoryId)
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
