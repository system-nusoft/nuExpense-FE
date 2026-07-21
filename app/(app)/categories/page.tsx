"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "@/lib/services/categories.service";
import { Category } from "@/types";
import CategoryListItem from "@/components/categories/CategoryListItem";
import CategoryForm from "@/components/categories/CategoryForm";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function CategoriesPage() {
  const { t } = useTranslation();
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
      setError(t("categories.errorLoad"));
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
        showSuccess(t("categories.successUpdated"));
      } else {
        const created = await createCategoryApi(data);
        setCategories((prev) => [...prev, created]);
        showSuccess(t("categories.successCreated"));
      }
      setModalOpen(false);
      setEditCategory(null);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("categories.errorSave")
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(category: Category) {
    try {
      await deleteCategoryApi(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      showSuccess(t("categories.successDeleted"));
    } catch {
      setError(t("categories.errorDelete"));
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
          <h1 className="text-2xl font-bold text-gray-900">{t("categories.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("categories.count", { count: categories.length })}
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("categories.addCategory")}
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
          <button onClick={() => setError(null)} className="ms-2 underline">{t("common.dismiss")}</button>
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
          <Spinner size="lg" className="text-[#3e6378]" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-gray-600 font-medium">{t("categories.emptyTitle")}</p>
          <p className="text-gray-400 text-sm mt-1">
            {t("categories.emptySubtitle")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <CategoryListItem
              key={category.id}
              category={category}
              onEdit={openEdit}
              onDelete={handleDelete}
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
        title={editCategory ? t("categories.editTitle") : t("categories.newTitle")}
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
