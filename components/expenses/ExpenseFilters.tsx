"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Category } from "@/types";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Button from "@/components/Button";

export interface FilterState {
  categoryId: string;
  startDate: string;
  endDate: string;
}

interface ExpenseFiltersProps {
  categories: Category[];
  value: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function ExpenseFilters({
  categories,
  value,
  onChange,
}: ExpenseFiltersProps) {
  const { t } = useTranslation();
  const [local, setLocal] = useState<FilterState>(value);

  const categoryOptions = [
    { value: "", label: t("expenses.filters.allCategories") },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  function handleApply() {
    onChange(local);
  }

  function handleClear() {
    const empty: FilterState = { categoryId: "", startDate: "", endDate: "" };
    setLocal(empty);
    onChange(empty);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label={t("expenses.filters.categoryLabel")}
          value={local.categoryId}
          onChange={(e) => setLocal((prev) => ({ ...prev, categoryId: e.target.value }))}
          options={categoryOptions}
        />
        <Input
          label={t("expenses.filters.fromDate")}
          type="date"
          value={local.startDate}
          onChange={(e) => setLocal((prev) => ({ ...prev, startDate: e.target.value }))}
        />
        <Input
          label={t("expenses.filters.toDate")}
          type="date"
          value={local.endDate}
          onChange={(e) => setLocal((prev) => ({ ...prev, endDate: e.target.value }))}
        />
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={handleApply}>
          {t("expenses.filters.apply")}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleClear}>
          {t("expenses.filters.clear")}
        </Button>
      </div>
    </div>
  );
}
