export interface User {
  id: string;
  email: string;
  name?: string;
  homeCurrency: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sortOrder: number;
  budgetAmount?: string | null;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId?: string;
  vendor: string;
  amount: string;
  currency: string;
  date: string;
  receiptImageUrl?: string;
  notes?: string;
  rawAiResponse?: unknown;
  createdAt: string;
  homeCurrencyAmount?: string;
  homeCurrencyCode?: string;
}

export interface ExpenseDraft {
  vendor: string;
  amount: string;
  currency: string;
  date: string;
  suggestedCategoryId?: string;
  receiptImageKey?: string;
  confidence?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface MonthlySummary {
  month: string; // "YYYY-MM"
  total: number;
  count: number;
}

export interface CategorySummary {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string | null;
  total: number;
  budgetAmount: number | null;
}
