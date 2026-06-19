"use client";

import React from "react";
import { Expense, Category } from "@/types";

interface ExpenseCardProps {
  expense: Expense;
  category?: Category;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency} ${amount}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

export default function ExpenseCard({
  expense,
  category,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      {/* Category color dot */}
      <div className="flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
          style={{
            backgroundColor: category?.color || "#6366f1",
          }}
        >
          {category?.icon && !/[a-z]/.test(category.icon)
            ? category.icon
            : category?.name?.[0]?.toUpperCase() || expense.vendor?.[0]?.toUpperCase() || "?"}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm">
              {expense.vendor || "Unknown vendor"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {category?.name || "Uncategorized"} &middot; {formatDate(expense.date)}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="font-semibold text-gray-900 text-sm">
              {formatAmount(expense.amount, expense.currency)}
            </p>
            {expense.homeCurrencyCode &&
              expense.homeCurrencyCode !== expense.currency &&
              expense.homeCurrencyAmount && (
                <p className="text-xs text-gray-400 mt-0.5">
                  ≈ {formatAmount(expense.homeCurrencyAmount, expense.homeCurrencyCode)}
                </p>
              )}
            {expense.receiptImageUrl && (
              <a
                href={expense.receiptImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Receipt
              </a>
            )}
          </div>
        </div>

        {expense.notes && (
          <p className="text-xs text-gray-400 mt-1 truncate">{expense.notes}</p>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex-shrink-0 flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="Edit expense"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete expense"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
