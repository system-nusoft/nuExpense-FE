"use client";

import React, { useState } from "react";
import { Category } from "@/types";
import Button from "@/components/Button";

interface CategoryListItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryListItem({
  category,
  onEdit,
  onDelete,
}: CategoryListItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const iconDisplay =
    category.icon && !/[a-z]/.test(category.icon)
      ? category.icon
      : category.name[0]?.toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
      {/* Color swatch */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm"
        style={{ backgroundColor: category.color }}
      >
        {iconDisplay}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{category.name}</p>
        {category.budgetAmount && (
          <p className="text-xs text-gray-400 mt-0.5">
            Budget: {Number(category.budgetAmount).toLocaleString()} / month
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => onEdit(category)}>
          Edit
        </Button>

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                onDelete(category);
                setConfirmDelete(false);
              }}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}
