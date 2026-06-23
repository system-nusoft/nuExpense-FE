"use client";

import React, { useState } from "react";
import { Category, ExpenseDraft, Expense } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { createExpenseApi } from "@/lib/services/expenses.service";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { CURRENCY_OPTIONS } from "@/lib/currencies";
import Button from "@/components/Button";

interface ExpenseReviewFormProps {
  draft: ExpenseDraft;
  categories: Category[];
  receiptImageKey?: string;
  receiptPreviewUrl?: string;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseReviewForm({
  draft,
  categories,
  receiptImageKey,
  receiptPreviewUrl,
  onSave,
  onCancel,
}: ExpenseReviewFormProps) {
  const { user } = useAuth();

  const [vendor, setVendor] = useState(draft.vendor || "");
  const [amount, setAmount] = useState(draft.amount || "");
  const [currency, setCurrency] = useState(
    draft.currency || user?.homeCurrency || "USD"
  );
  const [date, setDate] = useState(
    draft.date ? draft.date.split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [categoryId, setCategoryId] = useState(
    draft.suggestedCategoryId || ""
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vendor || !amount || !date) {
      setError("Please fill in vendor, amount, and date.");
      return;
    }

    setLoading(true);
    try {
      const expense = await createExpenseApi({
        vendor,
        amount,
        currency,
        date,
        categoryId: categoryId || undefined,
        receiptImageKey: receiptImageKey || draft.receiptImageKey,
        notes: notes || undefined,
      });
      onSave(expense);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save expense. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Receipt Preview */}
      {receiptPreviewUrl && (
        <div className="md:w-64 flex-shrink-0">
          <p className="text-sm font-medium text-gray-700 mb-2">Receipt</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receiptPreviewUrl}
            alt="Receipt"
            className="w-full rounded-xl border border-gray-200 object-contain max-h-80"
          />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="flex-1 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {draft.confidence !== undefined && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700">
            AI confidence: {Math.round(draft.confidence * 100)}% — please review
            and correct if needed.
          </div>
        )}

        <Input
          label="Vendor / Merchant"
          name="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder="e.g. Starbucks"
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            disabled={loading}
          />
          <Select
            label="Currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={CURRENCY_OPTIONS}
            required
            disabled={loading}
          />
        </div>

        <Input
          label="Date"
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={loading}
        />

        <Select
          label="Category"
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
          placeholder="Select a category"
          disabled={loading}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Save Expense
          </Button>
        </div>
      </form>
    </div>
  );
}
