"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  getExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
  uploadReceiptApi,
  CreateExpensePayload,
} from "@/lib/services/expenses.service";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoriesApi } from "@/lib/services/categories.service";
import { Expense, Category } from "@/types";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseFilters, {
  FilterState,
} from "@/components/expenses/ExpenseFilters";
import DateRangeComparison from "@/components/expenses/DateRangeComparison";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { CURRENCY_OPTIONS } from "@/lib/currencies";
import Spinner from "@/components/Spinner";

const PAGE_SIZE = 20;

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

export default function ExpensesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const addParam = searchParams.get("add");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: "",
    startDate: "",
    endDate: "",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    successParam ? t("expenses.savedSuccess") : null
  );

  useEffect(() => {
    if (addParam) openAdd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edit modal state
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirm
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add expense modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addVendor, setAddVendor] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addCurrency, setAddCurrency] = useState(user?.homeCurrency || "USD");
  const [addDate, setAddDate] = useState(new Date().toISOString().split("T")[0]);
  const [addCategoryId, setAddCategoryId] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addReceiptKey, setAddReceiptKey] = useState<string | undefined>();
  const [addReceiptUrl, setAddReceiptUrl] = useState<string | undefined>();
  const [addReceiptUploading, setAddReceiptUploading] = useState(false);

  // Edit form state
  const [editVendor, setEditVendor] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editReceiptKey, setEditReceiptKey] = useState<string | undefined>();
  const [editReceiptUploading, setEditReceiptUploading] = useState(false);

  const loadExpenses = useCallback(
    async (p: number, f: FilterState) => {
      setLoading(true);
      try {
        const data = await getExpensesApi({
          page: p,
          limit: PAGE_SIZE,
          categoryId: f.categoryId || undefined,
          startDate: f.startDate || undefined,
          endDate: f.endDate || undefined,
        });
        setExpenses(data.data);
        setTotal(data.total);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    getCategoriesApi().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadExpenses(page, filters);
  }, [page, filters, loadExpenses]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  function openAdd() {
    setAddVendor("");
    setAddAmount("");
    setAddCurrency(user?.homeCurrency || "USD");
    setAddDate(new Date().toISOString().split("T")[0]);
    setAddCategoryId("");
    setAddNotes("");
    setAddReceiptKey(undefined);
    setAddReceiptUrl(undefined);
    setAddError(null);
    setAddOpen(true);
  }

  async function handleAddReceiptUpload(file: File) {
    setAddReceiptUploading(true);
    try {
      const result = await uploadReceiptApi(file);
      setAddReceiptKey(result.receiptImageKey);
      setAddReceiptUrl(result.receiptImageUrl);
    } catch {
      setAddError(t("expenses.errorUploadReceipt"));
    } finally {
      setAddReceiptUploading(false);
    }
  }

  async function handleAddSave() {
    if (!addVendor || !addAmount || !addDate) {
      setAddError(t("expenses.errorRequiredFields"));
      return;
    }
    setAddError(null);
    setAddLoading(true);
    try {
      const created = await createExpenseApi({
        vendor: addVendor,
        amount: addAmount,
        currency: addCurrency,
        date: addDate,
        categoryId: addCategoryId || undefined,
        receiptImageKey: addReceiptKey,
        notes: addNotes || undefined,
      });
      setExpenses((prev) => [created, ...prev]);
      setTotal((prev) => prev + 1);
      setAddOpen(false);
      setSuccessMessage(t("expenses.addedSuccess"));
    } catch (err: unknown) {
      setAddError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("expenses.errorAdd")
      );
    } finally {
      setAddLoading(false);
    }
  }

  async function handleEditReceiptUpload(file: File) {
    setEditReceiptUploading(true);
    try {
      const result = await uploadReceiptApi(file);
      setEditReceiptKey(result.receiptImageKey);
    } catch {
      setEditError(t("expenses.errorUploadReceiptGeneric"));
    } finally {
      setEditReceiptUploading(false);
    }
  }

  function openEdit(expense: Expense) {
    setEditExpense(expense);
    setEditVendor(expense.vendor);
    setEditAmount(expense.amount);
    setEditCurrency(expense.currency);
    setEditDate(expense.date ? expense.date.split("T")[0] : "");
    setEditCategoryId(expense.categoryId || "");
    setEditNotes(expense.notes || "");
    setEditReceiptKey(undefined);
    setEditError(null);
  }

  async function handleEditSave() {
    if (!editExpense) return;
    setEditError(null);
    setEditLoading(true);
    try {
      const updated = await updateExpenseApi(editExpense.id, {
        vendor: editVendor,
        amount: editAmount,
        currency: editCurrency,
        date: editDate,
        categoryId: editCategoryId || undefined,
        notes: editNotes || undefined,
        ...(editReceiptKey && { receiptImageKey: editReceiptKey }),
      } as CreateExpensePayload);
      setExpenses((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      setEditExpense(null);
    } catch (err: unknown) {
      setEditError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("expenses.errorUpdate")
      );
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteExpense) return;
    setDeleteLoading(true);
    try {
      await deleteExpenseApi(deleteExpense.id);
      setExpenses((prev) => prev.filter((e) => e.id !== deleteExpense.id));
      setTotal((prev) => prev - 1);
      setDeleteExpense(null);
    } catch {
      // ignore
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const categoryOptions = [
    { value: "", label: t("expenses.uncategorized") },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("expenses.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={openAdd}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t("expenses.addManually")}
          </Button>
          <Link href="/scan">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t("expenses.scanReceipt")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Success toast */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Filters & Compare toggles */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm text-[#3e6378] font-medium hover:text-[#325163]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {filtersOpen ? t("expenses.hideFilters") : t("expenses.showFilters")}
        </button>

        <button
          onClick={() => setCompareOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm text-[#3e6378] font-medium hover:text-[#325163]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
          </svg>
          {compareOpen ? t("expenses.hideCompare") : t("expenses.compareDateRanges")}
        </button>
      </div>

      {filtersOpen && (
        <ExpenseFilters
          categories={categories}
          value={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />
      )}

      {compareOpen && (
        <DateRangeComparison currency={user?.homeCurrency || "USD"} />
      )}

      {/* Expense list */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-gray-600 font-medium">{t("expenses.emptyTitle")}</p>
            <p className="text-gray-400 text-sm mt-1">
              {t("expenses.emptySubtitle")}
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
              onEdit={openEdit}
              onDelete={setDeleteExpense}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1 || loading}
          >
            {t("common.previous")}
          </Button>
          <span className="text-sm text-gray-600">
            {t("common.pageOf", { page, totalPages })}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || loading}
          >
            {t("common.next")}
          </Button>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t("expenses.modal.addTitle")}>
        <div className="flex flex-col gap-4">
          {addError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {addError}
            </div>
          )}
          <Input
            label={t("expenses.modal.vendorLabel")}
            value={addVendor}
            onChange={(e) => setAddVendor(e.target.value)}
            placeholder={t("expenses.modal.vendorPlaceholder")}
            disabled={addLoading}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("expenses.modal.amountLabel")}
              type="number"
              step="0.01"
              min="0"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="0.00"
              disabled={addLoading}
            />
            <Select
              label={t("expenses.modal.currencyLabel")}
              value={addCurrency}
              onChange={(e) => setAddCurrency(e.target.value)}
              options={CURRENCY_OPTIONS}
              disabled={addLoading}
            />
          </div>
          <Input
            label={t("expenses.modal.dateLabel")}
            type="date"
            value={addDate}
            onChange={(e) => setAddDate(e.target.value)}
            disabled={addLoading}
          />
          <Select
            label={t("expenses.modal.categoryLabel")}
            value={addCategoryId}
            onChange={(e) => setAddCategoryId(e.target.value)}
            options={categoryOptions}
            disabled={addLoading}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t("expenses.modal.notesLabel")} <span className="text-gray-400 font-normal">{t("common.optional")}</span></label>
            <textarea
              value={addNotes}
              onChange={(e) => setAddNotes(e.target.value)}
              rows={2}
              disabled={addLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a] disabled:bg-gray-100 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">{t("expenses.modal.receiptLabel")} <span className="text-gray-400 font-normal">{t("common.optional")}</span></label>
            {addReceiptUrl ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 font-medium">✓ {t("common.receiptAttached")}</span>
                <label className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 underline">
                  {t("common.replace")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={addReceiptUploading || addLoading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAddReceiptUpload(f);
                    }}
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 hover:border-[#578bab] hover:text-[#3e6378] transition-colors w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {addReceiptUploading ? t("common.uploading") : t("common.attachReceiptImage")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={addReceiptUploading || addLoading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAddReceiptUpload(f);
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setAddOpen(false)} disabled={addLoading} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddSave} loading={addLoading} disabled={addReceiptUploading} className="flex-1">
              {t("expenses.modal.saveExpense")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editExpense}
        onClose={() => setEditExpense(null)}
        title={t("expenses.modal.editTitle")}
      >
        {editExpense && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">{t("expenses.modal.receiptLabel")}</label>
              <div className="flex items-center gap-3">
                {(editExpense.receiptImageUrl && !editReceiptKey) && (
                  <a
                    href={editExpense.receiptImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#3e6378] hover:text-[#263e4e] font-medium"
                  >
                    {t("common.viewCurrent")}
                  </a>
                )}
                {editReceiptKey && (
                  <span className="text-sm text-green-600 font-medium">✓ {t("common.newReceiptAttached")}</span>
                )}
                <label className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 underline">
                  {editReceiptUploading ? t("common.uploading") : editExpense.receiptImageUrl ? t("common.replace") : t("common.attachReceipt")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={editReceiptUploading || editLoading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleEditReceiptUpload(f);
                    }}
                  />
                </label>
              </div>
            </div>
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {editError}
              </div>
            )}
            <Input
              label={t("expenses.modal.vendorLabel")}
              value={editVendor}
              onChange={(e) => setEditVendor(e.target.value)}
              disabled={editLoading}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("expenses.modal.amountLabel")}
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                disabled={editLoading}
              />
              <Select
                label={t("expenses.modal.currencyLabel")}
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                options={CURRENCY_OPTIONS}
                disabled={editLoading}
              />
            </div>
            <Input
              label={t("expenses.modal.dateLabel")}
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              disabled={editLoading}
            />
            <Select
              label={t("expenses.modal.categoryLabel")}
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              options={categoryOptions}
              disabled={editLoading}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{t("expenses.modal.notesLabel")}</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                disabled={editLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a] disabled:bg-gray-100 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setEditExpense(null)}
                disabled={editLoading}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleEditSave}
                loading={editLoading}
                className="flex-1"
              >
                {t("expenses.modal.saveChanges")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteExpense}
        onClose={() => setDeleteExpense(null)}
        title={t("expenses.modal.deleteTitle")}
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600 text-sm">
            {t("expenses.modal.deleteConfirm", { vendor: deleteExpense?.vendor })}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteExpense(null)}
              disabled={deleteLoading}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteLoading}
              className="flex-1"
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
