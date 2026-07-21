"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setError(t("expenses.review.errorRequiredFields"));
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
          ?.message || t("expenses.review.errorSave");
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
          <p className="text-sm font-medium text-gray-700 mb-2">{t("expenses.review.receiptLabel")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receiptPreviewUrl}
            alt={t("expenses.review.receiptAlt")}
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
          <div className="bg-[#eef2f5] border border-[#d5e2ea] rounded-lg px-3 py-2 text-xs text-[#325163]">
            {t("expenses.review.aiConfidence", { percent: Math.round(draft.confidence * 100) })}
          </div>
        )}

        <Input
          label={t("expenses.modal.vendorLabel")}
          name="vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder={t("expenses.modal.vendorPlaceholder")}
          required
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("expenses.modal.amountLabel")}
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
            label={t("expenses.modal.currencyLabel")}
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={CURRENCY_OPTIONS}
            required
            disabled={loading}
          />
        </div>

        <Input
          label={t("expenses.modal.dateLabel")}
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={loading}
        />

        <Select
          label={t("expenses.modal.categoryLabel")}
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
          placeholder={t("expenses.review.categoryPlaceholder")}
          disabled={loading}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {t("expenses.modal.notesLabel")} <span className="text-gray-400 font-normal">{t("common.optional")}</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("expenses.modal.notesPlaceholder")}
            rows={3}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a7a9a] focus:border-[#4a7a9a] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
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
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {t("expenses.modal.saveExpense")}
          </Button>
        </div>
      </form>
    </div>
  );
}
