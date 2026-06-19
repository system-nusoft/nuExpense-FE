"use client";

import React, { useState } from "react";
import { Category } from "@/types";
import Input from "@/components/Input";
import Button from "@/components/Button";

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#ef4444", // red
  "#14b8a6", // teal
  "#64748b", // slate
];

const PRESET_ICONS = [
  "🍔", "🚗", "🏠", "💊", "✈️", "🎮", "📚", "🛍️",
];

interface CategoryFormData {
  name: string;
  color: string;
  icon?: string;
  budgetAmount?: number | null;
}

interface CategoryFormProps {
  initial?: Category;
  onSave: (data: CategoryFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({
  initial,
  onSave,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || PRESET_COLORS[0]);
  const [icon, setIcon] = useState(initial?.icon || "");
  const [budgetAmount, setBudgetAmount] = useState(
    initial?.budgetAmount ? String(initial.budgetAmount) : ""
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    const parsed = budgetAmount ? parseFloat(budgetAmount) : null;
    if (budgetAmount && (isNaN(parsed!) || parsed! <= 0)) {
      setError("Budget must be a positive number.");
      return;
    }
    onSave({ name: name.trim(), color, icon: icon || undefined, budgetAmount: parsed });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Category Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Food & Dining"
        required
        disabled={loading}
      />

      {/* Color picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Color</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c
                  ? "border-gray-900 scale-110"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
          {/* Custom color picker */}
          <label className="relative w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-500">
            <span className="text-xs text-gray-500">+</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              aria-label="Custom color"
            />
          </label>
        </div>
        {/* Color preview */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-xs">{color}</span>
        </div>
      </div>

      {/* Icon selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Icon <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic === icon ? "" : ic)}
              className={`w-10 h-10 rounded-lg border-2 text-lg transition-all ${
                icon === ic
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              aria-label={`Select icon ${ic}`}
            >
              {ic}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIcon("")}
            className={`px-3 h-10 rounded-lg border-2 text-xs transition-all ${
              !icon
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            None
          </button>
        </div>
      </div>

      {/* Monthly budget */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Monthly Budget <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="number"
          min="0"
          step="any"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          placeholder="e.g. 50000"
          disabled={loading}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <p className="text-xs text-gray-400">Set a monthly spend limit for this category</p>
      </div>

      <div className="flex gap-3 pt-1">
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
          {initial ? "Update" : "Create"} Category
        </Button>
      </div>
    </form>
  );
}
