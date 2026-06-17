"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getExpensesApi,
  updateExpenseApi,
  deleteExpenseApi,
  CreateExpensePayload,
} from "@/lib/services/expenses.service";
import { getCategoriesApi } from "@/lib/services/categories.service";
import { Expense, Category } from "@/types";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseFilters, {
  FilterState,
} from "@/components/expenses/ExpenseFilters";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
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
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");

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
  const [successMessage, setSuccessMessage] = useState(
    successParam ? "Expense saved successfully!" : null
  );

  // Edit modal state
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirm
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit form state
  const [editVendor, setEditVendor] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editNotes, setEditNotes] = useState("");

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

  function openEdit(expense: Expense) {
    setEditExpense(expense);
    setEditVendor(expense.vendor);
    setEditAmount(expense.amount);
    setEditCurrency(expense.currency);
    setEditDate(expense.date ? expense.date.split("T")[0] : "");
    setEditCategoryId(expense.categoryId || "");
    setEditNotes(expense.notes || "");
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
      } as CreateExpensePayload);
      setExpenses((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      setEditExpense(null);
    } catch (err: unknown) {
      setEditError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update expense."
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
    { value: "", label: "Uncategorized" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} expense{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/scan">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Expense
          </Button>
        </Link>
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

      {/* Filters toggle */}
      <div>
        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        {filtersOpen && (
          <div className="mt-3">
            <ExpenseFilters
              categories={categories}
              value={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

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
            <p className="text-gray-600 font-medium">No expenses found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters or scan a new receipt
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
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={!!editExpense}
        onClose={() => setEditExpense(null)}
        title="Edit Expense"
      >
        {editExpense && (
          <div className="flex flex-col gap-4">
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {editError}
              </div>
            )}
            <Input
              label="Vendor"
              value={editVendor}
              onChange={(e) => setEditVendor(e.target.value)}
              disabled={editLoading}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                disabled={editLoading}
              />
              <Input
                label="Currency"
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value.toUpperCase())}
                disabled={editLoading}
              />
            </div>
            <Input
              label="Date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              disabled={editLoading}
            />
            <Select
              label="Category"
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              options={categoryOptions}
              disabled={editLoading}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                disabled={editLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setEditExpense(null)}
                disabled={editLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                loading={editLoading}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteExpense}
        onClose={() => setDeleteExpense(null)}
        title="Delete Expense"
      >
        <div className="flex flex-col gap-4">
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete the expense from{" "}
            <strong>{deleteExpense?.vendor}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteExpense(null)}
              disabled={deleteLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteLoading}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
