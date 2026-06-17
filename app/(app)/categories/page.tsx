"use client";

import React, { useState, useEffect } from "react";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  reorderCategoriesApi,
} from "@/lib/services/categories.service";
import { Category } from "@/types";
import CategoryListItem from "@/components/categories/CategoryListItem";
import CategoryForm from "@/components/categories/CategoryForm";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const cats = await getCategoriesApi();
      setCategories(cats.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleSave(data: { name: string; color: string; icon?: string }) {
    setFormLoading(true);
    try {
      if (editCategory) {
        const updated = await updateCategoryApi(editCategory.id, data);
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        showSuccess("Category updated.");
      } else {
        const created = await createCategoryApi(data);
        setCategories((prev) => [...prev, created]);
        showSuccess("Category created.");
      }
      setModalOpen(false);
      setEditCategory(null);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save category."
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(category: Category) {
    try {
      await deleteCategoryApi(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      showSuccess("Category deleted.");
    } catch {
      setError("Failed to delete category.");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newList = [...categories];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newList.length) return;

    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];

    // Update sortOrder locally
    const updated = newList.map((cat, i) => ({ ...cat, sortOrder: i }));
    setCategories(updated);

    try {
      await reorderCategoriesApi(updated.map((c) => c.id));
    } catch {
      // revert on error
      loadCategories();
    }
  }

  function openCreate() {
    setEditCategory(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditCategory(category);
    setModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-gray-600 font-medium">No categories yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create categories to organize your expenses
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((category, index) => (
            <CategoryListItem
              key={category.id}
              category={category}
              onEdit={openEdit}
              onDelete={handleDelete}
              onMoveUp={() => handleMove(index, "up")}
              onMoveDown={() => handleMove(index, "down")}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditCategory(null);
        }}
        title={editCategory ? "Edit Category" : "New Category"}
      >
        <CategoryForm
          initial={editCategory || undefined}
          onSave={handleSave}
          onCancel={() => {
            setModalOpen(false);
            setEditCategory(null);
          }}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}
